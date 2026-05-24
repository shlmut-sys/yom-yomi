/* יומיומי · modules/family-articles.js */
import { getFamilyArticles } from '../data/hidabroot.js';
import { renderHidabrootGrid } from './_hidabroot-grid.js';

export const FamilyArticlesModule = {
  name: 'family-articles',
  async render() {
    return renderHidabrootGrid('familyBody', getFamilyArticles);
  }
};
