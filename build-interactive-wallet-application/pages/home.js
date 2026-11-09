// HOME – a mischievous floating wallet with scroll-driven cards and a live demo dashboard.
import { $, $$, clamp, esc, greeting, money } from '../js/format.js';
import { icon } from '../js/icons.js';
import * as store from '../js/state.js';
import { balanceJoke, brokeMeter, pokeLine, randomFeed, randomMoth, roast, TICKER } from '../js/humor.js';
import { cardHTML, txRow } from '../js/components.js';
import { bars, donut } from '../js/charts.js';
import { countUp, rain, toast } from '../js/ui.js';

const ACTIONS = [
  ['send', 'Send', 'send'],
  ['request', 'Request', 'request'],
  ['pay', 'Pay', 'pay'],
  ['topup', 'Top-Up', 'plus'],
];

let chartTab = 'category';
let firstPaint = true;

const ease = (t) => t * t * (3 - 2 * t);

function miniCard(c) {
  return `<div class="mini theme-${c.theme}"><div class="mini-top"><span>${esc(c.name.split(' ')[0])}</span><b>${c.brand === 'VISA' ? 'VISA' : 'MC'}</b></div><span class="chip"></span><div class="mini-num">•••• ${c.last4}</div></div>`;
}

function stageHTML(s) {
  const [c1, c2, c3] = s.cards;
  const mini = (c, cls) => (c ? `<div class="w-cardwrap ${cls}">${miniCard(c)}</div>` : '');
  const eye = '<i class="eye"><b class="pupil"></b></i>';
  return `
  <section class="track" data-track aria-labelledby="hero-title">
    <div class="stage" data-stage>
      <div class="hero-copy">
        <p class="hero-kicker"><span></span> A little mischief. A lot of control.</p>
        <h1 id="hero-title">Your money.<br>A little more<br><em>wicked.</em></h1>
        <p class="hero-description">Meet the wallet with a wild side. Keep your cards close, your spending in check, and a little trouble in your pocket.</p>
        <div class="hero-actions">
          <button class="hero-primary" data-act="open-wallet">Open my wallet ${icon('arrow', 20)}</button>
          <a class="hero-secondary" href="#/cards">Explore cards ${icon('card', 18)}</a>
        </div>
        <div class="hero-trust" aria-label="About this wallet demo">
          <span>${icon('sparkle', 16)} Interactive demo</span>
          <span>${icon('check', 16)} Saved on this device</span>
        </div>
      </div>

      <div class="wallet-scene">
        <div class="scene-label"><span class="live-dot"></span> THE LITTLE SPENDER <span class="scene-edition">NO. 001</span></div>
        <div class="wallet-glow" aria-hidden="true"></div>
        <div class="wallet-orbit" aria-hidden="true"></div>
        <div class="air-shadow" aria-hidden="true"></div>

        <div class="float-shell">
          <div class="float-inner" data-floater>
            <div class="wallet" data-wallet role="button" tabindex="0" aria-label="Poke your floating devil wallet for a little mischief">
              <svg class="devil-tail" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M15 110c55 70 115 10 88-34-21-34-46 7-12 15 28 7 47-33 38-65" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="m111 32 16-29 21 29-19-5Z" fill="currentColor"/></svg>
              <div class="devil-horn horn-left" aria-hidden="true"></div>
              <div class="devil-horn horn-right" aria-hidden="true"></div>
              <div class="w-layer w-back"></div>
              <div class="w-tab"></div>
              <div class="w-layer w-lining"></div>

              <div class="w-flap">
                <div class="flap-face flap-front"><span class="clasp"></span></div>
                <div class="flap-face flap-back"><span class="flap-label">A LITTLE WICKED</span></div>
              </div>

              <div class="w-bill"><span>$</span><i></i></div>
              ${mini(c1, 'cw1')}${mini(c2, 'cw2')}${mini(c3, 'cw3')}
              <div class="w-coin k1">$</div><div class="w-coin k2">$</div><div class="w-coin k3">¢</div>

              <div class="w-layer w-front">
                <div class="face" aria-hidden="true">
                  <div class="eyes">${eye}${eye}</div>
                  <i class="devil-brow brow-left"></i><i class="devil-brow brow-right"></i>
                  <div class="mouth"><i class="fang fang-left"></i><i class="fang fang-right"></i></div>
                </div>
                <span class="wallet-stud stud-left" aria-hidden="true"></span><span class="wallet-stud stud-right" aria-hidden="true"></span>
                <span class="emboss">POCKETPAL</span>
              </div>
            </div>
          </div>
        </div>

        <div class="moths" aria-hidden="true">
          <span style="--dx:-120px;--dy:-130px;--t:0s">✦</span>
          <span style="--dx:130px;--dy:-170px;--t:.15s">✧</span>
          <span style="--dx:10px;--dy:-220px;--t:.3s">✦</span>
        </div>
        <div class="bubble" aria-live="polite"><span data-bubble>Small horns. Big wallet energy.</span></div>
        <div class="pops" role="group" aria-label="Quick actions" inert>
          ${ACTIONS.map(([a, label, ic], i) => `<button class="pop" style="--i:${i}" data-action="${a}"><span class="pop-ico">${icon(ic, 22)}</span><span class="pop-lbl">${label}</span></button>`).join('')}
        </div>
        <p class="scene-caption">FLOATS FREELY. SPENDS WISELY.<span>Scroll to reveal · Tap for mischief</span></p>
      </div>
      <div class="scroll-hint" aria-hidden="true"><span>SCROLL TO UNLEASH</span><i></i></div>
    </div>
  </section>`;
}

function dashHTML() {
  return `
  <section class="dash" id="overview" aria-label="Inside your wallet" tabindex="-1">
    <div class="dash-in">
      <header class="dash-head reveal">
        <p class="eyebrow light">YOUR DAILY OVERVIEW</p>
        <h2><span data-greet>${greeting()}</span>, ${store.USER.first}.</h2>
        <p class="dash-description">Your money, under control. Your personality, uncensored.</p>
        <p class="clock"><span class="live-dot"></span> Live · <time data-clock></time></p>
      </header>

      <div class="ticker reveal" aria-label="Wallet news ticker">
        <div class="ticker-track">${[...TICKER, ...TICKER].map((t) => `<span>${t}</span>`).join('')}</div>
      </div>

      <div data-r="security" class="security-region reveal"></div>
      <div data-r="balance" class="balance-region reveal"></div>

      <section class="panel actions-panel reveal" aria-labelledby="h-act">
        <h3 id="h-act">Quick actions</h3>
        <div class="act-grid">
          ${ACTIONS.map(([a, label, ic]) => `<button class="act" data-action="${a}"><span>${icon(ic, 24)}</span>${label}</button>`).join('')}
        </div>
      </section>

      <section class="panel cards-panel reveal" aria-labelledby="h-cards">
        <div class="panel-head"><h3 id="h-cards">Virtual cards</h3><a class="link" href="#/cards">Manage ${icon('arrow', 16)}</a></div>
        <div class="card-row" data-r="cards"></div>
      </section>

      <section class="panel expenses-panel reveal" aria-labelledby="h-chart">
        <div class="panel-head">
          <h3 id="h-chart">Expenses</h3>
          <div class="tabs" role="tablist" aria-label="Chart type">
            <button role="tab" data-tab="category">Category</button>
            <button role="tab" data-tab="week">7 days</button>
          </div>
        </div>
        <div data-r="chart"></div>
      </section>

      <section class="panel transactions-panel reveal" aria-labelledby="h-tx">
        <div class="panel-head"><h3 id="h-tx">Recent transactions</h3><a class="link" href="#/activity">See all ${icon('arrow', 16)}</a></div>
        <ul class="tx-list" data-r="txs"></ul>
      </section>

      <section class="panel lab lab-panel reveal" aria-labelledby="h-lab">
        <h3 id="h-lab">The mischief corner <small>A little fun, on the house.</small></h3>
        <div data-r="meter"></div>
        <div class="lab-grid">
          <button class="lab-btn" data-act="roast">🔥<span>Roast my spending</span></button>
          <button class="lab-btn" data-act="shake">🪙<span>Shake it!</span></button>
          <button class="lab-btn" data-act="feed">🧾<span>Feed the wallet</span></button>
          <button class="lab-btn" data-act="moth">🦋<span>Moths evacuated: <b data-r="moths">0</b></span></button>
        </div>
      </section>

      <p class="foot-note">A little wicked. Entirely yours. · Demo wallet — no real money moves.</p>
    </div>
  </section>`;
}

export default {
  title: 'Home',
  render() {
    return `<div class="home">${stageHTML(store.get())}${dashHTML()}</div>`;
  },

  mount(root) {
    const stage = $('[data-stage]', root);
    const track = $('[data-track]', root);
    const wallet = $('[data-wallet]', root);
    const bubble = $('[data-bubble]', root);
    const clock = $('[data-clock]', root);
    const pops = $('.pops', root);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionQuery.matches;
    let target = 0;
    let cur = 0;
    let mx = 0;
    let my = 0;
    let sx = 0;
    let sy = 0;
    let raf = 0;
    let msg = '';
    let wasOpen = false;
    const set = (k, v) => stage.style.setProperty(k, v);

    /* ---------- scroll-driven wallet ---------- */
    const measure = () => {
      const total = track.offsetHeight - window.innerHeight;
      target = reduceMotion ? 1 : clamp(-track.getBoundingClientRect().top / Math.max(1, total));
    };

    const message = (p) => {
      if (p < 0.12) return 'Small horns. Big wallet energy.';
      if (p < 0.4) return 'Go on. Unleash the good stuff.';
      if (p < 0.7) return 'A few cards up my sleeve.';
      if (p < 0.92) return 'Your money. Your rules.';
      return `Balance ${store.get().hide ? '•••••' : money(store.get().balance)} — ${balanceJoke(store.get().balance)}`;
    };

    const apply = (p) => {
      const awake = 1;
      const open = ease(clamp(0.18 + p / 0.58));
      const rise = 0.16 + 0.84 * ease(clamp((p - 0.12) / 0.5));
      const pop = clamp((p - 0.6) / 0.3);
      set('--awake', awake.toFixed(3));
      set('--open', open.toFixed(3));
      set('--rise', rise.toFixed(3));
      set('--pop', pop.toFixed(3));
      set('--yawn', (Math.sin(open * Math.PI) * 0.9 + rise * 0.25).toFixed(3));
      set('--zoom', (1 + 0.1 * ease(clamp(p / 0.7))).toFixed(3));
      const isOpen = open > 0.5;
      stage.classList.toggle('is-open', isOpen);
      stage.classList.toggle('is-popped', pop > 0.45);
      pops.inert = pop <= 0.45;
      if (isOpen && !wasOpen) {
        stage.classList.add('moths-go');
        if (!reduceMotion) navigator.vibrate?.(20);
      }
      if (!isOpen && wasOpen) stage.classList.remove('moths-go');
      wasOpen = isOpen;
      const m = message(p);
      if (m !== msg) {
        msg = m;
        bubble.textContent = m;
        bubble.parentElement.classList.remove('bump');
        void bubble.offsetWidth;
        if (!reduceMotion) bubble.parentElement.classList.add('bump');
      }
    };

    const loop = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      sx += (mx - sx) * 0.08;
      sy += (my - sy) * 0.08;
      set('--px', sx.toFixed(3));
      set('--py', sy.toFixed(3));
      set('--tilt', (sx * 2.2).toFixed(2));
      apply(cur);
      raf = requestAnimationFrame(loop);
    };

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches;
      cancelAnimationFrame(raf);
      measure();
      if (reduceMotion) {
        set('--px', '0');
        set('--py', '0');
        set('--tilt', '0');
        apply(1);
      } else {
        cur = target;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e) => {
      if (reduceMotion) return;
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pointermove', onMove, { passive: true });
    measure();
    cur = target;
    if (reduceMotion) apply(1);
    else raf = requestAnimationFrame(loop);
    motionQuery.addEventListener('change', onMotionChange);

    /* ---------- live clock ---------- */
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    };
    tick();
    const clockId = setInterval(tick, 1000);

    /* ---------- dynamic regions ---------- */
    const region = (n) => $(`[data-r="${n}"]`, root);

    function paint() {
      const s = store.get();
      const t = store.totals(30);
      const sc = (on, label, ic) => `<li class="sec-chip ${on ? 'on' : 'off'}">${icon(ic, 18)}<span>${label}</span><b>${on ? '✓ ON' : '✕ OFF'}</b></li>`;
      region('security').innerHTML = `<ul class="secure-strip" aria-label="Demo settings status">
        ${sc(true, 'Local demo', 'sparkle')}${sc(s.settings.biometric, 'Biometric demo', 'finger')}${sc(s.settings.twofa, '2-step demo', 'shield')}</ul>`;

      region('balance').innerHTML = `<section class="panel balance-panel" aria-label="Account balance">
        <div class="bal-top"><span class="label">Total balance</span>
          <button class="icon-btn" data-act="hide" aria-pressed="${s.hide}" aria-label="${s.hide ? 'Show balance' : 'Hide balance'}">${icon(s.hide ? 'eyeOff' : 'eye', 20)}</button></div>
        <div class="amount" data-amount>${s.hide ? '$ •••••' : money(s.balance)}</div>
        <p class="joke">${s.hide ? 'Balance hidden. Nosy neighbours defeated 🕶️' : balanceJoke(s.balance)}</p>
        <div class="bal-stats">
          <div><small>In · 30 days</small><b class="pos">+${money(t.inn)}</b></div>
          <div><small>Out · 30 days</small><b class="neg">−${money(t.out)}</b></div>
        </div>
      </section>`;
      if (firstPaint && !s.hide && !reduceMotion) countUp($('[data-amount]', root), s.balance);

      region('cards').innerHTML = s.cards
        .map((c) => `<a href="#/cards" aria-label="${esc(c.name)} card ending ${c.last4}">${cardHTML(c, { isDefault: c.id === s.activeCardId })}</a>`)
        .join('');

      region('chart').innerHTML = chartTab === 'category' ? donut(store.byCategory(30)) : `<p class="muted small-print">Daily spending, last 7 days</p>${bars(store.weekly())}`;
      $$('[data-tab]', root).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === chartTab)));

      const recent = s.txs.slice(0, 5);
      region('txs').innerHTML = recent.map(txRow).join('');

      const m = brokeMeter(s.balance);
      region('meter').innerHTML = `<div class="meter" role="img" aria-label="Broke-o-meter: ${m.label}">
        <div class="meter-top"><span>Broke-o-meter</span><b>${m.label}</b></div>
        <div class="meter-bar"><i style="width:${m.pct}%"></i><span class="meter-pin" style="left:${m.pct}%">🪙</span></div></div>`;
      region('moths').textContent = s.stats.moths;
      if (reduceMotion) apply(1);
      firstPaint = false;
    }
    paint();
    const unsub = store.subscribe(paint);

    /* ---------- interactions ---------- */
    const poke = () => {
      stage.classList.remove('shake');
      void stage.offsetWidth;
      if (!reduceMotion) stage.classList.add('shake');
      const n = store.bump('pokes');
      toast(pokeLine(n));
      if (!reduceMotion) rain(['🪙'], n % 5 === 0 ? 22 : 6);
    };
    wallet.addEventListener('click', poke);
    wallet.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        poke();
      }
    });

    const onClick = (e) => {
      const tab = e.target.closest('[data-tab]');
      if (tab) {
        chartTab = tab.dataset.tab;
        return paint();
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      const act = a.dataset.act;
      if (act === 'open-wallet') {
        const overview = $('#overview', root);
        overview.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
        overview.focus({ preventScroll: true });
      }
      if (act === 'hide') store.toggleHide();
      if (act === 'roast') {
        store.bump('roasts');
        toast(roast());
      }
      if (act === 'shake') {
        if (!reduceMotion) rain(['🪙', '💸', '🤑'], 30);
        toast('Shake shake! Only lint and hope fell out 🧶');
      }
      if (act === 'feed') {
        toast(randomFeed());
        if (!reduceMotion) rain(['🧾'], 10);
      }
      if (act === 'moth') {
        store.bump('moths');
        toast(randomMoth());
      }
    };
    root.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(clockId);
      unsub();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onMove);
      motionQuery.removeEventListener('change', onMotionChange);
      root.removeEventListener('click', onClick);
    };
  },
};
