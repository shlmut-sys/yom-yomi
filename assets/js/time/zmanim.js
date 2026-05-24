/* יומיומי · time/zmanim.js
   Build halachic zmanim object using kosher-zmanim. */

import { toJsDate } from '../core/utils.js';

/* Compute zmanim for given JS date + city */
export function buildZmanim(now, city) {
  try {
    const KZ = window.KosherZmanim;
    if (!KZ) return null;
    const loc = new KZ.GeoLocation(city.he || 'City', city.lat, city.lon, city.elev || 0, city.tz);
    const cal = new KZ.ComplexZmanimCalendar(loc);
    const cityNow = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
    cal.setDate(cityNow);

    /* Mapping: kosher-zmanim getter → friendly key */
    const map = {
      // tier 1
      alot72:           cal.getAlos72,
      alotHaShachar:    cal.getAlosHashachar,
      misheyakir:       cal.getMisheyakir,
      sunrise:          cal.getSunrise,
      sofZmanShmaMGA:   cal.getSofZmanShmaMGA,
      sofZmanShma:      cal.getSofZmanShmaGRA,
      sofZmanTfilaMGA:  cal.getSofZmanTfilaMGA,
      sofZmanTfila:     cal.getSofZmanTfilaGRA,
      chatzot:          cal.getChatzos,
      minchaGedola:     cal.getMinchaGedola,
      minchaKetana:     cal.getMinchaKetana,
      plagHamincha:     cal.getPlagHamincha,
      sunset:           cal.getSunset,
      tzais:            cal.getTzais,
      tzais85:          cal.getTzaisGeonim85,
      tzais72:          cal.getTzais72
    };

    const out = {};
    for (const [key, fn] of Object.entries(map)) {
      try {
        const v = fn.call(cal);
        out[key] = v;
      } catch {}
    }

    /* ===== Chatzot lailah by R' Nachman / Breslov shita =====
       6 sha'ot zmaniyot from tzeit hakochavim today
       until alot/sunrise of tomorrow. */
    try {
      const tzeit = out.tzais || out.tzais85;
      // compute tomorrow's alot
      const tomorrow = new Date(cityNow.getTime() + 24*60*60*1000);
      cal.setDate(tomorrow);
      const alotTomorrow = cal.getAlos72() || cal.getAlosHashachar();
      // restore today
      cal.setDate(cityNow);
      if (tzeit && alotTomorrow) {
        const tzMs = tzeit.toMillis ? tzeit.toMillis() : new Date(tzeit).getTime();
        const altMs = alotTomorrow.toMillis ? alotTomorrow.toMillis() : new Date(alotTomorrow).getTime();
        const nightMs = altMs - tzMs;
        if (nightMs > 0) {
          const sha_a_zmanit_lailah = nightMs / 12;
          const chatzotMs = tzMs + 6 * sha_a_zmanit_lailah;
          // Use KZ.DateTime if available, else just a JS Date wrapper
          if (KZ.luxon && KZ.luxon.DateTime) {
            out.chatzotLailaBreslov = KZ.luxon.DateTime.fromMillis(chatzotMs, { zone: city.tz });
          } else {
            out.chatzotLailaBreslov = new Date(chatzotMs);
          }
        }
      }
    } catch (e) {
      console.warn('[zmanim] chatzot breslov err', e);
    }

    return out;
  } catch (e) {
    console.warn('[zmanim] build err', e);
    return null;
  }
}

/* Candle lighting offset by city (Jerusalem = 40 min, else 20) */
export function getCandleOffset(cityKey) {
  if (cityKey === 'jerusalem' || cityKey === 'tzfat') return 40;
  return 18;
}

/* Helpers to extract individual times as JS Date */
export function getCandleTime(zmanim, cityKey) {
  if (!zmanim?.sunset) return null;
  const sunset = toJsDate(zmanim.sunset);
  if (!sunset) return null;
  const offset = getCandleOffset(cityKey);
  return new Date(sunset.getTime() - offset * 60000);
}

export function getHavdalahTime(zmanim) {
  return toJsDate(zmanim?.tzais85 || zmanim?.tzais);
}
