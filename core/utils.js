/* יומיומי · core/utils.js — pure helpers, no DOM */

export const pad = (n) => String(n).padStart(2, '0');

export function escapeHTML(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

export function stripHTML(s) {
  if (!s) return '';
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

export function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/* Manual gematriya — used when hebcal isn't ready */
const GEM_LETTERS = [
  [400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],
  [90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],
  [30,'ל'],[20,'כ'],[10,'י'],
  [9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']
];
export function gematriya(num) {
  if (typeof hebcal !== 'undefined' && hebcal.gematriya) {
    try { return hebcal.gematriya(num); } catch {}
  }
  if (typeof num !== 'number') return String(num);
  let n = num >= 1000 ? num % 1000 : num;
  let result = '';
  for (const [val, ch] of GEM_LETTERS) {
    while (n >= val) {
      if (n === 15) { result += 'טו'; n = 0; break; }
      if (n === 16) { result += 'טז'; n = 0; break; }
      result += ch;
      n -= val;
    }
  }
  if (result.length === 1) result += '׳';
  else if (result.length >= 2 && !result.includes('"') && !result.includes('׳')) {
    result = result.slice(0,-1) + '"' + result.slice(-1);
  }
  return result;
}

/* Format city local time HH:MM[:SS] */
export function fmtTime(date, tz, withSeconds = false) {
  try {
    const opts = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz };
    if (withSeconds) opts.second = '2-digit';
    return new Intl.DateTimeFormat('en-GB', opts).format(date);
  } catch { return null; }
}

export function fmtHHMM(date, tz) {
  return fmtTime(date, tz, false);
}

/* Convert kosher-zmanim / luxon DateTime to JS Date */
export function toJsDate(dt) {
  if (!dt) return null;
  if (dt.toJSDate) return dt.toJSDate();
  if (dt instanceof Date) return dt;
  if (typeof dt === 'string') {
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/* Debounce a function */
export function debounce(fn, ms = 200) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* Safe-async wrapper: returns [data, err] */
export async function safeAwait(promise) {
  try {
    return [await promise, null];
  } catch (err) {
    return [null, err];
  }
}

/* Hebrew month name -> internal key */
export const HEBMONTH_TO_KEY = {
  'Nisan':'nisan','Iyyar':'iyyar','Sivan':'sivan','Tamuz':'tamuz',
  'Av':'av','Elul':'elul','Tishrei':'tishrei','Cheshvan':'cheshvan',
  'Kislev':'kislev','Tevet':'tevet',"Sh'vat":'shvat','Shvat':'shvat',
  'Adar':'adar','Adar I':'adar','Adar II':'adar2','Adar1':'adar','Adar2':'adar2'
};
export const HEBMONTH_HE = {
  'nisan':'ניסן','iyyar':'אייר','sivan':'סיוון','tamuz':'תמוז',
  'av':'אב','elul':'אלול','tishrei':'תשרי','cheshvan':'חשוון',
  'kislev':'כסלו','tevet':'טבת','shvat':'שבט','adar':'אדר','adar2':'אדר ב׳'
};
export const HEBMONTH_EN = {
  'nisan':'Nisan','iyyar':'Iyar','sivan':'Sivan','tamuz':'Tamuz',
  'av':'Av','elul':'Elul','tishrei':'Tishrei','cheshvan':'Cheshvan',
  'kislev':'Kislev','tevet':'Tevet','shvat':'Shevat','adar':'Adar','adar2':'Adar II'
};
