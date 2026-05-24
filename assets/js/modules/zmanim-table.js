/* יומיומי · modules/zmanim-table.js
   Full zmanim shown in a responsive grid — no toggle. */

import { state } from '../core/state.js';
import { getLang } from '../core/i18n.js';
import { fmtHHMM, toJsDate } from '../core/utils.js';
import { buildZmanim, getCandleTime, getHavdalahTime } from '../time/zmanim.js';

/* All zmanim shown — grouped into 3 sections (morning / afternoon / night) */
const SECTIONS = [
  {
    title: { he: 'בוקר', en: 'Morning' },
    items: [
      ['alot72',         'עלות השחר (72 ד׳)',  'Alot (72m)'],
      ['alotHaShachar',  'עלות השחר',         'Alot HaShachar'],
      ['misheyakir',     'משיכיר',             'Misheyakir'],
      ['sunrise',        'הנץ החמה',          'Sunrise'],
      ['sofZmanShmaMGA', 'סוף ק"ש מג"א',      'Shema (MGA)'],
      ['sofZmanShma',    'סוף ק"ש גר"א',      'Shema (GRA)'],
      ['sofZmanTfilaMGA','סוף תפילה מג"א',    'Tefila (MGA)'],
      ['sofZmanTfila',   'סוף תפילה גר"א',    'Tefila (GRA)']
    ]
  },
  {
    title: { he: 'צהריים ואחה"צ', en: 'Afternoon' },
    items: [
      ['chatzot',        'חצות היום',          'Halachic Noon'],
      ['minchaGedola',   'מנחה גדולה',         'Mincha Gedola'],
      ['minchaKetana',   'מנחה קטנה',          'Mincha Ketana'],
      ['plagHamincha',   'פלג המנחה',          'Plag HaMincha']
    ]
  },
  {
    title: { he: 'ערב ולילה', en: 'Evening & Night' },
    items: [
      ['sunset',              'שקיעה',                       'Sunset'],
      ['tzais',               'צאת הכוכבים',                'Tzeit Hakochavim'],
      ['tzais85',             'צאת הכוכבים — גאונים',      'Tzeit Geonim 8.5'],
      ['tzais72',             'צאת — ר"ת 72 ד׳',            'Rabbeinu Tam 72'],
      ['chatzotLailaBreslov', 'חצות לילה — שיטת ברסלב',     'Chatzot — Breslov']
    ]
  }
];

export const ZmanimTableModule = {
  name: 'zmanim-table',

  render() {
    const city = state.get('city');
    if (!city) return;

    const z = buildZmanim(new Date(), city);
    if (!z) return;

    const sub = document.getElementById('zmanimSub');
    if (sub) {
      const lang = getLang();
      sub.textContent = lang === 'he'
        ? `לוח עתים לבינה · ${city.he}`
        : `Halachic times · ${city.en}`;
    }

    this.renderGrid(z, city);
  },

  renderGrid(z, city) {
    const root = document.getElementById('zmanimGrid');
    if (!root) return;
    const lang = getLang();
    const ctx = state.get('ctx') || {};

    let html = '';
    for (const section of SECTIONS) {
      html += `<div class="zg-section">
        <h3 class="zg-section-title">${section.title[lang]}</h3>
        <div class="zg-cells">`;
      for (const [k, he, en] of section.items) {
        const d = toJsDate(z[k]);
        if (!d) continue;
        html += `<div class="zg-cell">
          <div class="zg-name">${lang === 'he' ? he : en}</div>
          <div class="zg-time">${fmtHHMM(d, city.tz)}</div>
        </div>`;
      }
      html += `</div></div>`;
    }

    // Candle / Havdalah section if relevant
    if (ctx.isErevShabbat || ctx.isErevChag || ctx.isShabbat || ctx.isChag) {
      const candle = (ctx.isErevShabbat || ctx.isErevChag) ? getCandleTime(z, state.get('cityKey')) : null;
      const havd = (ctx.isShabbat || ctx.isChag) ? getHavdalahTime(z) : null;
      html += `<div class="zg-section zg-section-special">
        <h3 class="zg-section-title">${lang === 'he' ? 'שבת / חג' : 'Shabbat / Chag'}</h3>
        <div class="zg-cells">`;
      if (candle) {
        html += `<div class="zg-cell zg-special">
          <div class="zg-name">${lang === 'he' ? 'הדלקת נרות' : 'Candle Lighting'}</div>
          <div class="zg-time">${fmtHHMM(candle, city.tz)}</div>
        </div>`;
      }
      if (havd) {
        html += `<div class="zg-cell zg-special">
          <div class="zg-name">${lang === 'he' ? 'צאת השבת/חג' : 'Shabbat/Chag Ends'}</div>
          <div class="zg-time">${fmtHHMM(havd, city.tz)}</div>
        </div>`;
      }
      html += `</div></div>`;
    }

    root.innerHTML = html;
  }
};
