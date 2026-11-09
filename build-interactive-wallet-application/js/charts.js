// Lightweight SVG / CSS charts (no dependencies).
import { money, esc } from './format.js';

export function donut(data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return '<p class="muted center">No spending yet. Suspiciously frugal 🧐</p>';
  const R = 40;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = data
    .map((d) => {
      const len = (d.value / total) * C;
      const seg = `<circle class="seg" cx="50" cy="50" r="${R}" fill="none" stroke="${d.color}" stroke-width="16" stroke-dasharray="${Math.max(0, len - 1.5)} ${C - Math.max(0, len - 1.5)}" stroke-dashoffset="${-offset}" />`;
      offset += len;
      return seg;
    })
    .join('');
  return `<div class="donut-wrap">
    <div class="donut">
      <svg viewBox="0 0 100 100" role="img" aria-label="Spending by category, total ${money(total)}">
        <circle cx="50" cy="50" r="${R}" fill="none" stroke="#eadfca" stroke-width="16" />
        <g transform="rotate(-90 50 50)">${segs}</g>
      </svg>
      <div class="donut-center"><small>Spent (30d)</small><b>${money(total)}</b></div>
    </div>
    <ul class="legend">
      ${data
        .map((d) => `<li><i style="background:${d.color}"></i><span>${esc(d.label)}</span><b>${Math.round((d.value / total) * 100)}%</b><em>${money(d.value)}</em></li>`)
        .join('')}
    </ul>
  </div>`;
}

export function bars(data) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  return `<div class="bars" role="img" aria-label="Spending over the last 7 days. Highest: ${top.label}, ${money(top.value)}">
    ${data
      .map(
        (d, i) => `<div class="bar ${d === top && d.value > 0 ? 'top' : ''}" style="--h:${Math.max(4, (d.value / max) * 100)}%; --i:${i}">
        <span class="bar-val">${d.value ? '$' + Math.round(d.value) : '–'}</span>
        <span class="bar-fill"></span>
        <span class="bar-lbl">${d.label}</span>
      </div>`
      )
      .join('')}
  </div>`;
}
