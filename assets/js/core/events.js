/* יומיומי · core/events.js — simple pub/sub bus */

const bus = new EventTarget();

export function on(name, fn) {
  const wrapped = (ev) => fn(ev.detail);
  bus.addEventListener(name, wrapped);
  return () => bus.removeEventListener(name, wrapped);
}

export function emit(name, detail = null) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

/* Standard event names — single source of truth */
export const EV = {
  LOCATION_READY: 'location:ready',
  LANG_CHANGE: 'lang:change',
  DATE_CHANGE: 'date:change',     // Hebrew-date rollover (midnight)
  WEATHER_UPDATE: 'weather:update',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  TOAST: 'toast:show'
};
