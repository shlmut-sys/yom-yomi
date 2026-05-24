/* יומיומי · modules/lunar.js
   Next lunar/solar eclipse — uses static table of upcoming eclipses
   (NASA-published). Updates yearly. */

import { getLang } from '../core/i18n.js';

/* Known eclipses 2026-2028 (subset). Real product will load from JSON. */
const ECLIPSES = [
  { date: '2026-02-17', type: 'annular-solar', he: 'ליקוי חמה טבעתי', en: 'Annular Solar Eclipse', mag: 0.96, visible: ['Antarctica', 'S Africa', 'S America'] },
  { date: '2026-08-12', type: 'total-solar',   he: 'ליקוי חמה מלא',    en: 'Total Solar Eclipse',   mag: 1.04, visible: ['Spain', 'Iceland', 'Greenland'] },
  { date: '2027-02-06', type: 'annular-solar', he: 'ליקוי חמה טבעתי', en: 'Annular Solar Eclipse', mag: 0.93, visible: ['S America', 'Atlantic'] },
  { date: '2027-08-02', type: 'total-solar',   he: 'ליקוי חמה מלא',    en: 'Total Solar Eclipse',   mag: 1.08, visible: ['Israel', 'Egypt', 'Saudi Arabia'], hebrew: 'נראה מארץ ישראל!' },
  { date: '2028-01-26', type: 'annular-solar', he: 'ליקוי חמה טבעתי', en: 'Annular Solar Eclipse', mag: 0.92, visible: ['Spain', 'Portugal'] },
  { date: '2028-07-22', type: 'total-solar',   he: 'ליקוי חמה מלא',    en: 'Total Solar Eclipse',   mag: 1.06, visible: ['Australia', 'New Zealand'] },

  // Lunar eclipses
  { date: '2026-03-03', type: 'total-lunar', he: 'ליקוי לבנה מלא', en: 'Total Lunar Eclipse', mag: 1.15, visible: ['Pacific', 'Americas', 'E Asia'] },
  { date: '2026-08-28', type: 'partial-lunar', he: 'ליקוי לבנה חלקי', en: 'Partial Lunar Eclipse', mag: 0.93, visible: ['Americas', 'Europe', 'Africa'] },
  { date: '2027-02-20', type: 'penumbral-lunar', he: 'ליקוי לבנה צל', en: 'Penumbral Lunar Eclipse', mag: 0.78, visible: ['Americas', 'Europe', 'Africa'] },
];

export const LunarModule = {
  name: 'lunar',

  render() {
    const body = document.getElementById('lunarBody');
    if (!body) return;
    const lang = getLang();
    const now = new Date();
    const upcoming = ECLIPSES
      .filter(e => new Date(e.date + 'T00:00:00') > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    if (!upcoming) {
      body.innerHTML = `<div class="lunar-block">
        <div class="lunar-type">${lang === 'he' ? 'אין נתונים' : 'No data'}</div>
      </div>`;
      return;
    }

    const d = new Date(upcoming.date + 'T00:00:00');
    const dateStr = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(d);

    const diffMs = d - now;
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const visStr = (upcoming.visible || []).join(', ');

    body.innerHTML = `<div class="lunar-block">
      <div class="lunar-type">${lang === 'he' ? upcoming.he : upcoming.en}</div>
      <div class="lunar-date">${dateStr}</div>
      <div class="lunar-mag">${lang === 'he' ? 'עוצמה' : 'Magnitude'}: ${upcoming.mag}</div>
      <div class="lunar-vis">${lang === 'he' ? 'נראה ב:' : 'Visible in:'} ${visStr}</div>
      <div class="tekufa-countdown" style="margin-top:0.5rem">
        ${lang === 'he' ? 'בעוד' : 'in'} <strong>${days}</strong> ${lang === 'he' ? 'ימים' : 'days'}
      </div>
      ${upcoming.hebrew ? `<div style="margin-top:0.5rem;color:var(--c-accent-2);font-weight:700">★ ${upcoming.hebrew}</div>` : ''}
    </div>`;
  }
};
