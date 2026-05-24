/* יומיומי · modules/sixth-millennium.js
   Live countdown to the 6th millennium — Rosh Hashanah of Hebrew year 6000.
   Uses hebcal to convert 1 Tishrei 6000 to a Gregorian date. */

import { state } from '../core/state.js';
import { getLang } from '../core/i18n.js';
import { pad } from '../core/utils.js';

let target = null; // cached Date of 1 Tishrei 6000
let tickerInterval = null;

export const SixthMillenniumModule = {
  name: 'sixth-millennium',

  init() {
    tickerInterval = setInterval(() => this.tick(), 1000);
  },

  render() {
    if (!target) {
      try {
        if (typeof hebcal !== 'undefined' && hebcal.HDate) {
          // Tishrei = month 7 in hebcal; alternatively HDate(1, "Tishrei", 6000)
          const h = new hebcal.HDate(1, 'Tishrei', 6000);
          target = h.greg();
        }
      } catch (e) {
        // Fallback: approximate (6000 - 5786 = 214 years from now)
        const now = new Date();
        target = new Date(now.getFullYear() + 214, 8, 14); // approx Rosh Hashanah
      }
    }
    this.tick();
  },

  tick() {
    const lang = getLang();
    const elY = document.getElementById('smY');
    const elM = document.getElementById('smM');
    const elD = document.getElementById('smD');
    const elH = document.getElementById('smH');
    const elMin = document.getElementById('smMin');
    const elS = document.getElementById('smS');
    const elTarget = document.getElementById('smTarget');
    if (!elY || !target) return;

    const now = new Date();
    let diff = Math.max(0, target.getTime() - now.getTime());

    const ms_year = 365.2425 * 24 * 3600 * 1000;
    const ms_month = ms_year / 12;
    const ms_day = 24 * 3600 * 1000;
    const ms_hour = 3600 * 1000;
    const ms_min = 60 * 1000;

    const years = Math.floor(diff / ms_year); diff -= years * ms_year;
    const months = Math.floor(diff / ms_month); diff -= months * ms_month;
    const days = Math.floor(diff / ms_day); diff -= days * ms_day;
    const hours = Math.floor(diff / ms_hour); diff -= hours * ms_hour;
    const mins = Math.floor(diff / ms_min); diff -= mins * ms_min;
    const secs = Math.floor(diff / 1000);

    elY.textContent = years;
    elM.textContent = months;
    elD.textContent = days;
    elH.textContent = pad(hours);
    elMin.textContent = pad(mins);
    elS.textContent = pad(secs);

    if (elTarget) {
      const targetStr = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(target);
      elTarget.textContent = lang === 'he'
        ? `יעד: ראש השנה ה'ת"ש (${targetStr})`
        : `Target: Rosh Hashanah 6000 (${targetStr})`;
    }
  }
};
