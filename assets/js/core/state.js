/* יומיומי · core/state.js
   Central reactive state. Modules can subscribe to changes. */

const STORAGE_KEY = 'yomyomi.state.v1';

const DEFAULTS = {
  lang: 'he',                  // 'he' | 'en'
  city: null,                  // city object { key, he, en, lat, lon, tz, elev }
  cityKey: 'bet-shemesh',      // fallback
  weather: null,               // last fetched weather snapshot
  hdate: null,                 // current Hebrew date object (cached for the day)
  ctx: {},                     // day context (shabbat/chag/omer/etc.)
  parsha: null,
  yahrzeitExpanded: false,
  zmanimExpanded: false
};

class StateStore {
  constructor() {
    this.data = { ...DEFAULTS, ...this.load() };
    this.subs = new Map(); // key -> Set<fn>
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const obj = JSON.parse(raw);
      // Don't persist transient values
      delete obj.hdate;
      delete obj.ctx;
      delete obj.parsha;
      delete obj.weather;
      return obj;
    } catch { return {}; }
  }

  persist() {
    try {
      const persistable = {
        lang: this.data.lang,
        cityKey: this.data.cityKey,
        yahrzeitExpanded: this.data.yahrzeitExpanded,
        zmanimExpanded: this.data.zmanimExpanded
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {}
  }

  get(key) { return this.data[key]; }
  getAll() { return { ...this.data }; }

  set(key, value) {
    if (this.data[key] === value) return;
    this.data[key] = value;
    this.persist();
    this.notify(key, value);
  }

  setMany(obj) {
    let changed = false;
    for (const k of Object.keys(obj)) {
      if (this.data[k] !== obj[k]) {
        this.data[k] = obj[k];
        changed = true;
        this.notify(k, obj[k]);
      }
    }
    if (changed) this.persist();
  }

  on(key, fn) {
    if (!this.subs.has(key)) this.subs.set(key, new Set());
    this.subs.get(key).add(fn);
    return () => this.subs.get(key).delete(fn);
  }

  notify(key, value) {
    const set = this.subs.get(key);
    if (!set) return;
    for (const fn of set) {
      try { fn(value, this.data); } catch (e) { console.warn('[state] subscriber error:', e); }
    }
  }
}

export const state = new StateStore();
