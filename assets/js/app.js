/* יומיומי · app.js — orchestrator only
   Loads all modules, wires events, runs the main render loop.
   © איתמר טיפליצקי · מעבדות שלימות */

import { state } from './core/state.js';
import { initI18n, getLang, t } from './core/i18n.js';
import { initLocation } from './location/ip-locate.js';
import { openCityPicker } from './ui/city-picker.js';
import { getHDate, getDayContext, getParsha } from './time/hebrew-date.js';
import { applyDailyTheme } from './ui/theme.js';
import { initModal } from './ui/modal.js';

// Card modules
import { ParshaModule }       from './modules/parsha.js';
import { YahrzeitModule }     from './modules/yahrzeit.js';
import { BreslovModule }      from './modules/breslov.js';
import { HalachaModule }      from './modules/halacha.js';
import { PitgamModule }       from './modules/pitgam.js';
import { HistoryModule }      from './modules/history.js';
import { TravelModule }       from './modules/travel.js';
import { WeatherModule }      from './modules/weather.js';
import { ZmanimTableModule }  from './modules/zmanim-table.js';
import { LearningModule }     from './modules/learning.js';
import { TekufotModule }      from './modules/tekufot.js';
import { LunarModule }        from './modules/lunar.js';
import { SixthMillenniumModule } from './modules/sixth-millennium.js';
import { PictureOfDayModule }    from './modules/picture-of-day.js';
import { DidYouKnowModule }      from './modules/did-you-know.js';
import { FeaturedArticleModule } from './modules/featured-article.js';
// NewsModule removed per user request - HaMichlol news card deleted
import { HebrewCalendarModule }  from './modules/hebrew-calendar.js';
import { NewArticlesModule }     from './modules/new-articles.js';
import { ParshaArticlesModule }  from './modules/parsha-articles.js';
import { DafYomiVideoModule }    from './modules/daf-yomi-video.js';
import { HealthArticlesModule }  from './modules/health-articles.js';
import { FamilyArticlesModule }  from './modules/family-articles.js';
import { HistoryArticlesModule } from './modules/history-articles.js';
import { IBreslevModule }        from './modules/ibreslev.js';
import { MusicNewsModule }       from './modules/music-news.js';
import { BreslevBooksModule }    from './modules/breslev-books.js';
import { clearHaMichlolCache }   from './data/hamichlol.js';
import { clearHidabrootCache }   from './data/hidabroot.js';
import { clearProxyCache }       from './data/proxy-fetch.js';
import { detectViaGPS }          from './location/ip-locate.js';
import { showToast }             from './ui/toast.js';
import { buildZmanim }           from './time/zmanim.js';
import { toJsDate }              from './core/utils.js';

const MODULES = [
  ParshaModule, YahrzeitModule, BreslovModule, HalachaModule, PitgamModule,
  HistoryModule, TravelModule, WeatherModule, SixthMillenniumModule,
  ZmanimTableModule, LearningModule, TekufotModule, LunarModule,
  PictureOfDayModule, DidYouKnowModule, FeaturedArticleModule,
  HebrewCalendarModule, NewArticlesModule, ParshaArticlesModule,
  DafYomiVideoModule, HealthArticlesModule, FamilyArticlesModule, HistoryArticlesModule,
  IBreslevModule, MusicNewsModule, BreslevBooksModule
];

/* ===== Main render: recomputes Hebrew date, parsha, ctx, then renders all modules ===== */
async function renderAll() {
  const city = state.get('city');
  if (!city) return;
  const now = new Date();

  // Wait for hebcal libs to be ready (they're CDN-loaded)
  if (typeof hebcal === 'undefined' || !hebcal.HDate) {
    setTimeout(renderAll, 200);
    return;
  }

  const hdate = getHDate(now, city);
  const ctx = getDayContext(now, city, hdate);
  const parsha = getParsha(hdate);

  state.setMany({ hdate, ctx, parsha });

  // Apply visual theme based on day/state
  applyDailyTheme();

  // Update header location label
  const locName = document.getElementById('locName');
  if (locName) locName.textContent = city[getLang() === 'he' ? 'he' : 'en'];

  // Render every module — isolate errors so one broken module doesn't kill the rest
  for (const m of MODULES) {
    try {
      const result = m.render?.(ctx);
      if (result && typeof result.then === 'function') {
        result.catch(err => console.warn(`[${m.name}] async render error`, err));
      }
    } catch (err) {
      console.warn(`[${m.name}] render error`, err);
    }
  }

  // Holiday banner
  renderHolidayBanner(ctx);
}

function renderHolidayBanner(ctx) {
  const banner = document.getElementById('holidayBanner');
  if (!banner) return;
  if (ctx.isChag || ctx.isErevChag || ctx.isShabbat || ctx.isErevShabbat) {
    const lang = getLang();
    const lblEl = document.getElementById('hbLabel');
    const nameEl = document.getElementById('hbName');
    let label, name;
    if (ctx.isChag) {
      label = lang === 'he' ? 'היום' : 'Today';
      name = ctx.chagName || (lang === 'he' ? 'חג' : 'Chag');
    } else if (ctx.isErevChag) {
      label = lang === 'he' ? 'הערב נכנס' : 'Tonight';
      name = ctx.chagName || (lang === 'he' ? 'החג' : 'Chag');
    } else if (ctx.isShabbat) {
      label = lang === 'he' ? 'היום' : 'Today';
      name = lang === 'he' ? 'שבת קודש' : 'Shabbat Kodesh';
    } else if (ctx.isErevShabbat) {
      label = lang === 'he' ? 'הערב נכנסת' : 'Tonight';
      name = lang === 'he' ? 'שבת קודש' : 'Shabbat Kodesh';
    }
    if (lblEl) lblEl.textContent = label;
    if (nameEl) nameEl.textContent = name;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

/* ===== Bootstrap ===== */
async function bootstrap() {
  initI18n();
  initModal();

  // Init modules that have an init() (one-time setup)
  for (const m of MODULES) {
    try { m.init?.(); } catch (err) { console.warn(`[${m.name}] init err`, err); }
  }

  // Wire location button - opens the city picker
  const locBtn = document.getElementById('locationBtn');
  if (locBtn) {
    locBtn.addEventListener('click', () => {
      openCityPicker();
    });
  }

  // Re-render when city or lang changes
  document.addEventListener('yomyomi:langchange', () => renderAll());
  document.addEventListener('yomyomi:city-change', () => renderAll());

  /* ====== Tone (light/dark) toggle ====== */
  const TONE_KEY = 'yomyomi.tone';
  const applyTone = (tone) => {
    document.body.setAttribute('data-tone', tone);
    try { localStorage.setItem(TONE_KEY, tone); } catch {}
    const ic = document.getElementById('toneIcon');
    if (ic) ic.textContent = tone === 'light' ? '🌙' : '☀';
  };
  // Initialize tone from saved (default: light)
  const savedTone = (() => { try { return localStorage.getItem(TONE_KEY); } catch { return null; } })();
  applyTone(savedTone === 'dark' ? 'dark' : 'light');

  const toneBtn = document.getElementById('toneToggle');
  if (toneBtn) {
    toneBtn.addEventListener('click', () => {
      const cur = document.body.getAttribute('data-tone') || 'dark';
      applyTone(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* ====== Hero "detect precise location" button (GPS) ====== */
  const heroBtn = document.getElementById('heroDetectBtn');
  if (heroBtn) {
    const heroBtnHTML = heroBtn.innerHTML; // preserve original structure
    heroBtn.addEventListener('click', async () => {
      const lang = getLang();
      heroBtn.disabled = true;
      heroBtn.innerHTML = `<span class="hdb-icon">📡</span><span class="hdb-text">${lang === 'he' ? 'מאתר...' : 'Locating...'}</span>`;
      let result = null;
      try {
        result = await detectViaGPS();
      } catch (err) {
        console.error('[GPS] error:', err);
      }
      heroBtn.disabled = false;
      heroBtn.innerHTML = heroBtnHTML;
      if (result) {
        const cityName = result.city[lang === 'he' ? 'he' : 'en'];
        showToast(`✓ ${lang === 'he' ? 'זוהה' : 'Located'}: ${cityName}`);
        renderAll();
      } else {
        // If geolocation isn't available (insecure context, denied, etc.) — guide user to manual picker
        showToast(lang === 'he'
          ? 'לא הצלחתי לזהות אוטומטית — אנא בחר עיר מהרשימה'
          : 'Could not auto-detect — please pick a city manually');
        openCityPicker();
      }
    });
  }

  // Auto-detect location (IP)
  try {
    await initLocation();
  } catch (err) {
    console.warn('[location] init err', err);
  }

  // First render
  await renderAll();

  // Re-render every 60 seconds
  setInterval(() => renderAll(), 60 * 1000);

  // Check at every minute if tzeit hakochavim has just passed (= new Hebrew day) →
  // clear HaMichlol cache and force re-fetch.
  let lastTzeitKey = null;
  setInterval(() => {
    try {
      const city = state.get('city');
      if (!city) return;
      const now = new Date();
      const z = buildZmanim(now, city);
      const tzeit = toJsDate(z?.tzais || z?.tzais85);
      if (!tzeit) return;
      // Build a key per "Hebrew day". After tzeit, new Hebrew day starts.
      const tzKey = `${tzeit.getFullYear()}-${tzeit.getMonth()}-${tzeit.getDate()}`;
      if (now >= tzeit && lastTzeitKey !== tzKey) {
        lastTzeitKey = tzKey;
        console.log('[refresh] tzeit hakochavim — refreshing external content');
        clearHaMichlolCache();
        clearHidabrootCache();
        clearProxyCache();
        renderAll();
      } else if (lastTzeitKey === null) {
        lastTzeitKey = tzKey;
      }
    } catch (e) {
      console.warn('[refresh] tzeit check err', e);
    }
  }, 60 * 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

/* ===== Service Worker =====
   Temporarily DISABLED during development.
   Also unregister any previous SW to prevent stale cache. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    for (const r of regs) r.unregister();
  }).catch(() => {});
  if (window.caches) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
  }
}
