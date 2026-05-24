/* יומיומי · data/loader.js — async JSON loader with cache */

const _memoryCache = new Map();

export async function loadJSON(path) {
  if (_memoryCache.has(path)) return _memoryCache.get(path);
  const promise = fetch(path)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
      return r.json();
    })
    .catch(err => {
      console.warn(`[loader] failed: ${path}`, err);
      _memoryCache.delete(path);
      return null;
    });
  _memoryCache.set(path, promise);
  return promise;
}

/* Tzadikim are split per Hebrew month - load on demand */
export async function loadTzadikimMonth(monthKey) {
  if (!monthKey) return null;
  return loadJSON(`./data/tzadikim/${monthKey}.json`);
}

export async function loadPitgamim(category = 'sephardi') {
  return loadJSON(`./data/pitgamim/${category}.json`);
}

export async function loadBreslov() {
  return loadJSON('./data/breslov/likutei.json');
}

export async function loadHalachaDaily() {
  return loadJSON('./data/halacha/daily.json');
}

export async function loadTravelDestinations() {
  return loadJSON('./data/travel/destinations.json');
}
