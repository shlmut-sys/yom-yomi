# 🕯️ יומיומי · Yom-Yomi

> **היום היהודי שלך, יום אחר יום.**

אתר יהודי מתעדכן אוטומטית — תאריך עברי, זמני תפילה, יומא דהילולא, חיזוק יומי מרבי נחמן, הלכה, פתגם, ועוד.

---

## 🎨 הרידיזיין החדש (Black + Gold)

האתר עבר רידיזיין מלא בסגנון **Studio Shlemut AI** — שחור עמוק, זהב חמים, מבטאי RGB ניאון.

### 4 אווירות מתחלפות

האתר מציג **רקע שמתחלף אוטומטית כל 5 דקות** בין 4 אווירות:

| | אווירה | אופי |
|---|---|---|
| 🌌 | **לילה** (`night`) | שחור עמוק + ספירות זהב/סגול + כוכבים |
| 🕯️ | **נרות** (`candles`) | שחור חמים + להבות אמבר מהבהבות |
| 🌠 | **זוהר צפוני** (`aurora`) | וילונות ירוק/תכלת/סגול נעים |
| 🌅 | **שחר** (`dawn`) | סגול עמוק → זריחה זהובה |

- **לכבות התחלפות אוטומטית:** כפתור `AUTO` בכותרת.
- **לבחור אווירה ידנית:** ארבע נקודות צבעוניות בכותרת.
- ההעדפות נשמרות ב-`localStorage`.

### תכונות "חיות" נוספות
- לוגו זהב עם float-אנימציה מדורגת על כל אות
- Cursor מותאם בצבעי RGB (חתימת Studio Shlemut)
- Film grain + scan-line דק
- כרטיסי זכוכית עם מסגרת גרדיאנט שמתחזקת ב-hover
- ספירה לאחור (האלף השישי) זוהרת בזהב

---

## 📁 מבנה

```
site/
├── index.html                     # נקודת כניסה
├── manifest.json                  # PWA
├── favicon.svg
├── sw.js                          # service worker
├── assets/
│   ├── css/
│   │   ├── main.css               # CSS מקורי (לא נגענו)
│   │   ├── redesign.css           # ★ שכבת הרידיזיין
│   │   ├── redesign-moods.css     # ★ 4 התמות המתחלפות
│   │   ├── tokens.css, reset.css, fonts.css
│   │   ├── layout/, components/, theme/
│   ├── js/
│   │   ├── app.js                 # main entry (ES module)
│   │   ├── ui/mood-rotator.js     # ★ rotator + cursor + UI
│   │   ├── core/, data/, modules/, time/, location/, ui/
│   └── fonts/                     # Assistant family
└── data/                          # JSON locals (ברסלב, הלכה, פתגמים, צדיקים)
```

★ = נוספו ברידיזיין

---

## 🚀 העלאה ל-GitHub Pages

1. דחוף את כל תיקיית `site/` ל-repo (או את כל התוכן שלה ל-root).
2. ב-Settings → Pages: בחר branch + folder (`/` או `/site` בהתאם).
3. האתר עולה.

**הערה חשובה:** התצוגה המקדימה כאן עלולה להציג "טוען..." בכרטיסים שמושכים API חיצוני (Hebcal, Hidabroot, ipapi וכו') בגלל מגבלות iframe — **בגיט הב פייג'ס זה יעבוד בצורה תקינה**.

---

## 🛠️ ערכים שכדאי להכיר

### החלפת ברירת המחדל בין כהה/בהיר
ב-`assets/js/app.js` שורה ~161:
```js
applyTone(savedTone === 'light' ? 'light' : 'dark');  // ברירת מחדל: dark
```

### שינוי תזמון התחלפות האווירה
ב-`assets/js/ui/mood-rotator.js`:
```js
const ROTATE_MS = 5 * 60 * 1000; // 5 דקות → שנה לערך אחר
```

### הוספת אווירה חדשה
1. ב-`redesign-moods.css` הוסף בלוק `body[data-mood="newName"] { ... }`
2. ב-`mood-rotator.js` הוסף ל-`MOODS` ו-`LABELS`
3. ב-`redesign.css` הוסף `.mood-dot[data-mood="newName"]` עם צבע

---

## 👤 קרדיט

- **תוכן ולוגיקה:** איתמר טיפליצקי · מעבדות שלימות
- **ספרי קוד עזר:** kosher-zmanim, @hebcal/core, @hebcal/learning
- **רידיזיין:** Studio Shlemut AI Design System (black + gold + RGB)

© כל הזכויות שמורות למעבדות שלימות · בית שמש · ישראל
