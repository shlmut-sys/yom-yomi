/* יומיומי · core/i18n.js — Hebrew / English */

import { state } from './state.js';

const STRINGS = {
  he: {
    tag: 'היום היהודי שלך',
    yahrzeitTitle: 'יומא דהילולא',
    yahrzeitEmpty: 'אין צדיק רשום ליום זה',
    breslovTitle: 'חיזוק יומי',
    breslovSub: 'רבי נחמן מברסלב',
    breslovTag: '"מצוה גדולה להיות בשמחה תמיד"',
    halachaTitle: 'הלכה יומית',
    halachaSub: 'שתי הלכות לכל יום',
    pitgamTitle: 'פתגם היום',
    pitgamSub: 'מפי חכמי הספרדים',
    historyTitle: 'ביום הזה בהיסטוריה',
    historyEmpty: 'אין מאורעות זמינים',
    travelTitle: 'מקום לטייל בעולם',
    travelSub: 'היעד היומי',
    zmanimTitle: 'זמני היום',
    zmanimSub: 'לוח עתים לבינה',
    sixthMilTitle: 'עד האלף השישי',
    sixthMilSub: 'ספירה לאחור לראש השנה ה\'ת"ש',
    smYears: 'שנים', smMonths: 'חודשים', smDays: 'ימים',
    smHours: 'שעות', smMins: 'דקות', smSecs: 'שניות',
    smNote: '"וביום ההוא יהיה ה\' אחד ושמו אחד"',
    potdTitle: 'תמונת היום',
    dykTitle: 'הידעת?',
    newsTitle: 'חדשות ואקטואליה',
    featuredTitle: 'ערך מומלץ',
    hebCalTitle: 'היום בלוח השנה',
    newArtTitle: 'ערכים חדשים מבית המכלול',
    parshaArtTitle: 'ערכים בפרשת השבוע',
    hmSource: 'מתוך אתר המכלול',
    dafYomiTitle: 'הדף היומי',
    healthTitle: 'בריאות',
    familyTitle: 'משפחה',
    historyArtTitle: 'היסטוריה וארכיאולוגיה',
    hbSource: 'מאתר הידברות',
    ibreslevTitle: 'מתורת ברסלב',
    ibreslevSub: 'תוכן יומי מאתר iBreslev',
    musicTitle: 'חדשות מוזיקה',
    musicSub: 'מאתר המנגן מיוזיק',
    breslevBooksTitle: 'ספריית ברסלב',
    breslevBooksSub: 'קטגוריות מובחרות · breslevbooks.co.il',
    tekLunTitle: 'תקופות וליקויים',
    tekLunSub: 'תקופה הקרובה · ליקוי הקרוב',
    tekufotShort: 'תקופה קרובה',
    lunarShort: 'ליקוי קרוב',
    yahrzeitMergedTitle: 'היום בלוח השנה · יומא דהילולא',
    yahrzeitToday: 'צדיקים שנפטרו היום:',
    weatherExtTitle: 'מזג האוויר היום',
    weatherExtSub: 'תחזית מורחבת',
    learningTitle: 'לימוד יומי',
    learningSub: 'דף יומי · משנה · ירושלמי · רמב"ם · חפץ חיים · נ"ך',
    tekufotTitle: 'תקופות',
    tekufotSub: 'תשרי · טבת · ניסן · תמוז',
    lunarTitle: 'ליקויי לבנה וחמה',
    lunarSub: 'הליקוי הבא',
    showMore: 'הצג עוד',
    showLess: 'הצג פחות',
    wikiLink: 'לערך המלא בויקיפדיה',
    rights: 'כל הזכויות שמורות ל',
    rightsAll: 'כל הזכויות שמורות למעבדות שלימות',
    labLocation: 'בית שמש · ישראל',
    lab: 'מעבדות שלימות · בית שמש',
    loading: 'טוען...',
    parashatLabel: 'פרשת',
    dayLabel: 'יום',

    days: ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'],
    gregMonths: ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
  },

  en: {
    tag: 'Your Jewish day',
    yahrzeitTitle: 'Yahrzeit · Tzaddikim',
    yahrzeitEmpty: 'No records for today',
    breslovTitle: 'Daily Chizuk',
    breslovSub: 'Rabbi Nachman of Breslov',
    breslovTag: '"It is a great mitzvah to be happy always"',
    halachaTitle: 'Daily Halacha',
    halachaSub: 'Two halachot per day',
    pitgamTitle: 'Saying of the Day',
    pitgamSub: 'From our Sages',
    historyTitle: 'On This Day in History',
    historyEmpty: 'No events available',
    travelTitle: 'Place to Travel',
    travelSub: 'Daily Destination',
    zmanimTitle: 'Daily Times',
    zmanimSub: 'Etim L\'Bina Calendar',
    sixthMilTitle: 'Until the 6th Millennium',
    sixthMilSub: 'Countdown to Rosh Hashanah 6000',
    smYears: 'years', smMonths: 'months', smDays: 'days',
    smHours: 'hours', smMins: 'minutes', smSecs: 'seconds',
    smNote: '"On that day Hashem shall be One and His Name One"',
    potdTitle: 'Picture of the Day',
    dykTitle: 'Did You Know?',
    newsTitle: 'News & Current Events',
    featuredTitle: 'Featured Article',
    hebCalTitle: 'Today in the Hebrew Calendar',
    newArtTitle: 'New Articles from HaMichlol',
    parshaArtTitle: 'Articles for this Week\'s Parsha',
    hmSource: 'Source: HaMichlol',
    dafYomiTitle: 'Daf Yomi',
    healthTitle: 'Health',
    familyTitle: 'Family',
    historyArtTitle: 'History & Archaeology',
    hbSource: 'Source: Hidabroot',
    ibreslevTitle: 'Breslev Teachings',
    ibreslevSub: 'Daily content from iBreslev',
    musicTitle: 'Music News',
    musicSub: 'From Hamenagen Music',
    breslevBooksTitle: 'Breslev Library',
    breslevBooksSub: 'Featured categories · breslevbooks.co.il',
    tekLunTitle: 'Seasons & Eclipses',
    tekLunSub: 'Next Tekufa · Next Eclipse',
    tekufotShort: 'Next Tekufa',
    lunarShort: 'Next Eclipse',
    yahrzeitMergedTitle: 'Today in the Hebrew Calendar · Yahrzeit',
    yahrzeitToday: 'Tzaddikim who passed today:',
    weatherExtTitle: 'Today\'s Weather',
    weatherExtSub: 'Extended forecast',
    learningTitle: 'Daily Learning',
    learningSub: 'Daf Yomi · Mishna · Yerushalmi · Rambam · Chofetz Chaim · Nach',
    tekufotTitle: 'Seasons (Tekufot)',
    tekufotSub: 'Tishrei · Tevet · Nisan · Tamuz',
    lunarTitle: 'Lunar & Solar Eclipses',
    lunarSub: 'Next Eclipse',
    showMore: 'Show more',
    showLess: 'Show less',
    wikiLink: 'Full article on Wikipedia',
    rights: '© All rights reserved to ',
    rightsAll: '© All rights reserved to Studio Shlemut Labs',
    labLocation: 'Bet Shemesh · Israel',
    lab: 'Studio Shlemut Labs · Bet Shemesh',
    loading: 'Loading...',
    parashatLabel: 'Parashat',
    dayLabel: '',

    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    gregMonths: ['January','February','March','April','May','June','July','August','September','October','November','December']
  }
};

export function t(key) {
  const lang = state.get('lang') || 'he';
  return STRINGS[lang]?.[key] ?? STRINGS.he[key] ?? key;
}

export function getLang() { return state.get('lang') || 'he'; }

export function setLang(lang) {
  if (lang !== 'he' && lang !== 'en') return;
  state.set('lang', lang);
  applyTranslations();
  document.dispatchEvent(new CustomEvent('yomyomi:langchange', { detail: { lang } }));
}

export function toggleLang() {
  setLang(getLang() === 'he' ? 'en' : 'he');
}

export function applyTranslations() {
  const lang = getLang();
  document.body.setAttribute('data-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  for (const node of document.querySelectorAll('[data-i18n]')) {
    const key = node.getAttribute('data-i18n');
    const val = t(key);
    if (val) node.textContent = val;
  }

  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.querySelector('.lang-current').textContent = lang === 'he' ? 'EN' : 'עב';
  }
}

export function initI18n() {
  applyTranslations();
  const btn = document.getElementById('langToggle');
  if (btn) btn.addEventListener('click', toggleLang);
}
