/* יומיומי · modules/breslev-books.js — קטגוריות מאתר breslevbooks.co.il
   The site blocks direct HTML scraping with JS rendering — we use curated
   categories with stylized cards that link to the actual store. */

import { escapeHTML } from '../core/utils.js';

const STORE = 'https://breslevbooks.co.il/';

/* Curated categories matching the user's screenshot of the store */
const CATEGORIES = [
  { title: 'מכתבי אנ"ש',         emoji: '📜', gradient: 'linear-gradient(135deg, #8b4513, #d2691e)', link: STORE + 'product-category/מכתבי-אנש/' },
  { title: 'כתבי אנ"ש - אחרונים', emoji: '📚', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', link: STORE + 'product-category/כתבי-אנש-אחרונים/' },
  { title: 'כתבי אנ"ש - ראשונים', emoji: '📖', gradient: 'linear-gradient(135deg, #6b21a8, #a855f7)', link: STORE + 'product-category/כתבי-אנש-ראשונים/' },
  { title: 'ספרי יסוד',           emoji: '🕯️', gradient: 'linear-gradient(135deg, #92400e, #f59e0b)', link: STORE + 'product-category/ספרי-יסוד/' },
  { title: 'מסורת ברסלב',         emoji: '🔥', gradient: 'linear-gradient(135deg, #991b1b, #ef4444)', link: STORE + 'product-category/מסורת-ברסלב/' },
  { title: 'ביאורים בספרי ברסלב', emoji: '✡',  gradient: 'linear-gradient(135deg, #064e3b, #10b981)', link: STORE + 'product-category/ביאורים/' },
  { title: 'ביוגרפיה וסיפורי חסידים', emoji: '👑', gradient: 'linear-gradient(135deg, #581c87, #c026d3)', link: STORE + 'product-category/ביוגרפיה/' },
  { title: 'שיחות בחסידות ברסלב', emoji: '💬', gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)', link: STORE + 'product-category/שיחות/' },
  { title: 'ברסלב לילדים',         emoji: '👶', gradient: 'linear-gradient(135deg, #831843, #ec4899)', link: STORE + 'product-category/לילדים/' },
  { title: 'מתנות ויודאיקה',       emoji: '🎁', gradient: 'linear-gradient(135deg, #4c1d95, #8b5cf6)', link: STORE + 'product-category/מתנות/' },
  { title: 'חוברות וספרי כיס',    emoji: '📔', gradient: 'linear-gradient(135deg, #134e4a, #14b8a6)', link: STORE + 'product-category/ספרי-כיס/' },
  { title: 'חומשים · סידורים · תהלים', emoji: '📕', gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)', link: STORE + 'product-category/חומשים/' }
];

export const BreslevBooksModule = {
  name: 'breslev-books',

  render() {
    const track = document.getElementById('booksTrack');
    if (!track) return;

    const buildCell = (it) => `
      <a class="book-cell" href="${escapeHTML(it.link)}" target="_blank" rel="noopener">
        <div class="book-thumb" style="background:${it.gradient}">
          <span class="book-emoji-fallback">${it.emoji}</span>
        </div>
        <div class="book-info">
          <h4 class="book-name">${escapeHTML(it.title)}</h4>
        </div>
      </a>
    `;

    const cells = CATEGORIES.map(buildCell).join('');
    track.innerHTML = cells + cells; // duplicate for seamless marquee
  }
};
