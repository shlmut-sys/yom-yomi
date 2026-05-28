# 📬 מערכת המייל היומי — מדריך התקנה מלא

המדריך מסביר איך להפעיל את **רשימת התפוצה** וה**שליחה האוטומטית היומית**, הכל בחינם.

> הטופס באתר כבר עובד. הוא שולח את המייל ל-endpoint שתגדיר ב-`index.html`:
> ```js
> window.YOMYOMI_SUBSCRIBE_URL = "https://yomyomi-list.YOURNAME.workers.dev/subscribe";
> ```
> כל עוד הוא ריק — הטופס נופל ל-mailto (נפתח חלון מייל). אחרי שתפרוס את ה-Worker, הדבק את ה-URL שם.

---

## 🗺️ סקירה כללית

```
המבקר → [טופס באתר] → POST /subscribe → [Cloudflare Worker] → [D1 database]
                                                                      │
כל יום 07:00 → [Cron Trigger] → בונה HTML של היום → [Brevo API] → 📬 כל הנרשמים
```

| רכיב | שירות | עלות |
|---|---|---|
| אחסון רשימה | Cloudflare D1 | חינם (5GB) |
| קוד שרת | Cloudflare Workers | חינם (100k/יום) |
| תזמון | Cloudflare Cron | חינם |
| שליחת מייל | Brevo | חינם (300/יום) |

---

## שלב 1 — חשבון Cloudflare + Wrangler

1. פתחו חשבון חינם ב-[cloudflare.com](https://cloudflare.com)
2. התקינו את כלי הפיתוח:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

## שלב 2 — מסד נתונים D1 (הרשימה)

```bash
wrangler d1 create yomyomi-list
```

זה ידפיס `database_id` — שמרו אותו ל-`wrangler.toml` (שלב 4).

צרו את הטבלה:
```bash
wrangler d1 execute yomyomi-list --command "CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, source TEXT, created_at INTEGER, active INTEGER DEFAULT 1, unsub_token TEXT);"
```

## שלב 3 — חשבון Brevo (שליחת המייל)

1. הירשמו חינם ב-[brevo.com](https://www.brevo.com)
2. **Settings → SMTP & API → API Keys** → צרו מפתח חדש (v3). העתיקו אותו.
3. **Senders** → אמתו את כתובת השולח שלכם (למשל `noreply@yomyomi.co.il` או הג'ימייל שלכם).

## שלב 4 — קבצי ה-Worker

צרו תיקייה `worker/` עם הקבצים הבאים (כולם מצורפים בתיקיית `worker/` שליד הקובץ הזה):

- `wrangler.toml` — הגדרות
- `src/index.js` — הקוד

ערכו את `wrangler.toml`:
```toml
name = "yomyomi-list"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "yomyomi-list"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"

[triggers]
crons = ["0 5 * * *"]   # 07:00 שעון ישראל (= 05:00 UTC)

[vars]
SITE_URL = "https://YOURUSER.github.io/yom-yomi/"
SENDER_EMAIL = "noreply@yomyomi.co.il"
SENDER_NAME = "יומיומי"
```

הגדירו את מפתח Brevo כסוד (לא בקוד!):
```bash
wrangler secret put BREVO_API_KEY
# הדביקו את המפתח כשמבקשים
```

## שלב 5 — פריסה

```bash
cd worker
wrangler deploy
```

תקבלו URL כמו `https://yomyomi-list.YOURNAME.workers.dev`.

**הדביקו אותו ב-`index.html`:**
```js
window.YOMYOMI_SUBSCRIBE_URL = "https://yomyomi-list.YOURNAME.workers.dev/subscribe";
```

זהו! מעכשיו:
- מבקרים שנרשמים נשמרים ב-D1
- כל בוקר ב-07:00 ה-Cron בונה מייל ושולח לכולם

---

## 🧪 בדיקות

```bash
# רשמו מייל ידנית
curl -X POST https://yomyomi-list.YOURNAME.workers.dev/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# הריצו את השליחה היומית עכשיו (בלי לחכות ל-Cron)
curl https://yomyomi-list.YOURNAME.workers.dev/send-now?key=SECRET

# כמה נרשמים יש?
wrangler d1 execute yomyomi-list --command "SELECT COUNT(*) FROM subscribers WHERE active=1;"
```

---

## 📱 ערוץ WhatsApp (חינם, ידני/חצי-אוטומטי)

אין שליחה המונית חינמית ב-WhatsApp. הפתרון החינמי הוא **ערוץ WhatsApp (Channel)**:

1. ב-WhatsApp → לשונית "עדכונים" → "+" → "צור ערוץ"
2. העתיקו את קישור ההזמנה
3. הדביקו ב-`index.html`:
   ```js
   window.YOMYOMI_WHATSAPP_URL = "https://whatsapp.com/channel/XXXXXXXXX";
   ```
4. כפתור "הצטרפו לערוץ הוואטסאפ" יופיע אוטומטית בכרטיס ההרשמה.

פרסום יומי לערוץ נעשה ידנית (או דרך WhatsApp Business API בתשלום).

---

## 🔁 חלופה ללא קוד בכלל — Brevo בלבד

אם אתם לא רוצים לתחזק Worker:

1. ב-Brevo → **Contacts → Forms** → צרו טופס הרשמה, קבלו קוד embed.
2. החליפו את ה-`<form class="nl-form">` ב-`index.html` בקוד ה-embed של Brevo.
3. ב-Brevo → **Campaigns → Automation** → צרו קמפיין יומי חוזר, הדביקו את ה-HTML של המייל.

פחות שליטה (המייל לא נבנה אוטומטית מהאתר), אבל אפס קוד ואפס תחזוקה.

---

## ⚖️ חוק הספאם (חשוב!)

- כל מייל **חייב** לכלול קישור הסרה (unsubscribe). ה-Worker המצורף מוסיף אותו אוטומטית.
- אל תוסיפו אנשים בלי הסכמתם.
- מומלץ double opt-in (מייל אישור לפני הוספה) — מוסבר בהערות שבקוד.
