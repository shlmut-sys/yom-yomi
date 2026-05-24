/* יומיומי · modules/breslov.js
   Daily Breslov chizuk from חיזוק היומי source file.
   Rotates deterministically by day-of-year. */

import { dayOfYear, escapeHTML } from '../core/utils.js';
import { loadBreslov } from '../data/loader.js';
import { getLang } from '../core/i18n.js';

const FALLBACK = [
  { title: 'אסור להתייאש', body: 'אסור להתייאש — אין שום ייאוש בעולם כלל!', src: 'ליקוטי מוהר"ן ב, עח' }
];

export const BreslovModule = {
  name: 'breslov',

  async render() {
    const titleEl = document.getElementById('breslovTitleHe');
    const quoteEl = document.getElementById('breslovQuote');
    const srcEl = document.getElementById('breslovSrc');
    if (!quoteEl) return;

    let entries = FALLBACK;
    const data = await loadBreslov();
    if (data?.entries && Array.isArray(data.entries) && data.entries.length > 0) {
      entries = data.entries;
    }

    const idx = dayOfYear() % entries.length;
    const e = entries[idx];

    // Title (the heading line from the chizuk)
    if (titleEl) {
      titleEl.textContent = e.title || '';
      titleEl.style.display = e.title ? '' : 'none';
    }

    // Body (the long teaching text, with nikud preserved)
    quoteEl.textContent = e.body || e.he || e.title || '';

    // Source
    if (srcEl) {
      srcEl.textContent = e.src ? `— ${e.src}` : (e.srcEn ? `— ${e.srcEn}` : '');
    }
  }
};
