/* יומיומי · modules/featured-article.js — ערך מומלץ מהמכלול */
import { getFeaturedArticle } from '../data/hamichlol.js';
import { t } from '../core/i18n.js';

export const FeaturedArticleModule = {
  name: 'featured-article',

  async render() {
    const body = document.getElementById('faBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getFeaturedArticle();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון מהמכלול כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
