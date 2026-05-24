/* יומיומי · ui/city-picker.js
   Modal picker — searchable list of all cities. */

import { CITIES } from '../location/cities.js';
import { setCityManual } from '../location/ip-locate.js';
import { getLang } from '../core/i18n.js';
import { state } from '../core/state.js';
import { showToast } from './toast.js';

const ISRAEL_KEYS = [
  'bet-shemesh','jerusalem','tel-aviv','bnei-brak','haifa','tzfat','beer-sheva','ashdod',
  'petach-tikva','netanya','rishon-letzion','rehovot','kiryat-gat','ashkelon','modiin',
  'eilat','tiberias','nazareth'
];

let pickerEl = null;

function ensurePicker() {
  if (pickerEl) return pickerEl;
  pickerEl = document.createElement('div');
  pickerEl.id = 'cityPicker';
  pickerEl.className = 'modal city-picker-modal';
  pickerEl.hidden = true;
  pickerEl.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-panel city-picker-panel" role="dialog" aria-modal="true">
      <button class="modal-close" data-close>×</button>
      <h3 class="modal-title" id="cityPickerTitle">בחר עיר</h3>
      <input type="text" class="city-search" id="citySearchInput" placeholder="חפש עיר..." />
      <div class="city-groups" id="cityGroups"></div>
    </div>
  `;
  document.body.appendChild(pickerEl);

  // Click handlers
  pickerEl.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closePicker();
    const item = e.target.closest('[data-city-key]');
    if (item) {
      const key = item.getAttribute('data-city-key');
      const c = setCityManual(key);
      closePicker();
      const lang = getLang();
      showToast(`${lang === 'he' ? 'עבר ל-' : 'Moved to '}${c[lang === 'he' ? 'he' : 'en']}`);
      // Trigger rerender
      document.dispatchEvent(new CustomEvent('yomyomi:city-change'));
    }
  });

  // Search
  pickerEl.querySelector('#citySearchInput').addEventListener('input', (e) => {
    renderList(e.target.value.trim().toLowerCase());
  });

  return pickerEl;
}

function renderList(filter = '') {
  const groupsEl = pickerEl.querySelector('#cityGroups');
  const lang = getLang();
  const israel = ISRAEL_KEYS.filter(k => CITIES[k]);
  const world = Object.keys(CITIES).filter(k => !ISRAEL_KEYS.includes(k));

  function matches(key) {
    if (!filter) return true;
    const c = CITIES[key];
    return c.he.toLowerCase().includes(filter) ||
           c.en.toLowerCase().includes(filter) ||
           key.toLowerCase().includes(filter);
  }

  const isIL = israel.filter(matches);
  const isW = world.filter(matches);

  function renderGroup(title, keys) {
    if (keys.length === 0) return '';
    let html = `<div class="city-group-title">${title}</div><div class="city-grid">`;
    for (const k of keys) {
      const c = CITIES[k];
      const isActive = state.get('cityKey') === k;
      html += `<button class="city-pick-btn${isActive ? ' active' : ''}" data-city-key="${k}">
        <span class="cpb-he">${c.he}</span>
        <span class="cpb-en">${c.en}</span>
      </button>`;
    }
    html += '</div>';
    return html;
  }

  let html = '';
  html += renderGroup(lang === 'he' ? 'ישראל' : 'Israel', isIL);
  html += renderGroup(lang === 'he' ? 'העולם' : 'World', isW);

  if (isIL.length === 0 && isW.length === 0) {
    html = `<div class="city-empty">${lang === 'he' ? 'לא נמצאה עיר' : 'No matches'}</div>`;
  }

  groupsEl.innerHTML = html;
}

export function openCityPicker() {
  ensurePicker();
  const lang = getLang();
  pickerEl.querySelector('#cityPickerTitle').textContent = lang === 'he' ? 'בחר עיר' : 'Choose City';
  pickerEl.querySelector('#citySearchInput').placeholder = lang === 'he' ? 'חפש עיר...' : 'Search city...';
  pickerEl.querySelector('#citySearchInput').value = '';
  renderList('');
  pickerEl.hidden = false;
  setTimeout(() => pickerEl.querySelector('#citySearchInput').focus(), 80);
}

function closePicker() {
  if (pickerEl) pickerEl.hidden = true;
}
