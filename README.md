# 🕯️ יומיומי · Yom-Yomi

> **היום היהודי שלך, יום אחר יום.**
> אתר יהודי מתעדכן אוטומטית — תאריך עברי, זמני תפילה, יומא דהילולא, חיזוקים, חדשות תורניות, וכל מה שאתה צריך ליום-יום.

**Domain**: [yom-yomi.com](https://yom-yomi.com)
**Owner**: איתמר טיפליצקי · מעבדות שלימות · בית שמש

---

## ✨ מה יש בו

### תוכן יומי שמתחדש לבד
- 📜 **פרשת השבוע** + תאריך עברי + שעה + מזג אוויר מורחב
- ⏱️ **זמני היום** מלאים (עתים לבינה style) — כולל חצות לפי שיטת ברסלב/זוהר
- 📖 **לימוד יומי** — דף יומי, משנה, ירושלמי, רמב"ם, חפץ חיים, נ"ך
- ⏳ **בעיתה אחישנה** — ספירה לאחור חיה לאלף השישי
- 🌗 **תקופות + ליקויי לבנה וחמה**
- 🕯️ **יומא דהילולא** — 87 צדיקים לסיוון + היום בלוח השנה ממכלול
- ✨ **חיזוק יומי** — 403 חיזוקים מתורת ברסלב, גולל אוטומטית
- 📜 **מתורת ברסלב** מאתר iBreslev
- ⚖️ **3 הלכות יומיות** מורחבות
- 💎 **פתגם היום** מחכמי הספרדים (22 פתגמים)
- 📚 **ערכים בפרשת השבוע** ממכלול

### תוכן עולמי שנשלף אוטומטית
- 📺 **הדף היומי** — וידאו מהידברות
- 🌍 **קרוסלת מקומות לטייל** — תמונות מויקיפדיה + Google Maps
- 📚 **ספריית ברסלב** — 12 קטגוריות מ-breslevbooks.co.il
- 📷 **תמונת היום** + 💡 **הידעת?** ממכלול
- ⭐ **ערך מומלץ** ממכלול
- ✨ **ערכים חדשים** ממכלול
- 🌿 **בריאות** + 👨‍👩‍👧 **משפחה** + 🏺 **היסטוריה** מהידברות
- 🎵 **חדשות מוזיקה** מ-JDN + הַמְּנַגֵּן

### חוויית משתמש
- 🌓 **רקע לבן/כהה** עם טוגלר
- 🌐 **עברית / English** עם כפתור
- 📍 **זיהוי מיקום אוטומטי** (IP) + GPS מדויק
- 🎨 **23 פלטות צבעים** — כל כרטיס בצבע ייחודי
- ♿ **רספונסיבי מלא** (מובייל / טאבלט / דסקטופ)
- 🚀 **PWA** — ניתן להתקנה כאפליקציה
- 🔒 **פילטר תוכן** אוטומטי (סינון תוכן פוליטי/מדיני)

---

## 🤖 אוטומציה — אפס תחזוקה ידנית

האתר מתעדכן **לבד** בכל יום:

| מקור | תדירות | טריגר |
|---|---|---|
| מכלול (8 סקציות) | כל 6 שעות | + ניקוי בצאת הכוכבים |
| הידברות (4 קטגוריות) | כל 6 שעות | + ניקוי בצאת הכוכבים |
| מוזיקה (JDN + הַמְּנַגֵּן) | כל 6 שעות | + ניקוי בצאת הכוכבים |
| iBreslev RSS | כל 6 שעות | + ניקוי בצאת הכוכבים |
| ספרי ברסלב | כל 12 שעות | + ניקוי בצאת הכוכבים |
| מזג אוויר (Open-Meteo) | כל 30 דקות | זמן אמת |
| חיזוק יומי / פתגם / צדיקים | יומית | dayOfYear rotation |
| זמני יום | זמן אמת | kosher-zmanim |

**ברגע שמכלול / הידברות / RSS מעדכנים — האתר מעדכן את עצמו אוטומטית בצאת הכוכבים.**

---

## 🛠 ארכיטקטורה

**Pure static site** — אין שרת backend.

```
yom-yomi/
├── index.html                  # נקודת כניסה יחידה
├── manifest.json               # PWA
├── sw.js                       # Service Worker
├── favicon.svg
│
├── assets/
│   ├── css/
│   │   ├── main.css            # מייבא הכל
│   │   ├── tokens.css          # design tokens
│   │   ├── theme/              # 7 ערכות לימי השבוע + שבת + חג
│   │   ├── layout/             # header, hero, grid, footer
│   │   └── components/         # 24 קומפוננטות נפרדות
│   ├── js/
│   │   ├── app.js              # תזמורת
│   │   ├── core/               # state, i18n, utils, events
│   │   ├── data/               # loader, cache, content-filter
│   │   ├── time/               # hebrew-date, zmanim
│   │   ├── location/           # ip-locate, gps, cities
│   │   ├── modules/            # 24 מודולי כרטיסים עצמאיים
│   │   └── ui/                 # theme, modal, toast, city-picker
│   └── fonts/                  # Assistant (Heebo backup)
│
└── data/
    ├── tzadikim/sivan.json     # 87 צדיקים לסיוון (יורחב)
    ├── breslov/likutei.json    # 403 חיזוקים מקובץ Word
    ├── pitgamim/sephardi.json  # 22 פתגמי חכמי הספרדים
    ├── halacha/daily.json      # 36 הלכות (12 קבוצות של 3)
    └── travel/destinations.json # יעדי טיול
```

**100% ES Modules · אין build step · עובד מקבצים סטטיים בלבד.**

---

## 🌐 Stack חיצוני (כל חינמי)

| שירות | תפקיד |
|---|---|
| **Cloudflare Pages** | אחסון + CDN עולמי |
| **Cloudflare DNS** | yom-yomi.com |
| [kosher-zmanim](https://github.com/BehindTheMath/KosherZmanim) | זמני תפילה הלכתיים |
| [@hebcal/core](https://github.com/hebcal/hebcal-es6) | תאריך עברי + פרשה |
| [@hebcal/learning](https://github.com/hebcal/hebcal-learning) | לימוד יומי |
| [Open-Meteo](https://open-meteo.com/) | מזג אוויר (חינמי, ללא API key) |
| [ipapi.co](https://ipapi.co/) | זיהוי מיקום מ-IP |
| [api.allorigins.win](https://allorigins.win/) | CORS proxy ל-RSS |
| [hamichlol.org.il](https://hamichlol.org.il) | תוכן יהודי מתחדש (8 סקציות) |
| [hidabroot.org](https://hidabroot.org) | דף יומי, בריאות, משפחה |
| [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) | תמונות + תוכן יעדי טיול |

---

## 🚀 פיתוח מקומי

```bash
# Clone
git clone https://github.com/shlemoot/yom-yomi.git
cd yom-yomi

# Run any static server (PWA needs http://, not file://)
python -m http.server 8765
# Then visit: http://localhost:8765
```

---

## 📦 פריסה (Deployment)

האתר פרוס אוטומטית ב-**Cloudflare Pages** מחובר ל-repository הזה.

**כל push ל-`main` → deploy אוטומטי תוך 30 שניות.**

הגדרות build:
- Framework: None
- Build command: (ריק)
- Output directory: `/`

---

## 🔮 רעיונות עתידיים

- [ ] להוסיף 11 חודשי צדיקים שחסרים
- [ ] חיפוש סמנטי (Claude API)
- [ ] Push notifications (OneSignal)
- [ ] Streak system (כמו Duolingo)
- [ ] Daily Card לשיתוף בוואטסאפ
- [ ] חשבון אישי + לוח הילולא משפחתי
- [ ] תרומות לעילוי נשמה (PayBox/Bit)
- [ ] AI Chat "שאל את הרב"
- [ ] אפליקציית מובייל (Capacitor)

---

## 📝 רישיון

**© כל הזכויות שמורות למעבדות שלימות · בית שמש · ישראל**
© All rights reserved to Studio Shlemut Labs · Bet Shemesh · Israel
