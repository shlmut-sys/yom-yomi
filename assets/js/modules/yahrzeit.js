/* יומיומי · modules/yahrzeit.js
   Displays tzaddikim who passed on this Hebrew date. */

import { state } from '../core/state.js';
import { getLang, t } from '../core/i18n.js';
import { gematriya, escapeHTML, HEBMONTH_HE, HEBMONTH_EN, HEBMONTH_TO_KEY } from '../core/utils.js';
import { loadTzadikimMonth } from '../data/loader.js';
import { openModal } from '../ui/modal.js';

const TOP = 10;

export const YahrzeitModule = {
  name: 'yahrzeit',
  fullList: [],

  init() {
    const btn = document.getElementById('yahrzeitExpand');
    if (btn) {
      btn.addEventListener('click', () => {
        state.set('yahrzeitExpanded', !state.get('yahrzeitExpanded'));
        this.draw();
      });
    }
  },

  async render() {
    const hdate = state.get('hdate');
    if (!hdate) return;
    const lang = getLang();

    // Update sub-label: "ז' בסיוון"
    const monthEn = hdate.getMonthName('en');
    const monthKey = HEBMONTH_TO_KEY[monthEn] || monthEn.toLowerCase();
    const monthHe = HEBMONTH_HE[monthKey] || monthEn;
    const monthEnDisp = HEBMONTH_EN[monthKey] || monthEn;
    const dayGem = gematriya(hdate.getDate());
    const subEl = document.getElementById('yahrzeitSub');
    if (subEl) {
      subEl.textContent = lang === 'he'
        ? `${dayGem} ב${monthHe}`
        : `${hdate.getDate()} ${monthEnDisp}`;
    }

    // Load month data
    const data = await loadTzadikimMonth(monthKey);
    this.fullList = (data?.entries?.[String(hdate.getDate())]) || [];

    this.draw();
  },

  draw() {
    const list = document.getElementById('yahrzeitList');
    const btn = document.getElementById('yahrzeitExpand');
    const countEl = document.getElementById('yahrzeitCount');
    if (!list) return;

    if (this.fullList.length === 0) {
      list.innerHTML = `<li class="yahrzeit-empty">${t('yahrzeitEmpty')}</li>`;
      if (btn) btn.hidden = true;
      return;
    }

    const expanded = state.get('yahrzeitExpanded');
    const visible = expanded ? this.fullList.length : Math.min(TOP, this.fullList.length);
    let html = '';
    for (let i = 0; i < visible; i++) {
      const tz = this.fullList[i];
      html += `<li class="yahrzeit-item" data-idx="${i}">
        <span class="yz-name">${escapeHTML(tz.name)}</span>
        ${tz.yearHe ? `<span class="yz-year">${escapeHTML(tz.yearHe)}</span>` : ''}
      </li>`;
    }
    list.innerHTML = html;

    // Attach click handlers
    list.querySelectorAll('.yahrzeit-item').forEach(li => {
      li.addEventListener('click', () => {
        const i = parseInt(li.getAttribute('data-idx'), 10);
        const tz = this.fullList[i];
        if (tz) this.openDetail(tz);
      });
    });

    // Expand button
    if (this.fullList.length > TOP && btn) {
      btn.hidden = false;
      const lbl = btn.querySelector('.exp-label');
      const cnt = btn.querySelector('.exp-count');
      const remaining = this.fullList.length - TOP;
      if (lbl) lbl.textContent = expanded ? t('showLess') : t('showMore');
      if (cnt) cnt.textContent = expanded ? '' : `(${remaining}+)`;
    } else if (btn) {
      btn.hidden = true;
    }
  },

  openDetail(tz) {
    const lang = getLang();
    let meta = '';
    if (tz.yearHe) meta += `${lang === 'he' ? 'שנת פטירה:' : 'Year:'} ${tz.yearHe}`;
    if (tz.yearGreg) meta += ` (${tz.yearGreg})`;
    if (tz.birthYearGreg) meta += ` · ${lang === 'he' ? 'נולד' : 'b.'} ${tz.birthYearGreg}`;

    openModal({
      title: tz.name,
      meta,
      body: tz.note || (lang === 'he' ? 'טוען מידע מויקיפדיה...' : 'Loading from Wikipedia...'),
      wikiQuery: tz.name.replace(/\s*[-–—]\s*.+$/, '').trim()
    });
  }
};
