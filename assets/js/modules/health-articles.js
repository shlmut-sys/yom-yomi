/* יומיומי · modules/health-articles.js */
import { getHealthArticles } from '../data/hidabroot.js';
import { renderHidabrootGrid } from './_hidabroot-grid.js';

export const HealthArticlesModule = {
  name: 'health-articles',
  async render() {
    return renderHidabrootGrid('healthBody', getHealthArticles);
  }
};
