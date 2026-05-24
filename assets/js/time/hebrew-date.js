/* יומיומי · time/hebrew-date.js
   Hebrew date + day context (omer, chanukah, rosh chodesh, chag).
   Wraps hebcal-core. */

import { HEBMONTH_TO_KEY } from '../core/utils.js';

/* Returns Hebcal HDate for given JS date in city timezone */
export function getHDate(now, city) {
  if (typeof hebcal === 'undefined' || !hebcal.HDate) return null;
  const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
  return new hebcal.HDate(cityDate);
}

/* Compute rich day context: shabbat, chag, omer, etc. */
export function getDayContext(now, city, hdate) {
  const ctx = {
    isShabbat: false, isErevShabbat: false, isShabbatActive: false,
    isChag: false, isErevChag: false, isCholHamoed: false,
    isYomKippur: false, isPurim: false, isFast: false,
    isRoshChodesh: false, isChanukah: false, chanukahNight: null,
    isOmer: false, omerDay: null, chagName: null
  };

  if (typeof hebcal === 'undefined' || !hdate) return ctx;
  try {
    const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
    const day = cityDate.getDay();
    ctx.isShabbat = day === 6;
    ctx.isErevShabbat = day === 5;

    const events = hebcal.HebrewCalendar.getHolidaysOnDate(hdate, true) || [];
    const CHAG = 0x01, EREV = 0x100000, ROSH_CHODESH = 0x4, OMER = 0x80,
          CHOL_HAMOED = 0x40, CHANUKAH = 0x40000, MAJOR_FAST = 0x4000;
    for (const ev of events) {
      const flags = ev.getFlags ? ev.getFlags() : 0;
      const desc = ev.getDesc ? ev.getDesc() : '';
      if (flags & CHAG) {
        ctx.isChag = true;
        try { ctx.chagName = ev.render('he-x-NoNikud') || desc; } catch {}
      }
      if (flags & EREV) {
        ctx.isErevChag = true;
        if (!ctx.chagName) {
          try { ctx.chagName = ev.render('he-x-NoNikud') || desc; } catch {}
        }
      }
      if (flags & ROSH_CHODESH) ctx.isRoshChodesh = true;
      if (flags & CHOL_HAMOED) ctx.isCholHamoed = true;
      if (flags & CHANUKAH) {
        ctx.isChanukah = true;
        const m = desc.match(/Chanukah:\s*(\d)/);
        if (m) ctx.chanukahNight = parseInt(m[1], 10);
      }
      if (flags & MAJOR_FAST) ctx.isFast = true;
      if (flags & OMER) {
        ctx.isOmer = true;
        const m = desc.match(/Omer\s+(\d+)/);
        if (m) ctx.omerDay = parseInt(m[1], 10);
      }
      if (desc === 'Yom Kippur') { ctx.isYomKippur = true; ctx.isChag = true; }
      if (desc === 'Purim') ctx.isPurim = true;
    }

    // Hebrew month key for daily theme
    try {
      const m = hdate.getMonthName('en');
      ctx.monthKey = HEBMONTH_TO_KEY[m] || m.toLowerCase();
      ctx.hdayNum = hdate.getDate();
    } catch {}
  } catch (e) {
    console.warn('[hebrew-date] context err', e);
  }
  return ctx;
}

/* Parsha name (he + en) for upcoming Shabbat */
const PARSHA_HE = {
  'Bereshit':'בראשית','Noach':'נח','Lech-Lecha':'לך לך','Vayera':'וירא',
  'Chayei Sara':'חיי שרה','Toldot':'תולדות','Vayetzei':'ויצא','Vayishlach':'וישלח',
  'Vayeshev':'וישב','Miketz':'מקץ','Vayigash':'ויגש','Vayechi':'ויחי',
  'Shemot':'שמות','Vaera':'וארא','Bo':'בא','Beshalach':'בשלח',
  'Yitro':'יתרו','Mishpatim':'משפטים','Terumah':'תרומה','Tetzaveh':'תצוה',
  'Ki Tisa':'כי תשא','Vayakhel':'ויקהל','Pekudei':'פקודי',
  'Vayikra':'ויקרא','Tzav':'צו','Shmini':'שמיני','Tazria':'תזריע',
  'Metzora':'מצורע','Achrei Mot':'אחרי מות','Kedoshim':'קדושים','Emor':'אמור',
  'Behar':'בהר','Bechukotai':'בחקתי',
  'Bamidbar':'במדבר','Nasso':'נשא',"Beha'alotcha":'בהעלותך',
  "Sh'lach":'שלח','Korach':'קרח','Chukat':'חוקת','Balak':'בלק',
  'Pinchas':'פנחס','Matot':'מטות','Masei':'מסעי',
  'Devarim':'דברים','Vaetchanan':'ואתחנן','Eikev':'עקב',"Re'eh":'ראה',
  'Shoftim':'שופטים','Ki Teitzei':'כי תצא','Ki Tavo':'כי תבוא','Nitzavim':'נצבים',
  'Vayeilech':'וילך',"Ha'azinu":'האזינו',"V'Zot HaBerachah":'וזאת הברכה'
};

export function getParsha(hdate) {
  if (!hdate || typeof hebcal === 'undefined') return null;
  try {
    let saturday = hdate;
    while (saturday.getDay() !== 6) saturday = saturday.add(1, 'd');
    const sedra = hebcal.HebrewCalendar.getSedra(saturday.getFullYear(), true);
    const result = sedra.lookup(saturday);
    if (result && result.parsha && result.parsha.length) {
      return {
        he: result.parsha.map(p => PARSHA_HE[p] || p).join(' · '),
        en: result.parsha.join(' · ')
      };
    }
  } catch (e) {
    console.warn('[hebrew-date] parsha err', e);
  }
  return null;
}
