/* יומיומי · data/proxy-fetch.js
   CORS proxy wrapper using api.allorigins.win for sites that
   don't expose CORS headers (hamenagen, ibreslev, breslevbooks). */

import { cacheGet, cacheSet } from './cache.js';
import { filterContent } from './content-filter.js';

const PROXY = 'https://api.allorigins.win/raw?url=';

const PROXY_FALLBACKS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

/* Force-clear ALL proxy-fetched caches (used at tzeit hakochavim) */
export function clearProxyCache() {
  try {
    const prefix = 'yomyomi.cache.proxy_';
    const prefix2 = 'yomyomi.cache.hamenagen_';
    const prefix3 = 'yomyomi.cache.ibreslev_';
    const prefix4 = 'yomyomi.cache.breslevbooks_';
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(prefix) || k.startsWith(prefix2) || k.startsWith(prefix3) || k.startsWith(prefix4)) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) localStorage.removeItem(k);
    console.log(`[proxy-fetch] cleared ${toRemove.length} cache entries`);
  } catch {}
}

export async function fetchViaProxy(targetUrl, opts = {}) {
  const cacheKey = opts.cacheKey || `proxy_${targetUrl}`;
  const ttl = opts.ttl ?? 6 * 60 * 60 * 1000;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const cached = cacheGet(cacheKey, ttl);
  if (cached) return cached;

  // Try each proxy in order until one succeeds
  for (const proxy of PROXY_FALLBACKS) {
    try {
      const url = proxy === 'https://corsproxy.io/?'
        ? proxy + encodeURIComponent(targetUrl)
        : proxy + encodeURIComponent(targetUrl);

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);

      if (!r.ok) throw new Error('proxy HTTP ' + r.status);
      const text = await r.text();
      if (!text || text.length < 50) throw new Error('empty response');
      cacheSet(cacheKey, text);
      console.log(`[proxy-fetch] success via ${proxy} for ${targetUrl}`);
      return text;
    } catch (err) {
      console.warn(`[proxy-fetch] ${proxy} failed for ${targetUrl}:`, err.message);
      // try next proxy
    }
  }
  console.error('[proxy-fetch] ALL proxies failed for:', targetUrl);
  return null;
}

/* Decode HTML entities (&#039; &amp; &quot; etc) */
function decodeHTMLEntities(s) {
  if (!s) return s;
  const ta = document.createElement('textarea');
  ta.innerHTML = s;
  return ta.value;
}

/* Parse RSS XML → list of items with proper entity decoding */
export function parseRSS(xml) {
  if (!xml) return [];
  const items = [];
  const matches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const item of matches) {
    const get = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      if (!m) return '';
      let v = m[1].replace(/<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      return v;
    };
    // Extract image from multiple possible sources
    let image = '';
    const mediaThumb = item.match(/<media:thumbnail[^>]+url="([^"]+)"/);
    const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"/);
    const encContent = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/);
    if (enclosure) image = enclosure[1];
    else if (mediaThumb) image = mediaThumb[1];
    else if (mediaContent) image = mediaContent[1];
    else if (encContent) {
      const encDecoded = decodeHTMLEntities(encContent[1]);
      const imgIn = encDecoded.match(/<img[^>]+src="([^"]+)"/);
      if (imgIn) image = imgIn[1];
    }
    if (!image) {
      // try description
      const descRaw = get('description');
      const descDecoded = decodeHTMLEntities(descRaw);
      const descImg = descDecoded.match(/<img[^>]+src="([^"]+)"/);
      if (descImg) image = descImg[1];
    }

    const titleRaw = decodeHTMLEntities(get('title'));
    const descRaw = decodeHTMLEntities(get('description'));
    items.push({
      title:       titleRaw,
      link:        get('link').replace(/\?.*$/, ''),
      description: descRaw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240),
      image:       image ? (image.startsWith('//') ? 'https:' + image : image) : '',
      pubDate:     get('pubDate'),
      author:      decodeHTMLEntities(get('dc:creator') || get('author')),
      category:    decodeHTMLEntities(get('category'))
    });
  }
  return filterContent(items);
}

/* Parse HTML page → look for article/product cards (WordPress conventions).
   For WooCommerce stores, products are in .product or li.product. */
export function parseWordPressArticles(html, max = 10) {
  if (!html) return [];
  const articles = [];
  const seen = new Set();

  // Try multiple container patterns
  const patterns = [
    /<li[^>]+class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/li>/g,    // WooCommerce
    /<article[^>]*>([\s\S]*?)<\/article>/g,                        // WP article
    /<div[^>]+class="[^"]*(product|category-item|book)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g
  ];

  for (const regex of patterns) {
    if (articles.length >= max) break;
    let m;
    while ((m = regex.exec(html)) !== null && articles.length < max) {
      const inner = m[m.length - 1]; // last capture group

      // Find link
      const linkMatch = inner.match(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/);
      if (!linkMatch) continue;
      const link = linkMatch[1].replace(/\?.*$/, '');
      if (seen.has(link)) continue;
      seen.add(link);

      // Find image - try multiple attributes
      let image = '';
      const imgMatch = inner.match(/<img[^>]+(?:data-src|data-lazy-src|src)="([^"]+\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i);
      if (imgMatch) image = imgMatch[1];
      if (!image) {
        const srcsetMatch = inner.match(/srcset="([^"]+)"/);
        if (srcsetMatch) image = srcsetMatch[1].split(',')[0].trim().split(' ')[0];
      }
      // Skip placeholder/transparent images
      if (image && (image.includes('placeholder') || image.includes('data:image'))) image = '';

      // Find title
      let title = '';
      const h2 = inner.match(/<h[1234][^>]*>\s*(?:<a[^>]*>)?\s*([\s\S]*?)\s*(?:<\/a>)?\s*<\/h[1234]>/);
      if (h2) title = h2[1].replace(/<[^>]+>/g, '').trim();
      // Try .woocommerce-loop-product__title
      if (!title) {
        const wcTitle = inner.match(/<[^>]+class="[^"]*(product-name|title|woocommerce-loop)[^"]*"[^>]*>([\s\S]*?)<\//);
        if (wcTitle) title = wcTitle[2].replace(/<[^>]+>/g, '').trim();
      }

      if (!title || title.length < 3) continue;
      articles.push({ link, image, title });
    }
  }
  return articles;
}
