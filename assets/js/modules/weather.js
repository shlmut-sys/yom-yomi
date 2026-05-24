/* יומיומי · modules/weather.js — Extended daily weather */

import { state } from '../core/state.js';
import { getLang } from '../core/i18n.js';
import { fetchCached } from '../data/cache.js';

const CACHE_TTL = 30 * 60 * 1000;

const WMO_ICON = {
  0: '☀', 1: '🌤', 2: '⛅', 3: '☁',
  45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌦', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧',
  71: '🌨', 73: '🌨', 75: '❄',
  77: '❄',
  80: '🌦', 81: '🌧', 82: '⛈',
  85: '🌨', 86: '🌨',
  95: '⛈', 96: '⛈', 99: '⛈'
};
const WMO_DESC_HE = {
  0: 'בהיר', 1: 'בהיר חלקית', 2: 'מעונן חלקית', 3: 'מעונן',
  45: 'ערפל', 48: 'ערפל',
  51: 'גשם קל', 53: 'גשם', 55: 'גשם חזק',
  61: 'גשם קל', 63: 'גשם', 65: 'גשם חזק',
  71: 'שלג', 73: 'שלג', 75: 'שלג כבד',
  80: 'ממטרים', 81: 'ממטרים', 82: 'ממטרים חזקים',
  95: 'סופה', 96: 'סופה', 99: 'סופה'
};
const WMO_DESC_EN = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Cloudy',
  45: 'Fog', 48: 'Fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
};

function windDir(deg, lang) {
  const dirs_he = ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'];
  const dirs_en = ['N','NE','E','SE','S','SW','W','NW'];
  const arr = lang === 'he' ? dirs_he : dirs_en;
  return arr[Math.round(deg / 45) % 8];
}

function fmtHM(d, tz) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(d);
}

export const WeatherModule = {
  name: 'weather',

  async render() {
    const city = state.get('city');
    if (!city) return;
    const lang = getLang();

    // Quick (hero) weather: just icon + temp + desc
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      '&current=temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature' +
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max' +
      '&timezone=auto';
    const cacheKey = `weather_v2_${city.lat}_${city.lon}`;
    const data = await fetchCached(url, cacheKey, CACHE_TTL, 6000);
    if (!data?.current) return;

    const cur = data.current;
    const daily = data.daily;
    const t = Math.round(cur.temperature_2m);
    const code = cur.weather_code;
    const icon = WMO_ICON[code] || '☁';
    const desc = (lang === 'he' ? WMO_DESC_HE : WMO_DESC_EN)[code] || '';

    // Hero quick view
    const iconEl = document.getElementById('weatherIcon');
    const tempEl = document.getElementById('weatherTemp');
    const descEl = document.getElementById('weatherDesc');
    if (iconEl) iconEl.textContent = icon;
    if (tempEl) tempEl.textContent = `${t}°`;
    if (descEl) descEl.textContent = desc;

    // Extended weather card (if present in DOM)
    const ext = document.getElementById('weatherExtBody');
    if (ext) {
      const feels = Math.round(cur.apparent_temperature);
      const hum = Math.round(cur.relative_humidity_2m);
      const wind = Math.round(cur.wind_speed_10m);
      const windD = windDir(cur.wind_direction_10m || 0, lang);
      const maxT = daily?.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : null;
      const minT = daily?.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : null;
      const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
      const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;
      const uv = daily?.uv_index_max?.[0] != null ? Math.round(daily.uv_index_max[0]) : null;
      const rain = daily?.precipitation_probability_max?.[0] != null ? daily.precipitation_probability_max[0] : null;

      const tile = (label, val, icn) => `<div class="wx-tile">
        <span class="wx-icon">${icn}</span>
        <span class="wx-label">${label}</span>
        <span class="wx-val">${val}</span>
      </div>`;

      ext.innerHTML = `
        <div class="wx-main">
          <span class="wx-main-icon">${icon}</span>
          <span class="wx-main-temp">${t}°</span>
          <span class="wx-main-desc">${desc}</span>
        </div>
        <div class="wx-grid">
          ${maxT !== null ? tile(lang === 'he' ? 'מקסימום' : 'High', maxT + '°', '🌡️') : ''}
          ${minT !== null ? tile(lang === 'he' ? 'מינימום' : 'Low', minT + '°', '❄️') : ''}
          ${tile(lang === 'he' ? 'מורגש כמו' : 'Feels like', feels + '°', '🤔')}
          ${tile(lang === 'he' ? 'לחות' : 'Humidity', hum + '%', '💧')}
          ${tile(lang === 'he' ? 'רוח' : 'Wind', `${wind} ${lang === 'he' ? 'קמ"ש' : 'km/h'} ${windD}`, '🌬️')}
          ${rain !== null ? tile(lang === 'he' ? 'סיכוי גשם' : 'Rain', rain + '%', '☔') : ''}
          ${sunrise ? tile(lang === 'he' ? 'זריחה' : 'Sunrise', fmtHM(sunrise, city.tz), '🌅') : ''}
          ${sunset ? tile(lang === 'he' ? 'שקיעה' : 'Sunset', fmtHM(sunset, city.tz), '🌄') : ''}
          ${uv !== null ? tile(lang === 'he' ? 'UV' : 'UV', uv, '☀️') : ''}
        </div>
      `;
    }

    state.set('weather', { temp: t, code, icon, desc });
  }
};
