/* יומיומי · ui/modal.js — global modal with smart HaMichlol lookup */

import { fetchCached } from '../data/cache.js';
import { getLang } from '../core/i18n.js';

const TTL = 7 * 24 * 60 * 60 * 1000;
const HM_HOST = 'https://www.hamichlol.org.il';

export function initModal() {
  const m = document.getElementById('modal');
  if (!m) return;
  m.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

export function closeModal() {
  const m = document.getElementById('modal');
  if (m) m.hidden = true;
}

/* Helper — extract clean intro text + first image from HaMichlol article HTML */
function parseHaMichlolArticle(html) {
  if (!html) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // Remove infobox tables, navigation, references, edit links
  wrapper.querySelectorAll('table.infobox, .mw-editsection, .reference, .references, .navigation-only, .ambox, .toc, table.metadata').forEach(el => el.remove());

  // First image from main content
  let image = null;
  const imgEl = wrapper.querySelector('img');
  if (imgEl) {
    let src = imgEl.getAttribute('src');
    if (src) {
      if (src.startsWith('//')) image = 'https:' + src;
      else if (src.startsWith('/')) image = HM_HOST + src;
      else image = src;
    }
  }

  // First 3-4 paragraphs of text
  const paras = wrapper.querySelectorAll('p');
  let textParts = [];
  for (const p of paras) {
    const txt = p.textContent.trim();
    if (txt.length > 30) textParts.push(txt);
    if (textParts.length >= 4) break;
  }
  const extract = textParts.join('\n\n');
  if (!extract) return null;
  return { extract, image };
}

/* Smart HaMichlol lookup — uses OpenSearch then page parse */
async function smartHaMichlolLookup(query) {
  if (!query) return null;
  const cleanQuery = query.replace(/\s*[-–—]\s*.+$/, '').replace(/[()]/g, '').trim();
  const searchUrl = `${HM_HOST}/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=3&format=json&origin=*`;
  const searchData = await fetchCached(searchUrl, `hm_search_${cleanQuery}`, TTL, 6000);
  if (!searchData || !Array.isArray(searchData) || !searchData[1] || searchData[1].length === 0) return null;
  const candidates = searchData[1];

  // Find best candidate by word overlap
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  let best = candidates[0];
  let bestScore = queryWords.filter(w => candidates[0].includes(w)).length;
  for (const title of candidates) {
    const score = queryWords.filter(w => title.includes(w)).length;
    if (score > bestScore) { best = title; bestScore = score; }
  }

  // Fetch the full article HTML
  const articleUrl = `${HM_HOST}/w/api.php?action=parse&page=${encodeURIComponent(best)}&format=json&prop=text&origin=*`;
  const articleData = await fetchCached(articleUrl, `hm_article_${best}`, TTL, 8000);
  if (!articleData?.parse?.text?.['*']) return null;

  const parsed = parseHaMichlolArticle(articleData.parse.text['*']);
  if (!parsed) return null;

  return {
    title: best,
    extract: parsed.extract,
    image: parsed.image,
    link: `${HM_HOST}/${encodeURIComponent(best)}`
  };
}

export async function openModal({ title, meta, body, wikiQuery }) {
  const m = document.getElementById('modal');
  if (!m) return;
  document.getElementById('modalTitle').textContent = title || '—';
  document.getElementById('modalMeta').textContent = meta || '';
  const bodyEl = document.getElementById('modalBody');
  const linkEl = document.getElementById('modalLink');
  linkEl.hidden = true;

  const lang = getLang();

  if (body) {
    bodyEl.innerHTML = `
      <div class="modal-body-text">${body}</div>
      <div class="modal-loading">
        <span class="shimmer">${lang === 'he' ? 'מחפש מידע במכלול...' : 'Searching HaMichlol...'}</span>
      </div>`;
  } else {
    bodyEl.innerHTML = `<span class="shimmer">${lang === 'he' ? 'מחפש במכלול...' : 'Searching...'}</span>`;
  }
  m.hidden = false;

  if (!wikiQuery) return;

  const result = await smartHaMichlolLookup(wikiQuery);
  if (m.hidden) return;
  if (result) {
    let html = '';
    if (result.image) {
      html += `<img class="modal-thumb" src="${result.image}" alt="" loading="lazy"/>`;
    }
    if (body) html += `<div class="modal-body-text" style="margin-bottom:1rem">${body}</div>`;
    html += `<div class="modal-body-text">${result.extract.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>`;
    bodyEl.innerHTML = html;
    linkEl.href = result.link;
    linkEl.innerHTML = `${lang === 'he' ? 'לערך המלא במכלול' : 'Full article on HaMichlol'} ↗`;
    linkEl.hidden = false;
  } else {
    if (body) {
      bodyEl.innerHTML = `<div class="modal-body-text">${body}</div>
        <div class="modal-note">${lang === 'he' ? 'לא נמצא ערך נפרד במכלול.' : 'No matching HaMichlol article.'}</div>`;
    } else {
      bodyEl.innerHTML = `<div class="modal-note">${lang === 'he' ? 'לא נמצא ערך נפרד במכלול.' : 'No matching HaMichlol article.'}</div>`;
    }
  }
}
