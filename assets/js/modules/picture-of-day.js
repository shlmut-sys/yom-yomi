/* יומיומי · modules/picture-of-day.js — תמונת היום מהמכלול
   If today's HaMichlol template doesn't exist, fetch a random featured image instead. */
import { getPictureOfDay } from '../data/hamichlol.js';
import { fetchCached } from '../data/cache.js';

const HM_HOST = 'https://www.hamichlol.org.il';
const TTL = 6 * 60 * 60 * 1000;

/* Fallback: fetch the random-featured-image page from HaMichlol */
async function fetchRandomFeaturedImage() {
  const url = `${HM_HOST}/w/api.php?action=parse&page=${encodeURIComponent('המכלול:תמונה_נבחרת/בחירות_קודמות')}&format=json&prop=text&origin=*`;
  const data = await fetchCached(url, 'hm_potd_archive_v2', TTL, 7000);
  if (!data?.parse?.text?.['*']) return null;
  const html = data.parse.text['*'];
  // Find all <img> from this page (the archive of featured images)
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const imgs = wrapper.querySelectorAll('img');
  const valid = [];
  imgs.forEach(img => {
    let src = img.getAttribute('src') || '';
    if (!src) return;
    if (src.startsWith('//')) src = 'https:' + src;
    else if (src.startsWith('/')) src = HM_HOST + src;
    if (src.includes('.svg') || src.includes('icon') || src.includes('Logo')) return;
    if (img.width && img.width < 50) return;
    const caption = img.getAttribute('alt') || img.parentElement?.textContent?.trim() || '';
    valid.push({ src, caption: caption.slice(0, 200) });
  });
  if (valid.length === 0) return null;
  // Pick deterministically by day
  const idx = new Date().getDate() % valid.length;
  const pick = valid[idx];
  return `<div class="potd-fallback">
    <img src="${pick.src}" alt="" loading="lazy"/>
    <p class="potd-caption">${pick.caption || 'תמונה נבחרת מהמכלול'}</p>
  </div>`;
}

function isPlaceholderContent(html) {
  // Check if it's just an empty template link ("דף זה אינו קיים")
  if (!html) return true;
  if (html.length < 1200) return true; // very small = no real content
  if (html.includes('action=edit&amp;redlink=1')) return true;
  if (!html.includes('<img') && html.length < 2500) return true;
  return false;
}

export const PictureOfDayModule = {
  name: 'picture-of-day',

  async render() {
    const body = document.getElementById('potdBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">טוען...</div>`;

    const data = await getPictureOfDay();
    if (data && data.html && !isPlaceholderContent(data.html)) {
      body.innerHTML = `<div class="hm-content">${data.html}</div>`;
      return;
    }

    // Today's HaMichlol template doesn't exist — try the archive
    const fallback = await fetchRandomFeaturedImage();
    if (fallback) {
      body.innerHTML = fallback;
    } else {
      body.innerHTML = `<div class="hm-empty">תמונת היום של מכלול אינה זמינה כרגע.</div>`;
    }
  }
};
