/* יומיומי · data/cache.js — TTL-based localStorage cache */

const PREFIX = 'yomyomi.cache.';

export function cacheGet(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj?.t || !obj?.v) return null;
    if (maxAgeMs && (Date.now() - obj.t) > maxAgeMs) return null;
    return obj.v;
  } catch { return null; }
}

export function cacheSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch (e) {
    // localStorage may be full or disabled; ignore
  }
}

export function cacheClear(prefix = '') {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) toRemove.push(k);
    }
    for (const k of toRemove) localStorage.removeItem(k);
  } catch {}
}

/* Fetch with cache wrapper */
export async function fetchCached(url, key, maxAgeMs, timeoutMs = 8000) {
  const cached = cacheGet(key, maxAgeMs);
  if (cached) return cached;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    cacheSet(key, data);
    return data;
  } catch (err) {
    console.warn(`[fetchCached] failed: ${url}`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
