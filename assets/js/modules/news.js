/* יומיומי · modules/news.js — חדשות ואקטואליה מהמכלול */
import { getNews } from '../data/hamichlol.js';
import { t } from '../core/i18n.js';

export const NewsModule = {
  name: 'news',

  async render() {
    const body = document.getElementById('newsBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">${t('loading')}</div>`;
    const data = await getNews();
    if (!data) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון חדשות כרגע.</div>`;
      return;
    }
    body.innerHTML = `<div class="hm-content">${data.html}</div>`;
  }
};
