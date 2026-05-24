/* יומיומי · modules/tekufot.js
   Next tekufa (season) — Tishrei, Tevet, Nisan, Tamuz.
   Uses Shmuel calculation: each tekufa = 91d 7.5h after the previous. */

import { state } from '../core/state.js';
import { getLang } from '../core/i18n.js';
import { fmtTime } from '../core/utils.js';

/* Tekufat Nisan (Shmuel) base point:
   First tekufat Nisan was on the 1st day of creation.
   Mod-7 cycle. We use a known reference for year 5784 (2024):
   Tekufat Nisan 5784 = April 7, 2024 22:30 (Jerusalem time) approximately.
   Each subsequent tekufa = +91d 7.5h. */

const REF = new Date('2024-04-07T19:30:00Z'); // Tekufat Nisan 5784 (approx)
const TEKUFA_MS = (91 * 24 + 7.5) * 60 * 60 * 1000;
const ORDER = ['nisan', 'tamuz', 'tishrei', 'tevet'];

const NAMES = {
  he: { nisan:'תקופת ניסן', tamuz:'תקופת תמוז', tishrei:'תקופת תשרי', tevet:'תקופת טבת' },
  en: { nisan:"Tekufat Nisan", tamuz:"Tekufat Tamuz", tishrei:"Tekufat Tishrei", tevet:"Tekufat Tevet" }
};

export const TekufotModule = {
  name: 'tekufot',

  render() {
    const body = document.getElementById('tekufotBody');
    if (!body) return;
    const now = new Date();
    const lang = getLang();
    const city = state.get('city');

    // Find next tekufa
    let candidate = REF.getTime();
    let idx = 0;
    while (candidate <= now.getTime()) {
      candidate += TEKUFA_MS;
      idx++;
    }
    const next = new Date(candidate);
    const which = ORDER[idx % 4];
    const name = NAMES[lang][which];

    const tz = city?.tz || 'Asia/Jerusalem';
    const dateStr = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: tz
    }).format(next);
    const timeStr = fmtTime(next, tz);

    const diffMs = next - now;
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    body.innerHTML = `<div class="tekufa-block">
      <div class="tekufa-name">${name}</div>
      <div class="tekufa-date">${dateStr} · ${timeStr}</div>
      <div class="tekufa-countdown">
        ${lang === 'he' ? 'בעוד' : 'in'} <strong>${days}</strong> ${lang === 'he' ? 'ימים' : 'days'}
        ${hours > 0 ? `${lang === 'he' ? 'ו-' : 'and '}<strong>${hours}</strong> ${lang === 'he' ? 'שעות' : 'hours'}` : ''}
      </div>
    </div>`;
  }
};
