/* יומיומי · data/hamichlol.js
   Fetches main page of www.hamichlol.org.il and extracts daily sections.
   The main page uses a table-pair structure:
     - Small "title" table (height: 35px in a td) containing the section name
     - Followed by a larger "content" table with the actual data
   Refreshes every 6 hours; explicitly cleared at tzeit hakochavim. */

import { cacheGet, cacheSet } from './cache.js';
import { filterHTMLBlocked } from './content-filter.js';

const HOST = 'https://www.hamichlol.org.il';
const MAIN_PAGE = 'עמוד_ראשי';
const API = `${HOST}/w/api.php?action=parse&page=${encodeURIComponent(MAIN_PAGE)}&format=json&prop=text&origin=*`;

const MEM_KEY = '_yomyomi_hm_main';
const CACHE_KEY = 'hamichlol_v4'; // bump to invalidate stale filtered caches
const CACHE_TTL = 6 * 60 * 60 * 1000;

let inFlight = null;

async function fetchMainHTML() {
  if (window[MEM_KEY]) return window[MEM_KEY];
  const fromCache = cacheGet(CACHE_KEY, CACHE_TTL);
  if (fromCache) { window[MEM_KEY] = fromCache; return fromCache; }
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const r = await fetch(API);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      const html = d?.parse?.text?.['*'];
      if (!html) throw new Error('no html');
      cacheSet(CACHE_KEY, html);
      window[MEM_KEY] = html;
      return html;
    } catch (e) {
      console.warn('[hamichlol] fetch failed', e);
      return null;
    } finally { inFlight = null; }
  })();
  return inFlight;
}

export function clearHaMichlolCache() {
  window[MEM_KEY] = null;
  try { localStorage.removeItem('yomyomi.cache.' + CACHE_KEY); } catch {}
}

function rewriteUrls(root) {
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href) {
      if (href.startsWith('/')) a.href = HOST + href;
      else if (href.startsWith('//')) a.href = 'https:' + href;
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
  root.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      if (src.startsWith('//')) img.src = 'https:' + src;
      else if (src.startsWith('/')) img.src = HOST + src;
    }
    const ss = img.getAttribute('srcset');
    if (ss) {
      img.srcset = ss.split(',').map(p => {
        const t = p.trim();
        if (t.startsWith('//')) return 'https:' + t;
        if (t.startsWith('/')) return HOST + t;
        return t;
      }).join(', ');
    }
    img.loading = 'lazy';
  });
}

function clean(root) {
  root.querySelectorAll('script, style, .mw-editsection, .reference, .references, .mw-empty-elt')
      .forEach(el => el.remove());
  root.querySelectorAll('span').forEach(el => {
    const txt = el.textContent.trim();
    if (txt === '[עריכה]' || txt === '[edit]') el.remove();
  });
}

/* Parse: scan top-level tables, build title→content pairs. */
let _sectionsCache = null;
async function getSectionsByTitle() {
  if (_sectionsCache) return _sectionsCache;
  const html = await fetchMainHTML();
  if (!html) return null;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  rewriteUrls(wrapper);
  clean(wrapper);

  // Gather ALL tables (including nested) in document order
  const tables = Array.from(wrapper.querySelectorAll('table'));
  const result = {}; // keyword → content table element

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    // Is this a "title" table? It has a td with style containing "height: 35px"
    const td35 = t.querySelector('td[style*="height: 35px"]');
    if (!td35) continue;
    const titleText = td35.textContent.trim();
    if (!titleText) continue;
    // Next table after this one = the content
    const contentTable = tables[i + 1];
    if (!contentTable) continue;
    // Don't overwrite if a duplicate appears later (main page has duplicates on mobile/desktop variants)
    if (!result[titleText]) result[titleText] = contentTable;
  }
  _sectionsCache = result;
  return result;
}

/* Public: get a section by partial keyword match against its title */
export async function getHaMichlolSection(keywords) {
  const map = await getSectionsByTitle();
  if (!map) return null;
  const titles = Object.keys(map);
  for (const title of titles) {
    for (const kw of keywords) {
      if (title.includes(kw)) {
        const el = map[title];
        return { title, html: filterHTMLBlocked(el.outerHTML) };
      }
    }
  }
  return null;
}

/* Reset section cache when content cache cleared */
const _origClear = clearHaMichlolCache;
export function fullReset() {
  _sectionsCache = null;
  _origClear();
}

/* Convenience getters per section */
export async function getPictureOfDay()    { return getHaMichlolSection(['תמונה מומלצת', 'תמונת היום', 'תמונה']); }
export async function getDidYouKnow()      { return getHaMichlolSection(['הידעת', 'ידעת']); }
export async function getTodayInCalendar() { return getHaMichlolSection(['היום בלוח', 'בלוח השנה']); }
export async function getTodayInHistory()  { return getHaMichlolSection(['היום בהיסטוריה', 'בהיסטוריה']); }
export async function getNews()            { return getHaMichlolSection(['חדשות', 'אקטואליה']); }
export async function getFeaturedArticle() { return getHaMichlolSection(['ערך מומלץ', 'הערך המומלץ']); }
export async function getNewArticles()     { return getHaMichlolSection(['ערכים חדשים', 'חדשים מבית המכלול']); }
export async function getParshaArticles()  { return getHaMichlolSection(['ערכים בפרשת השבוע', 'בפרשת השבוע', 'פרשת השבוע']); }
