/* יומיומי · location/ip-locate.js
   Auto-detect user location via multiple free IP-geo services.
   No permission prompts — IP-only lookup. */

import { cacheGet, cacheSet } from '../data/cache.js';
import { nearestCity, getCity, CITIES } from './cities.js';
import { state } from '../core/state.js';

const CACHE_KEY = 'yomyomi.iploc';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/* Sources (no API key needed). Try in order, first success wins. */
const SOURCES = [
  {
    name: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    parse: (d) => (d && d.latitude && d.longitude)
      ? { lat: +d.latitude, lon: +d.longitude, city: d.city || '', country: d.country_name || '' }
      : null
  },
  {
    name: 'ipwho.is',
    url: 'https://ipwho.is/',
    parse: (d) => (d && d.success && d.latitude)
      ? { lat: +d.latitude, lon: +d.longitude, city: d.city || '', country: d.country || '' }
      : null
  },
  {
    name: 'geojs.io',
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parse: (d) => (d && d.latitude)
      ? { lat: +d.latitude, lon: +d.longitude, city: d.city || '', country: d.country || '' }
      : null
  }
];

async function fetchWithTimeout(url, timeoutMs = 4500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

export async function detectLocation() {
  // Check cache
  const cached = cacheGet(CACHE_KEY, CACHE_TTL);
  if (cached) {
    console.log('[ip-locate] cache hit:', cached);
    return cached;
  }

  // Try each source until one succeeds
  for (const src of SOURCES) {
    try {
      const raw = await fetchWithTimeout(src.url, 5000);
      const parsed = src.parse(raw);
      if (!parsed) continue;
      const match = nearestCity(parsed.lat, parsed.lon);
      if (!match) continue;
      const result = {
        cityKey: match.key,
        city: match.city,
        distance: match.distance,
        detectedCity: parsed.city,
        detectedCountry: parsed.country,
        source: src.name,
        timestamp: Date.now()
      };
      cacheSet(CACHE_KEY, result);
      console.log(`[ip-locate] success via ${src.name}:`, result);
      return result;
    } catch (e) {
      console.warn(`[ip-locate] ${src.name} failed:`, e.message);
    }
  }

  console.warn('[ip-locate] all sources failed');
  return null;
}

export async function initLocation() {
  // If user manually chose a city — respect it
  const userChose = (() => {
    try { return !!localStorage.getItem('yomyomi.userChoseCity'); } catch { return false; }
  })();
  const savedKey = state.get('cityKey');

  if (userChose && savedKey && CITIES[savedKey]) {
    state.set('city', getCity(savedKey));
    return getCity(savedKey);
  }

  // Otherwise — auto-detect via IP
  const result = await detectLocation();
  if (result && result.cityKey) {
    state.setMany({ cityKey: result.cityKey, city: result.city });
    return result.city;
  }

  // Final fallback
  const fallback = getCity(savedKey || 'bet-shemesh');
  state.setMany({ cityKey: savedKey || 'bet-shemesh', city: fallback });
  return fallback;
}

export function setCityManual(cityKey) {
  const city = getCity(cityKey);
  state.setMany({ cityKey, city });
  try { localStorage.setItem('yomyomi.userChoseCity', '1'); } catch {}
  return city;
}

/* Allow clearing the manual flag — for "go back to auto" */
export function clearManualCity() {
  try { localStorage.removeItem('yomyomi.userChoseCity'); } catch {}
}

/* GPS-based precise location (asks user permission) */
export function detectViaGPS() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const match = nearestCity(lat, lon);
        if (!match) { resolve(null); return; }
        // Save permanently
        state.setMany({ cityKey: match.key, city: match.city });
        try { localStorage.setItem('yomyomi.userChoseCity', '1'); } catch {}
        resolve({ cityKey: match.key, city: match.city, lat, lon });
      },
      (err) => {
        console.warn('[gps] permission denied or error:', err.message);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
