/* יומיומי · modules/halacha.js
   Two halachot per day. */

import { getLang } from '../core/i18n.js';
import { dayOfYear, escapeHTML } from '../core/utils.js';
import { loadHalachaDaily } from '../data/loader.js';

const FALLBACK = [
  [
    { he: 'מצווה לקדש בכניסת השבת על היין, ולומר "ויכולו" ו"בורא פרי הגפן" ו"מקדש השבת".', src: 'שו"ע או"ח רעא' },
    { he: 'צריך להזהר שלא לדבר דברי חול בשבת, אלא רק דברי תורה ושמחה.', src: 'שו"ע או"ח שז' },
    { he: 'מצווה לבצוע על שתי ככרות לחם בכל סעודה משלוש סעודות השבת.', src: 'שו"ע או"ח רעד' }
  ],
  [
    { he: 'יש לבדוק את הציציות לפני התפילה כדי שיהיו שלמות.', src: 'שו"ע או"ח ח' },
    { he: 'מצוה לעמוד מפני זקן בן שבעים שנה.', src: 'שו"ע יו"ד רמד' }
  ],
  [
    { he: 'ברכת אשר יצר נאמרת אחר היציאה משירותים, ויש להזהר שלא לדבר באמצעה.', src: 'שו"ע או"ח ז' },
    { he: 'בקריאת שמע יש לכוון בפסוק ראשון לקבל עליו עול מלכות שמים.', src: 'שו"ע או"ח ס' }
  ],
  [
    { he: 'יש לברך "המוציא" על לחם בכל סעודה שאוכלים פת.', src: 'שו"ע או"ח קסז' },
    { he: 'מצוה לברך ברכת המזון בנחת ובכוונה.', src: 'שו"ע או"ח קפג' }
  ],
  [
    { he: 'בליל שבת קודש מצוה לאכול שלוש סעודות.', src: 'שו"ע או"ח רצא' },
    { he: 'מצוה להאריך בסעודת שבת ולומר בה דברי תורה.', src: 'שו"ע או"ח רצ' }
  ],
  [
    { he: 'לפני התפילה צריך ליטול ידיים, לפנות הגוף ולכוון את הלב.', src: 'שו"ע או"ח צב' },
    { he: 'יזהר אדם שלא לכעוס, כי הכעס הוא כעבודה זרה.', src: 'רמב"ם הלכות דעות פ"ב' }
  ],
  [
    { he: 'בסוף תפילת העמידה מצוה לפסוע שלוש פסיעות לאחור.', src: 'שו"ע או"ח קכג' },
    { he: 'מצוה גדולה להזהר בכבוד אב ואם.', src: 'שו"ע יו"ד רמ' }
  ]
];

export const HalachaModule = {
  name: 'halacha',

  async render() {
    const list = document.getElementById('halachaList');
    if (!list) return;

    let groups = FALLBACK;
    const data = await loadHalachaDaily();
    if (data?.groups && Array.isArray(data.groups) && data.groups.length > 0) {
      groups = data.groups;
    }

    const lang = getLang();
    const idx = dayOfYear() % groups.length;
    // Combine today's pair + tomorrow's pair = 6 halachot in 2 columns
    const today = groups[idx];
    const tomorrow = groups[(idx + 1) % groups.length];
    const all = [...today, ...tomorrow].slice(0, 6);

    let html = '';
    for (const h of all) {
      const text = lang === 'he' ? h.he : (h.en || h.he);
      const src = lang === 'he' ? (h.src || '') : (h.srcEn || h.src || '');
      html += `<li class="halacha-item">
        <span class="halacha-text">${escapeHTML(text)}</span>
        ${src ? `<span class="halacha-src">${escapeHTML(src)}</span>` : ''}
      </li>`;
    }
    list.innerHTML = html;
  }
};
