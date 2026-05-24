/* יומיומי · modules/learning.js
   Daily learning grid via @hebcal/learning. */

import { state } from '../core/state.js';
import { getLang } from '../core/i18n.js';
import { escapeHTML } from '../core/utils.js';

export const LearningModule = {
  name: 'learning',

  render() {
    const grid = document.getElementById('learningGrid');
    if (!grid) return;
    if (typeof hebcal === 'undefined') return;

    const learning = (typeof hebcal__learning !== 'undefined') ? hebcal__learning : {};
    const lang = getLang();
    const hdate = state.get('hdate');
    if (!hdate) return;

    const cards = [
      { key: 'dafYomi',          cls: learning.DafYomiEvent,        icon: '📖', he: 'דף יומי (בבלי)',  en: 'Daf Yomi (Bavli)' },
      { key: 'mishnaYomi',       cls: learning.MishnaYomiEvent,     icon: '📜', he: 'משנה יומית',       en: 'Mishna Yomi' },
      { key: 'yerushalmi-vilna', cls: learning.YerushalmiYomiEvent, icon: '🏛️', he: 'דף יומי (ירושלמי)', en: 'Yerushalmi' },
      { key: 'rambam1',          cls: learning.DailyRambamEvent,    icon: '✡', he: 'רמב"ם יומי',       en: 'Daily Rambam' },
      { key: 'chofetzChaim',     cls: learning.ChofetzChaimEvent,   icon: '🕯️', he: 'חפץ חיים',         en: 'Chofetz Chaim' },
      { key: 'nachYomi',         cls: learning.NachYomiEvent,       icon: '📚', he: 'נ"ך יומי',         en: 'Nach Yomi' }
    ];

    let html = '';
    for (const c of cards) {
      let text = '';
      // Try DailyLearning.lookup first
      try {
        if (hebcal.DailyLearning?.lookup) {
          const ev = hebcal.DailyLearning.lookup(c.key, hdate, true);
          if (ev) {
            try { text = ev.render(lang === 'he' ? 'he-x-NoNikud' : 'en'); } catch {}
            if (!text) { try { text = ev.render('he-x-NoNikud'); } catch {} }
          }
        }
      } catch {}
      // Fallback to direct class
      if (!text && c.cls) {
        try {
          let ev;
          if (c.key === 'mishnaYomi' && learning.MishnaYomiIndex) {
            const idx = new learning.MishnaYomiIndex();
            const m = idx.lookup(hdate);
            if (m) ev = new c.cls(hdate, m);
          } else if (c.key === 'nachYomi' && learning.NachYomiIndex) {
            const idx = new learning.NachYomiIndex();
            const m = idx.lookup(hdate);
            if (m) ev = new c.cls(hdate, m);
          } else if (c.key === 'rambam1' && learning.dailyRambam1) {
            const r = learning.dailyRambam1(hdate);
            if (r) ev = new c.cls(hdate, r);
          } else if (c.key === 'yerushalmi-vilna' && learning.yerushalmiYomi) {
            const r = learning.yerushalmiYomi(hdate);
            if (r) ev = new c.cls(hdate, r);
          } else if (c.key === 'chofetzChaim' && learning.chofetzChaim) {
            const r = learning.chofetzChaim(hdate);
            if (r) ev = new c.cls(hdate, r);
          } else {
            ev = new c.cls(hdate);
          }
          if (ev) {
            try { text = ev.render(lang === 'he' ? 'he-x-NoNikud' : 'en'); } catch {}
            if (!text) { try { text = ev.render('he-x-NoNikud'); } catch {} }
          }
        } catch {}
      }
      if (!text) continue;
      html += `<div class="learning-item">
        <span class="l-icon">${c.icon}</span>
        <span class="l-label">${escapeHTML(lang === 'he' ? c.he : c.en)}</span>
        <span class="l-value">${escapeHTML(text)}</span>
      </div>`;
    }
    grid.innerHTML = html;
  }
};
