/* יומיומי · modules/hebrew-calendar.js — היום בלוח השנה (מהמכלול) */
import { getTodayInCalendar } from '../data/hamichlol.js';
import { t } from '../core/i18n.js';

export const HebrewCalendarModule = {
  name: 'hebrew-calendar',
  async render() {
    const body = document.getElementById('hebCalBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getTodayInCalendar();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
