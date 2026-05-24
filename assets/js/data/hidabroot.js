/* יומיומי · data/hidabroot.js
   Fetches content from www.hidabroot.org — CORS is open on their domain.
   Strategy:
   1. RSS feed for general news + ability to filter by category
   2. Category pages for Health / Family / History (HTML scrape)
   3. Daf Yomi page — find latest article ID and metadata
   All caches refresh every 6h, force-cleared at tzeit hakochavim. */

import { cacheGet, cacheSet } from './cache.js';
import { filterContent } from './content-filter.js';

const HOST = 'https://www.hidabroot.org';
const RSS_URL = `${HOST}/rss`;
const CACHE_TTL = 6 * 60 * 60 * 1000;
const CACHE_VER = 'v2'; // bump to invalidate old caches with empty results

const inFlight = new Map();

async function fetchWithDedupe(url, parser) {
  if (inFlight.has(url)) return inFlight.get(url);
  const promise = (async () => {
    try {
      const r = await fetch(url);
      if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status); // 404 sometimes still has content
      const txt = await r.text();
      return parser(txt);
    } catch (e) {
      console.warn(`[hidabroot] fetch failed: ${url}`, e);
      return null;
    } finally {
      inFlight.delete(url);
    }
  })();
  inFlight.set(url, promise);
  return promise;
}

/* ============================================================
   RSS Feed parser → list of { title, link, description, image, author, category, pubDate }
   ============================================================ */
function parseRSS(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const itemXml of itemMatches) {
    const get = (tag) => {
      const m = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    items.push({
      title:       get('title').replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, ''),
      link:        get('link').replace(/\?.*$/, ''),
      description: get('description'),
      image:       get('picture'),
      author:      get('author'),
      category:    get('category'),
      pubDate:     get('pubDate'),
      guid:        get('guid')
    });
  }
  return items;
}

export async function getRSS() {
  const cacheKey = 'hb_rss';
  const cached = cacheGet(cacheKey, CACHE_TTL);
  if (cached) return cached;
  const result = await fetchWithDedupe(RSS_URL, parseRSS);
  if (result) cacheSet(cacheKey, result);
  return result || [];
}

/* ============================================================
   Category page parser → list of articles
   Hidabroot uses <article class="article_block ..."> blocks with:
     - <a href=".../article/N" class="article_pic"><span style="background-image:url(IMG)"></span></a>
     - <div class="content"><a class="tag_lbl">CATEGORY</a><a href=".../article/N"><h3>TITLE</h3></a></div>
   ============================================================ */
function parseCategoryPage(html) {
  const articles = [];
  const seen = new Set();

  // Match each <article class="article_block ..."> block
  const blockRegex = /<article[^>]+class="article_block[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    const inner = m[1];

    // Extract article URL + ID
    const linkMatch = inner.match(/href="(https?:\/\/[^\"]*\/article\/(\d+)[^\"]*)"/);
    if (!linkMatch) continue;
    const link = linkMatch[1].replace(/\?.*$/, '');
    const id = linkMatch[2];
    if (seen.has(id)) continue;
    seen.add(id);

    // Extract image (background-image inline style)
    let image = '';
    const imgMatch = inner.match(/background-image:url\(([^)]+)\)/);
    if (imgMatch) {
      image = imgMatch[1].replace(/^['"]|['"]$/g, '');
      if (image.startsWith('//')) image = 'https:' + image;
      else if (image.startsWith('/')) image = HOST + image;
    }

    // Extract title (from <h3>)
    let title = '';
    const titleMatch = inner.match(/<h3[^>]*>\s*([\s\S]*?)\s*<\/h3>/);
    if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    // Fallback to span title attribute
    if (!title) {
      const tm2 = inner.match(/title="([^"]+)"/);
      if (tm2) title = tm2[1];
    }

    // Extract category tag (optional)
    let category = '';
    const catMatch = inner.match(/<a class="tag_lbl[^"]*"[^>]*>([^<]+)<\/a>/);
    if (catMatch) category = catMatch[1].trim();

    if (!title || title.length < 5) continue;
    articles.push({ id, link, image, title, category });
  }

  return articles;
}

export async function getCategoryArticles(categoryUrl, max = 6) {
  // Encode the URL path to handle Hebrew characters
  const url = categoryUrl.startsWith('http')
    ? categoryUrl
    : HOST + categoryUrl.split('/').map(p => p && /[^\x00-\x7F]/.test(p) ? encodeURIComponent(p) : p).join('/');
  const cacheKey = `hb_cat_${CACHE_VER}_${categoryUrl.replace(/[^a-z0-9]/gi, '_')}`;
  const cached = cacheGet(cacheKey, CACHE_TTL);
  if (cached) return cached.slice(0, max);
  const rawArticles = await fetchWithDedupe(url, parseCategoryPage);
  const articles = filterContent(rawArticles);
  if (articles && articles.length) {
    cacheSet(cacheKey, articles);
    return articles.slice(0, max);
  }
  return [];
}

/* ============================================================
   Daf Yomi — fetches the daf yomi category page and finds the latest article
   ============================================================ */
function parseDafYomiPage(html) {
  // Reuse the category parser, then pick the first article whose title contains daf-yomi keywords
  const articles = parseCategoryPage(html);
  for (const a of articles) {
    if (a.title.includes('הדף היומי') || a.title.includes('מסכת')) {
      return a;
    }
  }
  // Fallback: just return the first article
  return articles[0] || null;
}

export async function getDafYomi() {
  const url = `${HOST}/${encodeURIComponent('הדף-היומי')}`;
  const cacheKey = `hb_dafyomi_${CACHE_VER}`;
  const cached = cacheGet(cacheKey, CACHE_TTL);
  if (cached) return cached;
  const result = await fetchWithDedupe(url, parseDafYomiPage);
  if (result) cacheSet(cacheKey, result);
  return result;
}

/* ============================================================
   Convenience getters for each section
   ============================================================ */
export async function getHealthArticles()    { return getCategoryArticles('/magazine/section/40', 6); }
export async function getFamilyArticles()    { return getCategoryArticles('/magazine/section/2', 6); }
export async function getHistoryArticles()   { return getCategoryArticles('/magazine/category/11211', 6); }

/* Force-clear all hidabroot caches */
export function clearHidabrootCache() {
  try {
    const prefix = 'yomyomi.cache.hb_';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) localStorage.removeItem(k);
    }
  } catch {}
}
