/* Shared grid renderer for hidabroot articles */

import { getLang } from '../core/i18n.js';
import { escapeHTML } from '../core/utils.js';

export async function renderHidabrootGrid(containerId, fetcherFn) {
  const body = document.getElementById(containerId);
  if (!body) return;
  const lang = getLang();
  body.innerHTML = `<div class="shimmer">${lang === 'he' ? 'טוען...' : 'Loading...'}</div>`;

  const articles = await fetcherFn();
  if (!articles || articles.length === 0) {
    body.innerHTML = `<div class="hm-empty">${lang === 'he' ? 'לא נמצאו תכנים כרגע.' : 'No articles available.'}</div>`;
    return;
  }

  let html = '<div class="hb-grid">';
  for (const a of articles) {
    html += `<a class="hb-card" href="${escapeHTML(a.link)}" target="_blank" rel="noopener">
      ${a.image ? `<div class="hb-thumb" style="background-image:url('${escapeHTML(a.image)}')"></div>` : '<div class="hb-thumb hb-thumb-empty">📄</div>'}
      <div class="hb-info">
        <h4 class="hb-title">${escapeHTML(a.title)}</h4>
      </div>
    </a>`;
  }
  html += '</div>';
  body.innerHTML = html;
}
