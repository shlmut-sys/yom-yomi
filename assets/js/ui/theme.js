/* יומיומי · ui/theme.js — set body data-attrs that drive CSS palette */

import { state } from '../core/state.js';

export function applyDailyTheme() {
  const body = document.body;
  const now = new Date();
  body.setAttribute('data-day', String(now.getDay()));

  const ctx = state.get('ctx') || {};
  body.setAttribute('data-shabbat',     ctx.isShabbatActive ? '1' : '0');
  body.setAttribute('data-chag',        ctx.isChag ? '1' : '0');
  body.setAttribute('data-rosh-chodesh',ctx.isRoshChodesh ? '1' : '0');
  body.setAttribute('data-omer',        ctx.isOmer ? '1' : '0');
  body.setAttribute('data-chanukah',    ctx.isChanukah ? '1' : '0');
  if (ctx.monthKey)      body.setAttribute('data-month', ctx.monthKey);
  if (ctx.hdayNum != null) {
    body.setAttribute('data-day-of-month', String(ctx.hdayNum));
    if (ctx.monthKey === 'av' && ctx.hdayNum < 15) {
      body.setAttribute('data-day-of-month-lt', '15');
    } else {
      body.removeAttribute('data-day-of-month-lt');
    }
  }
}
