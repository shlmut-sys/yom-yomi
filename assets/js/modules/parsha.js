/* יומיומי · modules/parsha.js
   Renders the hero: parsha + Hebrew date + time + greg. */

import { gematriya, fmtTime, HEBMONTH_HE, HEBMONTH_EN, HEBMONTH_TO_KEY, pad } from '../core/utils.js';
import { getLang, t } from '../core/i18n.js';
import { state } from '../core/state.js';

export const ParshaModule = {
  name: 'parsha',
  intervalId: null,

  init() {
    // Update the time portion every second
    this.intervalId = setInterval(() => this.tick(), 1000);
  },

  render() {
    this.renderParsha();
    this.renderDate();
    this.tick();
  },

  renderParsha() {
    const el = document.getElementById('heroParsha');
    if (!el) return;
    const parsha = state.get('parsha');
    const lang = getLang();
    if (!parsha) {
      el.textContent = lang === 'he' ? 'יומיומי' : 'Yom-Yomi';
      return;
    }
    const label = t('parashatLabel');
    const name = lang === 'he' ? parsha.he : parsha.en;
    el.textContent = `${label} ${name}`;
  },

  renderDate() {
    const el = document.getElementById('heroDate');
    if (!el) return;
    const hdate = state.get('hdate');
    if (!hdate) { el.textContent = '—'; return; }
    const lang = getLang();
    const i18n = (key) => t(key);

    const now = new Date();
    const dayName = i18n('days')[now.getDay()];
    const monthEn = hdate.getMonthName('en');
    const monthKey = HEBMONTH_TO_KEY[monthEn] || monthEn.toLowerCase();
    const monthHe = HEBMONTH_HE[monthKey] || monthEn;
    const monthEnDisp = HEBMONTH_EN[monthKey] || monthEn;
    const gem = gematriya(hdate.getDate());

    let line;
    if (lang === 'he') {
      const dayLbl = i18n('dayLabel');
      line = `${dayLbl} ${dayName}<span class="sep">·</span>${gem} ב${monthHe}`;
    } else {
      line = `${dayName}<span class="sep">·</span>${hdate.getDate()} ${monthEnDisp}`;
    }
    el.innerHTML = line;
  },

  tick() {
    const timeEl = document.getElementById('heroTime');
    const cityEl = document.getElementById('heroTimeCity');
    const city = state.get('city');
    if (!city) return;
    const now = new Date();
    const timeStr = fmtTime(now, city.tz, true) || `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (timeEl) timeEl.textContent = timeStr;
    if (cityEl) cityEl.textContent = city[getLang() === 'he' ? 'he' : 'en'];
  },

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
};
