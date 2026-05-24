/* יומיומי · modules/pitgam.js
   Daily wise saying from Sephardi sages. */

import { getLang } from '../core/i18n.js';
import { dayOfYear, escapeHTML } from '../core/utils.js';
import { loadPitgamim } from '../data/loader.js';

const FALLBACK = [
  { he: 'איזהו חכם? הלומד מכל אדם.', src: 'אבות ד, א' },
  { he: 'איזהו עשיר? השמח בחלקו.', src: 'אבות ד, א' },
  { he: 'הוי מקדים בשלום כל אדם.', src: 'אבות ד, טו' }
];

export const PitgamModule = {
  name: 'pitgam',

  async render() {
    const quoteEl = document.getElementById('pitgamQuote');
    const srcEl = document.getElementById('pitgamSrc');
    if (!quoteEl) return;

    let entries = FALLBACK;
    const data = await loadPitgamim('sephardi');
    if (data?.entries && Array.isArray(data.entries) && data.entries.length > 0) {
      entries = data.entries;
    }

    const lang = getLang();
    // Different rotation than breslov - multiply by 7 to spread
    const idx = (dayOfYear() * 7) % entries.length;
    const e = entries[idx];

    quoteEl.textContent = lang === 'he' ? e.he : (e.en || e.he);
    if (srcEl) {
      const src = e.author || (lang === 'he' ? e.src : (e.srcEn || e.src));
      srcEl.textContent = src ? `— ${src}` : '';
    }
  }
};
