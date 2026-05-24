/* יומיומי · data/content-filter.js
   Filters out political / state-related content per user's policy.
   Used by all external content modules (HaMichlol, Hidabroot, etc). */

const BLOCKED_PATTERNS = [
  'יום ירושלים',
  'יום העצמאות',
  'יום עצמאות',
  'שחרור ירושלים',
  'יום הזיכרון',
  'יום זיכרון לחללי',
  'יום השואה',
  'נתניהו',
  'בנימין נתניהו',
  'ראש הממשלה',
  'הכנסת',
  'הליכוד',
  'הציונות',
  'הציוני',
  'חיילים נהרגו',
  'חייל נהרג',
  'נפל בקרב',
  'פצוע בקרב',
  'פעולה צבאית',
  'מבצע צבאי',
  'בצה"ל',
  'דובר צה"ל'
];

/* Returns true if the given title or description contains any blocked pattern */
export function isBlocked(text) {
  if (!text) return false;
  const lower = String(text);
  for (const p of BLOCKED_PATTERNS) {
    if (lower.includes(p)) return true;
  }
  return false;
}

/* Filter an array of items, removing blocked ones.
   Each item is expected to have .title and (optional) .description. */
export function filterContent(items) {
  if (!Array.isArray(items)) return items;
  return items.filter(it => {
    if (!it) return false;
    if (isBlocked(it.title)) return false;
    if (isBlocked(it.description)) return false;
    return true;
  });
}

/* Remove blocked sections from HTML — used for HaMichlol content
   that comes as a single HTML chunk.
   IMPORTANT: only target LEAF items (li, single tr) — never remove
   div/p/section because they're usually containers that would cascade-delete
   the entire card content. */
export function filterHTMLBlocked(html) {
  if (!html) return html;
  try {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    // Only target list items and table rows that have NO nested li/tr
    // (i.e., leaf bullet points / news items)
    const candidates = wrapper.querySelectorAll('li, tr');
    for (const el of candidates) {
      // Skip if it contains nested li/tr — that means it's a container
      if (el.querySelector('li, tr')) continue;
      if (isBlocked(el.textContent)) {
        el.remove();
      }
    }
    return wrapper.innerHTML;
  } catch {
    return html;
  }
}
