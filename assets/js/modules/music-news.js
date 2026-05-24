/* יומיומי · modules/music-news.js — חדשות מוזיקה
   Merges multiple sources: Hamenagen + JDN music section. */
import { fetchViaProxy, parseRSS } from '../data/proxy-fetch.js';
import { escapeHTML } from '../core/utils.js';
import { getLang } from '../core/i18n.js';

const SOURCES = [
  { url: 'https://www.jdn.co.il/music/feed/', label: 'JDN' },
  { url: 'https://hamenagen.net/category/music-news/feed/', label: 'המנגן' },
  { url: 'https://www.jdn.co.il/feed/?cat=music', label: 'JDN' } // fallback
];

export const MusicNewsModule = {
  name: 'music-news',

  async render() {
    const body = document.getElementById('musicBody');
    if (!body) return;
    const lang = getLang();
    body.innerHTML = `<div class="shimmer">${lang === 'he' ? 'טוען חדשות מוזיקה...' : 'Loading music news...'}</div>`;

    // Fetch all sources in parallel
    const promises = SOURCES.map(async (src) => {
      try {
        const xml = await fetchViaProxy(src.url, {
          cacheKey: `music_${src.url.replace(/[^a-z]/gi, '_')}_v2`,
          ttl: 6 * 60 * 60 * 1000,
          timeoutMs: 15000
        });
        if (!xml) return [];
        const items = parseRSS(xml);
        return items.map(it => ({ ...it, source: src.label }));
      } catch (err) {
        console.warn(`[music] ${src.label} failed:`, err);
        return [];
      }
    });

    const all = (await Promise.all(promises)).flat();
    // Dedupe by link
    const seen = new Set();
    const uniq = all.filter(it => {
      if (seen.has(it.link)) return false;
      seen.add(it.link);
      return true;
    });

    // Keep only items with images
    const withImg = uniq.filter(it => it.image && it.image.length > 10);

    if (withImg.length === 0) {
      body.innerHTML = `<div class="hm-empty">לא נמצאו חדשות מוזיקה עם תמונות כרגע.</div>`;
      return;
    }

    // Sort by pubDate (newest first), take top 8
    withImg.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });
    const top = withImg.slice(0, 8);

    let html = '<div class="hb-grid music-grid">';
    for (const it of top) {
      html += `<a class="hb-card" href="${escapeHTML(it.link)}" target="_blank" rel="noopener">
        <div class="hb-thumb" style="background-image:url('${escapeHTML(it.image)}')"></div>
        <div class="hb-info">
          <h4 class="hb-title">${escapeHTML(it.title)}</h4>
          <p class="hb-source-tag">🎵 ${escapeHTML(it.source || '')}</p>
        </div>
      </a>`;
    }
    html += '</div>';
    body.innerHTML = html;
  }
};
