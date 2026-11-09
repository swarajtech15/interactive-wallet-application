// Small formatting helpers shared by every page.

const nf = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const money = (n) => nf.format(n);
export const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + nf.format(Math.abs(n));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function dayLabel(iso) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up? Wallet is judging';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
