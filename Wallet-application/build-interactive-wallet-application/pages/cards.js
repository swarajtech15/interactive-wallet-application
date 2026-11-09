// CARDS – manage virtual cards: flip, reveal, copy, freeze, set default, add new.
import { $, esc, money } from '../js/format.js';
import { icon } from '../js/icons.js';
import * as store from '../js/state.js';
import { cardHTML, pageHead, securePill, switchBtn } from '../js/components.js';
import { confetti, toast } from '../js/ui.js';

let sel = null;
let flipped = false;
let reveal = false;

export default {
  title: 'Cards',
  render() {
    return `<div class="page page-cards">
      ${pageHead('Your cards', 'Virtual cards you can freeze in one tap.', securePill())}
      <div class="hero-card" data-r="hero"></div>
      <div class="card-actions" data-r="actions"></div>
      <div class="thumbs" role="group" aria-label="Choose a card" data-r="thumbs"></div>
      <section class="panel" data-r="details" aria-live="polite"></section>
      <button class="btn btn-dark btn-block" data-act="add">${icon('plus', 20)} Add virtual card</button>
      <p class="muted center small-print">Virtual cards are free, instant and judgement-free.</p>
    </div>`;
  },

  mount(root) {
    const region = (n) => $(`[data-r="${n}"]`, root);
    const current = () => {
      const s = store.get();
      return s.cards.find((c) => c.id === sel) || s.cards[0];
    };

    function paint() {
      const s = store.get();
      const c = current();
      if (!c) {
        region('hero').innerHTML = '<p class="muted center">No cards yet.</p>';
        return;
      }
      sel = c.id;
      region('hero').innerHTML = cardHTML(c, { flipped, reveal, isDefault: c.id === s.activeCardId });

      region('actions').innerHTML = `
        <button class="chip-btn" data-act="flip">${icon('flip', 18)} Flip</button>
        <button class="chip-btn" data-act="reveal" aria-pressed="${reveal}">${icon(reveal ? 'eyeOff' : 'eye', 18)} ${reveal ? 'Hide' : 'Show'} details</button>
        <button class="chip-btn" data-act="copy">${icon('copy', 18)} Copy number</button>`;

      region('thumbs').innerHTML = s.cards
        .map(
          (x) => `<button class="thumb theme-${x.theme} ${x.frozen ? 'is-frozen' : ''}" data-pick="${x.id}" aria-pressed="${x.id === c.id}" aria-label="${esc(x.name)} ending ${x.last4}${x.frozen ? ', frozen' : ''}">
            <span class="thumb-chip"></span><b>•• ${x.last4}</b>${x.frozen ? '<i>❄</i>' : ''}</button>`
        )
        .join('');

      const spent = store.cardSpent(c.id);
      const pct = Math.min(100, (spent / c.limit) * 100);
      const isDefault = c.id === s.activeCardId;
      region('details').innerHTML = `
        <h2 class="card-title">${esc(c.name)}</h2>
        <p class="muted">${c.brand} · ending ${c.last4} · expires ${c.expiry}</p>
        <div class="row">
          <div><strong>Freeze card</strong><p class="muted small-print">${c.frozen ? 'Frozen ❄️ – all payments blocked' : 'Active – payments allowed'}</p></div>
          ${switchBtn('freeze', c.frozen, 'Freeze card')}
        </div>
        <div class="row">
          <div><strong>Default for payments</strong><p class="muted small-print">${isDefault ? 'Used for Send, Pay & Request' : 'Not the default card'}</p></div>
          <button class="chip-btn" data-act="default" ${isDefault ? 'disabled' : ''}>${isDefault ? `${icon('check', 16)} Default` : 'Make default'}</button>
        </div>
        <div class="limit">
          <div class="limit-top"><strong>Monthly limit</strong><span>${money(spent)} <span class="muted">of ${money(c.limit)}</span></span></div>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="Limit used"><i class="${pct > 85 ? 'warn' : ''}" style="width:${pct}%"></i></div>
          <p class="muted small-print">${pct > 85 ? 'Careful! Your card is sweating 😰' : pct < 10 ? 'Barely touched. Treat yourself? 🍦' : 'Healthy spending vibes ✨'}</p>
        </div>`;
    }
    paint();
    const unsub = store.subscribe(paint);

    const onClick = (e) => {
      const pick = e.target.closest('[data-pick]');
      if (pick) {
        sel = pick.dataset.pick;
        flipped = false;
        reveal = false;
        return paint();
      }
      const sw = e.target.closest('[data-switch="freeze"]');
      if (sw) {
        const msg = store.toggleFreeze(current().id);
        return toast(msg);
      }
      if (e.target.closest('[data-card]')) {
        flipped = !flipped;
        return $('.vcard', root)?.classList.toggle('flipped', flipped);
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      const act = a.dataset.act;
      if (act === 'flip') {
        flipped = !flipped;
        $('.vcard', root)?.classList.toggle('flipped', flipped);
      }
      if (act === 'reveal') {
        reveal = !reveal;
        paint();
        if (reveal) toast('Details visible. Hide them before anyone peeks 👀');
      }
      if (act === 'copy') {
        const n = current().number.replace(/\s/g, '');
        navigator.clipboard?.writeText(n).then(
          () => toast('Card number copied. Paste responsibly 📋', 'success'),
          () => toast('Copy blocked by your browser. Security wins 🛡️')
        );
        if (!navigator.clipboard) toast('Copy not supported here. Security wins 🛡️');
      }
      if (act === 'default') {
        store.setActive(current().id);
        toast('Default card updated 💳', 'success');
      }
      if (act === 'add') {
        const res = store.addCard();
        if (res.ok) {
          sel = res.id;
          flipped = false;
          reveal = false;
          paint();
          confetti(30);
          toast(res.msg, 'success');
        } else toast(res.msg, 'error');
      }
    };
    root.addEventListener('click', onClick);

    // 3D tilt on the hero card
    const hero = region('hero');
    const onMove = (e) => {
      const c = $('.vcard', hero);
      if (!c) return;
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--rx', (-y * 10).toFixed(1) + 'deg');
      hero.style.setProperty('--ry', (x * 12).toFixed(1) + 'deg');
    };
    const onLeave = () => {
      hero.style.setProperty('--rx', '0deg');
      hero.style.setProperty('--ry', '0deg');
    };
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    return () => {
      unsub();
      root.removeEventListener('click', onClick);
    };
  },
};
