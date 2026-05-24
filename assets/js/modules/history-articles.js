/* יומיומי · modules/history-articles.js */
import { getHistoryArticles } from '../data/hidabroot.js';
import { renderHidabrootGrid } from './_hidabroot-grid.js';

export const HistoryArticlesModule = {
  name: 'history-articles',
  async render() {
    return renderHidabrootGrid('historyArtBody', getHistoryArticles);
  }
};
