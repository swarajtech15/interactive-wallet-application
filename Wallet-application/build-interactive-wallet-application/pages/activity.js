// ACTIVITY – summary, 7-day chart, filters, search and a grouped transaction history.
import { $, dayLabel, money } from '../js/format.js';
import { icon } from '../js/icons.js';
import * as store from '../js/state.js';
import { pageHead, securePill, txRow } from '../js/components.js';
import { bars } from '../js/charts.js';
import { roast } from '../js/humor.js';
import { toast } from '../js/ui.js';

let filter = 'all';
let query = '';

const FILTERS = [
  ['all', 'All'],
  ['in', 'Money in'],
  ['out', 'Spending'],
  ['pending', 'Pending'],
];

export default {
  title: 'Activity',
  render() {
    return `<div class="page page-activity">
      ${pageHead('Activity', 'Every coin, tracked and judged.', securePill())}
      <div class="summary" data-r="summary"></div>
      <section class="panel" aria-labelledby="h-week">
        <div class="panel-head"><h2 id="h-week" class="h3">This week</h2>
          <button class="chip-btn small" data-act="roast">🔥 Roast me</button></div>
        <div data-r="week"></div>
      </section>
      <div class="toolbar">
        <label class="search">${icon('search', 18)}<span class="sr-only">Search transactions</span>
          <input type="search" data-search placeholder="Search coffee, pizza, regrets…" value="${query}" autocomplete="off" /></label>
        <div class="chips scroll-x" role="group" aria-label="Filter transactions">
          ${FILTERS.map(([k, l]) => `<button class="chip-btn" data-filter="${k}" aria-pressed="${k === filter}">${l}</button>`).join('')}
        </div>
      </div>
      <div data-r="list"></div>
    </div>`;
  },

  mount(root) {
    const region = (n) => $(`[data-r="${n}"]`, root);

    function paintStatic() {
      const t = store.totals(30);
      region('summary').innerHTML = `
        <div class="sum in"><small>Money in</small><b>+${money(t.inn)}</b><span>30 days</span></div>
        <div class="sum out"><small>Spent</small><b>−${money(t.out)}</b><span>30 days</span></div>
        <div class="sum net"><small>Net</small><b>${t.net >= 0 ? '+' : '−'}${money(Math.abs(t.net))}</b><span>${t.net >= 0 ? 'Saving 🐷' : 'Overspending 😬'}</span></div>`;
      region('week').innerHTML = bars(store.weekly());
    }

    function paintList() {
      const q = query.trim().toLowerCase();
      const items = store.get().txs.filter((t) => {
        if (filter === 'in' && !(t.amount > 0 && t.status === 'done')) return false;
        if (filter === 'out' && !(t.amount < 0)) return false;
        if (filter === 'pending' && t.status !== 'pending') return false;
        if (q && !`${t.title} ${t.note} ${t.cat}`.toLowerCase().includes(q)) return false;
        return true;
      });
      if (!items.length) {
        region('list').innerHTML = `<div class="empty"><span>🦗</span><strong>Nothing here</strong><p class="muted">Crickets. Try another filter or spend something.</p></div>`;
        return;
      }
      const groups = [];
      items.forEach((t) => {
        const label = dayLabel(t.date);
        const g = groups.find((x) => x.label === label);
        g ? g.items.push(t) : groups.push({ label, items: [t] });
      });
      region('list').innerHTML = groups
        .map((g) => {
          const day = g.items.filter((t) => t.status === 'done').reduce((s, t) => s + t.amount, 0);
          return `<section class="day"><h3 class="day-head"><span>${g.label}</span><em>${day >= 0 ? '+' : '−'}${money(Math.abs(day))}</em></h3>
            <ul class="tx-list panel">${g.items.map(txRow).join('')}</ul></section>`;
        })
        .join('');
    }

    const paintFilters = () =>
      root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));

    paintStatic();
    paintList();
    const unsub = store.subscribe(() => {
      paintStatic();
      paintList();
    });

    const onClick = (e) => {
      const f = e.target.closest('[data-filter]');
      if (f) {
        filter = f.dataset.filter;
        paintFilters();
        return paintList();
      }
      if (e.target.closest('[data-act="roast"]')) {
        store.bump('roasts');
        toast(roast());
      }
    };
    const onInput = (e) => {
      if (e.target.matches('[data-search]')) {
        query = e.target.value;
        paintList();
      }
    };
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    return () => {
      unsub();
      root.removeEventListener('click', onClick);
      root.removeEventListener('input', onInput);
    };
  },
};
