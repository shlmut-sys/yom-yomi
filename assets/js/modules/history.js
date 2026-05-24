/* יומיומי · modules/history.js
   "ביום הזה בהיסטוריה" — Gregorian date, sourced from Hamichlol main page. */

import { getTodayInHistory } from '../data/hamichlol.js';
import { getLang, t } from '../core/i18n.js';

export const HistoryModule = {
  name: 'history',

  async render() {
    const body = document.getElementById('historyBody');
    const sub = document.getElementById('historySub');
    if (!body) return;

    const now = new Date();
    const lang = getLang();
    const months = lang === 'he'
      ? ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (sub) {
      sub.textContent = lang === 'he'
        ? `${now.getDate()} ב${months[now.getMonth()]}`
        : `${months[now.getMonth()]} ${now.getDate()}`;
    }

    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getTodayInHistory();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון מהמכלול כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
