/* יומיומי · modules/parsha-articles.js — ערכים בפרשת השבוע (מהמכלול) */
import { getParshaArticles } from '../data/hamichlol.js';
import { t } from '../core/i18n.js';

export const ParshaArticlesModule = {
  name: 'parsha-articles',
  async render() {
    const body = document.getElementById('parshaArtBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getParshaArticles();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
