/* יומיומי · modules/travel.js
   Travel destinations as horizontal marquee (right-to-left).
   Fetches Wikipedia images automatically. */

import { getLang } from '../core/i18n.js';
import { dayOfYear, escapeHTML } from '../core/utils.js';
import { loadTravelDestinations } from '../data/loader.js';
import { fetchCached } from '../data/cache.js';
import { openModal } from '../ui/modal.js';

const WIKI_TTL = 30 * 24 * 60 * 60 * 1000;

const FALLBACK = [
  { he: { name: 'מירון', country: 'ישראל', desc: 'קבר רבי שמעון בר יוחאי' }, wikiHe: 'מירון', emoji: '🕯️' },
  { he: { name: 'אומן', country: 'אוקראינה', desc: 'קבר רבי נחמן' }, wikiHe: 'אומן (אוקראינה)', emoji: '⛪' },
  { he: { name: 'הכותל המערבי', country: 'ירושלים', desc: 'שריד בית המקדש' }, wikiHe: 'הכותל המערבי', emoji: '🕍' },
  { he: { name: 'צפת', country: 'ישראל', desc: 'עיר המקובלים' }, wikiHe: 'צפת', emoji: '🌌' }
];

async function fetchWikiThumb(title) {
  if (!title) return null;
  const url = `https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchCached(url, `wikithumb_${title}`, WIKI_TTL, 6000);
  if (!data) return null;
  return data.thumbnail?.source || data.originalimage?.source || null;
}

export const TravelModule = {
  name: 'travel',

  async render() {
    const track = document.getElementById('travelTrack');
    if (!track) return;

    // Draw FALLBACK immediately so the marquee never appears empty
    let list = FALLBACK;
    let data = null;
    try {
      data = await loadTravelDestinations();
    } catch (e) {
      console.warn('[travel] data load err', e);
    }
    if (data?.destinations && Array.isArray(data.destinations) && data.destinations.length >= 4) {
      list = data.destinations;
    }

    // Show 8-12 destinations (whichever the data has)
    const lang = getLang();
    const count = Math.min(12, list.length);
    const today = dayOfYear();
    const picks = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
      const idx = (today * 3 + i * 17) % list.length;
      if (used.has(idx)) continue;
      used.add(idx);
      picks.push(list[idx]);
    }

    // First, fetch ALL images, then keep ONLY destinations that have an image
    track.innerHTML = `<div style="padding:2rem;color:var(--c-text-3);">טוען מקומות...</div>`;
    const picksWithImg = [];
    await Promise.all(picks.map(async (d) => {
      const wikiTitle = d.wikiHe || (lang === 'he' ? d.he.name : d.en?.name);
      try {
        const src = await fetchWikiThumb(wikiTitle);
        if (src) picksWithImg.push({ ...d, image: src, wikiTitle });
      } catch {}
    }));

    if (picksWithImg.length === 0) {
      track.innerHTML = `<div style="padding:2rem;color:var(--c-text-3);">לא נמצאו מקומות עם תמונות</div>`;
      return;
    }

    // Build cells with both Google Maps + HaMichlol modal
    const buildCell = (d, i) => {
      const text = lang === 'he' ? d.he : (d.en || d.he);
      const mapsQuery = encodeURIComponent(`${text.name} ${text.country || ''}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
      return `<div class="travel-cell" data-idx="${i}" data-wiki="${escapeHTML(d.wikiTitle || text.name)}">
        <div class="travel-thumb" style="background-image:url('${escapeHTML(d.image)}')"></div>
        <div class="travel-info">
          <h4 class="travel-name">${escapeHTML(text.name)}</h4>
          <p class="travel-country">${escapeHTML(text.country || '')}</p>
          <p class="travel-desc">${escapeHTML(text.desc || '')}</p>
          <div class="travel-actions">
            <a class="travel-action travel-map" href="${mapsUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🗺️ מפה</a>
            <button class="travel-action travel-info-btn" type="button">ℹ️ מידע</button>
          </div>
        </div>
      </div>`;
    };

    const cells = picksWithImg.map(buildCell).join('');
    track.innerHTML = cells + cells; // duplicate for seamless marquee

    // Wire click handlers (only for info button)
    track.querySelectorAll('.travel-cell').forEach(cell => {
      const infoBtn = cell.querySelector('.travel-info-btn');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wiki = cell.getAttribute('data-wiki');
          const idx = parseInt(cell.getAttribute('data-idx'), 10);
          const d = picksWithImg[idx];
          if (!d) return;
          const text = lang === 'he' ? d.he : (d.en || d.he);
          openModal({
            title: text.name,
            meta: text.country || '',
            body: text.desc || '',
            wikiQuery: wiki
          });
        });
      }
    });
  }
};
