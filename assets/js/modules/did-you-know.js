/* יומיומי · modules/did-you-know.js — הידעת? מהמכלול
   If today's template doesn't exist, fetch from the archive page. */
import { getDidYouKnow } from '../data/hamichlol.js';
import { fetchCached } from '../data/cache.js';

const HM_HOST = 'https://www.hamichlol.org.il';
const TTL = 6 * 60 * 60 * 1000;

async function fetchRandomDYK() {
  const url = `${HM_HOST}/w/api.php?action=parse&page=${encodeURIComponent('המכלול:הידעת')}&format=json&prop=text&origin=*`;
  const data = await fetchCached(url, 'hm_dyk_archive_v2', TTL, 7000);
  if (!data?.parse?.text?.['*']) return null;
  const html = data.parse.text['*'];
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  // Get all paragraphs that look like "Did you know" facts
  const paras = wrapper.querySelectorAll('li');
  const valid = [];
  paras.forEach(p => {
    const txt = p.textContent.trim();
    if (txt.length < 30 || txt.length > 400) return;
    if (txt.includes('עריכה') || txt.includes('[edit]')) return;
    valid.push(p.innerHTML);
  });
  if (valid.length === 0) return null;
  const idx = (new Date().getDate() * 3 + new Date().getMonth()) % valid.length;
  return `<div class="dyk-fallback"><div class="dyk-item">${valid[idx]}</div></div>`;
}

function isPlaceholderContent(html) {
  if (!html) return true;
  if (html.length < 1200) return true;
  if (html.includes('action=edit&amp;redlink=1')) return true;
  return false;
}

export const DidYouKnowModule = {
  name: 'did-you-know',

  async render() {
    const body = document.getElementById('dykBody');
    if (!body) return;
    body.innerHTML = `<div class="shimmer">טוען...</div>`;
    const data = await getDidYouKnow();
    if (data && data.html && !isPlaceholderContent(data.html)) {
      body.innerHTML = `<div class="hm-content">${data.html}</div>`;
      return;
    }
    const fallback = await fetchRandomDYK();
    if (fallback) {
      body.innerHTML = fallback;
    } else {
      body.innerHTML = `<div class="hm-empty">תוכן "הידעת?" אינו זמין כרגע.</div>`;
    }
  }
};
