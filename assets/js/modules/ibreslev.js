/* יומיומי · modules/ibreslev.js — תוכן מאתר iBreslev
   Tries multiple feeds + proxies. */
import { fetchViaProxy, parseRSS } from '../data/proxy-fetch.js';
import { escapeHTML } from '../core/utils.js';
import { getLang } from '../core/i18n.js';

const FEEDS = [
  'https://ibreslev.co.il/feed/',
  'https://ibreslev.co.il/breslev/feed/'
];

export const IBreslevModule = {
  name: 'ibreslev',

  async render() {
    const body = document.getElementById('ibreslevBody');
    if (!body) return;
    const lang = getLang();
    body.innerHTML = `<div class="shimmer">${lang === 'he' ? 'טוען...' : 'Loading...'}</div>`;

    let items = [];
    for (const feed of FEEDS) {
      try {
        const xml = await fetchViaProxy(feed, {
          cacheKey: `ibreslev_${feed.replace(/[^a-z]/gi, '_')}_v3`,
          ttl: 6 * 60 * 60 * 1000,
          timeoutMs: 15000
        });
        if (xml) {
          items = parseRSS(xml);
          if (items.length > 0) break;
        }
      } catch (e) {
        console.warn('[ibreslev] feed failed:', feed, e);
      }
    }

    if (!items || items.length === 0) {
      body.innerHTML = `<div class="hm-empty">לא ניתן לטעון מתורת ברסלב כרגע. נסה שוב מאוחר יותר.</div>`;
      return;
    }

    // Filter to items with images preferred
    const withImg = items.filter(it => it.image && it.image.length > 10);
    const display = (withImg.length >= 3 ? withImg : items).slice(0, 4);

    let html = '<div class="hb-grid">';
    for (const it of display) {
      html += `<a class="hb-card" href="${escapeHTML(it.link)}" target="_blank" rel="noopener">
        ${it.image ? `<div class="hb-thumb" style="background-image:url('${escapeHTML(it.image)}')"></div>` : '<div class="hb-thumb hb-thumb-empty">📜</div>'}
        <div class="hb-info">
          <h4 class="hb-title">${escapeHTML(it.title)}</h4>
        </div>
      </a>`;
    }
    html += '</div>';
    body.innerHTML = html;
  }
};
