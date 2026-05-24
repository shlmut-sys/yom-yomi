/* יומיומי · modules/daf-yomi-video.js — דף יומי מהידברות */
import { getDafYomi } from '../data/hidabroot.js';
import { getLang } from '../core/i18n.js';
import { escapeHTML } from '../core/utils.js';

export const DafYomiVideoModule = {
  name: 'daf-yomi-video',
  async render() {
    const body = document.getElementById('dafYomiBody');
    if (!body) return;
    const lang = getLang();
    body.innerHTML = `<div class="shimmer">${lang === 'he' ? 'טוען...' : 'Loading...'}</div>`;

    const data = await getDafYomi();
    if (!data || !data.id) {
      body.innerHTML = `<div class="hm-empty">${lang === 'he' ? 'לא נמצא דף יומי כרגע.' : 'No daf yomi available.'}</div>`;
      return;
    }

    body.innerHTML = `
      <div class="dy-wrap">
        <a class="dy-link" href="${data.link}" target="_blank" rel="noopener">
          ${data.image ? `<div class="dy-thumb" style="background-image:url('${escapeHTML(data.image)}')"></div>` : ''}
          <div class="dy-info">
            <h3 class="dy-title">${escapeHTML(data.title)}</h3>
            <div class="dy-cta">
              <span class="dy-play">▶</span>
              <span class="dy-cta-text">${lang === 'he' ? 'צפה בהידברות' : 'Watch on Hidabroot'}</span>
            </div>
          </div>
        </a>
      </div>
    `;
  }
};
