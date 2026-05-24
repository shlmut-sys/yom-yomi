/* יומיומי · location/cities.js — known cities with timezone + elevation */

export const CITIES = {
  /* Israel */
  'bet-shemesh':    { he:'בית שמש',     en:'Bet Shemesh',     lat:31.7456, lon:34.9881, tz:'Asia/Jerusalem',  elev:300 },
  'jerusalem':      { he:'ירושלים',     en:'Jerusalem',       lat:31.7683, lon:35.2137, tz:'Asia/Jerusalem',  elev:754 },
  'tel-aviv':       { he:'תל אביב',     en:'Tel Aviv',        lat:32.0853, lon:34.7818, tz:'Asia/Jerusalem',  elev:5 },
  'bnei-brak':      { he:'בני ברק',     en:'Bnei Brak',       lat:32.0807, lon:34.8338, tz:'Asia/Jerusalem',  elev:30 },
  'haifa':          { he:'חיפה',         en:'Haifa',           lat:32.7940, lon:34.9896, tz:'Asia/Jerusalem',  elev:200 },
  'tzfat':          { he:'צפת',          en:'Tzfat',           lat:32.9646, lon:35.4960, tz:'Asia/Jerusalem',  elev:900 },
  'beer-sheva':     { he:'באר שבע',     en:'Beer Sheva',      lat:31.2518, lon:34.7913, tz:'Asia/Jerusalem',  elev:280 },
  'ashdod':         { he:'אשדוד',        en:'Ashdod',          lat:31.8014, lon:34.6435, tz:'Asia/Jerusalem',  elev:30 },
  'petach-tikva':   { he:'פתח תקווה',   en:'Petach Tikva',    lat:32.0878, lon:34.8878, tz:'Asia/Jerusalem',  elev:40 },
  'netanya':        { he:'נתניה',        en:'Netanya',         lat:32.3215, lon:34.8532, tz:'Asia/Jerusalem',  elev:40 },
  'rishon-letzion': { he:'ראשון לציון', en:'Rishon LeZion',   lat:31.9710, lon:34.7891, tz:'Asia/Jerusalem',  elev:60 },
  'rehovot':        { he:'רחובות',       en:'Rehovot',         lat:31.8947, lon:34.8089, tz:'Asia/Jerusalem',  elev:75 },
  'kiryat-gat':     { he:'קריית גת',    en:'Kiryat Gat',      lat:31.6097, lon:34.7642, tz:'Asia/Jerusalem',  elev:140 },
  'ashkelon':       { he:'אשקלון',       en:'Ashkelon',        lat:31.6688, lon:34.5742, tz:'Asia/Jerusalem',  elev:65 },
  'modiin':         { he:'מודיעין',     en:'Modiin',          lat:31.8969, lon:35.0095, tz:'Asia/Jerusalem',  elev:320 },
  'eilat':          { he:'אילת',         en:'Eilat',           lat:29.5577, lon:34.9519, tz:'Asia/Jerusalem',  elev:12 },
  'tiberias':       { he:'טבריה',        en:'Tiberias',        lat:32.7959, lon:35.5310, tz:'Asia/Jerusalem',  elev:-200 },
  'nazareth':       { he:'נצרת',         en:'Nazareth',        lat:32.7029, lon:35.2966, tz:'Asia/Jerusalem',  elev:350 },

  /* World — for diaspora visitors */
  'new-york':       { he:'ניו יורק',     en:'New York',        lat:40.7128, lon:-74.0060, tz:'America/New_York', elev:10 },
  'london':         { he:'לונדון',       en:'London',          lat:51.5074, lon:-0.1278,  tz:'Europe/London',    elev:35 },
  'paris':          { he:'פריז',         en:'Paris',           lat:48.8566, lon:2.3522,   tz:'Europe/Paris',     elev:35 },
  'los-angeles':    { he:'לוס אנג\'לס',   en:'Los Angeles',     lat:34.0522, lon:-118.2437,tz:'America/Los_Angeles', elev:90 },
  'miami':          { he:'מיאמי',        en:'Miami',           lat:25.7617, lon:-80.1918, tz:'America/New_York', elev:2 },
  'toronto':        { he:'טורונטו',      en:'Toronto',         lat:43.6532, lon:-79.3832, tz:'America/Toronto',  elev:76 },
  'moscow':         { he:'מוסקבה',       en:'Moscow',          lat:55.7558, lon:37.6173,  tz:'Europe/Moscow',    elev:124 },
  'sydney':         { he:'סידני',        en:'Sydney',          lat:-33.8688,lon:151.2093, tz:'Australia/Sydney', elev:58 }
};

/* Find the nearest known city to given lat/lon (haversine distance) */
export function nearestCity(lat, lon) {
  let best = null, bestDist = Infinity;
  for (const [key, c] of Object.entries(CITIES)) {
    const dLat = lat - c.lat;
    const dLon = lon - c.lon;
    const dist = Math.sqrt(dLat*dLat + dLon*dLon);
    if (dist < bestDist) { bestDist = dist; best = key; }
  }
  return best ? { key: best, city: CITIES[best], distance: bestDist } : null;
}

export function getCity(key) {
  return CITIES[key] || CITIES['bet-shemesh'];
}
