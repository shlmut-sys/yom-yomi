/* יומיומי · modules/new-articles.js — ערכים חדשים מבית המכלול */
import { getNewArticles } from '../data/hamichlol.js';
import { t } from '../core/i18n.js';

export const NewArticlesModule = {
  name: 'new-articles',
  async render() {
    const body = document.getElementById('newArtBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getNewArticles();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
