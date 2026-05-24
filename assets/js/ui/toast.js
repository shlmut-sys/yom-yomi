/* יומיומי · ui/toast.js — bottom toast notification */

export function showToast(msg, durationMs = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), durationMs);
}
