// Shared UI: toasts, confetti / coin rain, and the Send / Request / Pay / Top-Up bottom sheet.
import { $, esc, money, pick } from './format.js';
import { icon } from './icons.js';
import * as store from './state.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toasts ---------- */
export function toast(msg, kind = 'info') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  const ico = kind === 'success' ? 'check' : kind === 'error' ? 'alert' : 'sparkle';
  el.innerHTML = `<span class="toast-ico">${icon(ico, 18)}</span><span>${esc(msg)}</span>`;
  root.appendChild(el);
  while (root.children.length > 3) root.firstChild.remove();
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 3600);
}

/* ---------- Effects ---------- */
function spawn(html, cls, vars, ms) {
  const el = document.createElement('span');
  el.className = cls;
  el.innerHTML = html;
  Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
  $('#fx-root').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

export function confetti(n = 48) {
  if (reduceMotion()) return;
  const colors = ['#ff4b55', '#e7c6ad', '#89bfa2', '#b62c3d', '#f1e7db', '#8e5266'];
  for (let i = 0; i < n; i++) {
    const d = 1.8 + Math.random() * 1.6;
    spawn('', 'fx-confetti', { '--x': Math.random() * 100 + 'vw', '--dx': (Math.random() - 0.5) * 160 + 'px', '--c': pick(colors), '--d': d + 's', '--r': Math.random() * 720 + 'deg' }, d * 1000 + 100);
  }
}

export function rain(emojis = ['🪙', '💸', '🤑'], n = 18) {
  if (reduceMotion()) return;
  for (let i = 0; i < n; i++) {
    const d = 1.6 + Math.random() * 1.4;
    spawn(pick(emojis), 'fx-emoji', { '--x': Math.random() * 100 + 'vw', '--dx': (Math.random() - 0.5) * 120 + 'px', '--d': d + 's', '--s': 18 + Math.random() * 18 + 'px', '--delay': Math.random() * 0.5 + 's' }, (d + 0.6) * 1000);
  }
}

export function runFx(fx) {
  if (fx === 'confetti') confetti();
  if (fx === 'rain') rain(['💸', '🪙'], 14);
}

export function countUp(el, to, ms = 900) {
  if (reduceMotion()) {
    el.textContent = money(to);
    return;
  }
  const from = 0;
  const t0 = performance.now();
  const step = (t) => {
    if (!el.isConnected) return;
    const k = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = money(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Bottom sheet ---------- */
const CFG = {
  send: { title: 'Send money', cta: 'Send', ico: 'send', who: 'Send to', list: () => store.CONTACTS, hint: 'Money flies out. Wallet waves goodbye 👋' },
  request: { title: 'Request money', cta: 'Request', ico: 'request', who: 'Request from', list: () => store.CONTACTS, hint: 'Politely asking for what you are owed 🙏' },
  pay: { title: 'Pay a merchant', cta: 'Pay now', ico: 'pay', who: 'Pay', list: () => store.MERCHANTS, hint: 'Tap, pay, regret later 💳' },
  topup: { title: 'Top up wallet', cta: 'Add money', ico: 'plus', who: 'Top up from', list: () => store.SOURCES, hint: 'Feed the wallet. It gets hangry 🍽️' },
};

let activeSheet = null;

function disposeSheet(session, restoreFocus = true) {
  clearTimeout(session.focusTimer);
  clearTimeout(session.verifyTimer);
  clearTimeout(session.closeTimer);
  session.cancelled = true;
  if (activeSheet !== session) return;
  session.root.innerHTML = '';
  session.root.onclick = null;
  document.body.style.overflow = session.overflow;
  session.background.forEach(([el, wasInert]) => { el.inert = wasInert; });
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('focusin', containFocus);
  activeSheet = null;
  if (restoreFocus && session.lastFocus?.isConnected) session.lastFocus.focus({ preventScroll: true });
}

export function closeSheet() {
  const session = activeSheet;
  if (!session || session.cancelled) return;
  session.cancelled = true;
  clearTimeout(session.verifyTimer);
  clearTimeout(session.focusTimer);
  session.sheet.classList.add('closing');
  $('.sheet-backdrop', session.root)?.classList.add('closing');
  session.closeTimer = setTimeout(() => disposeSheet(session), reduceMotion() ? 0 : 260);
}

function focusableElements() {
  return [...activeSheet.sheet.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
    .filter((el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
}

function containFocus(e) {
  if (activeSheet && !activeSheet.sheet.contains(e.target)) {
    (focusableElements()[0] || activeSheet.sheet).focus({ preventScroll: true });
  }
}

function onKey(e) {
  if (!activeSheet) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeSheet();
  }
  if (e.key !== 'Tab') return;
  const items = focusableElements();
  const first = items[0] || activeSheet.sheet;
  const last = items.at(-1) || activeSheet.sheet;
  if (!items.length || !items.includes(document.activeElement) || (e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}

window.addEventListener('hashchange', closeSheet);

export function openSheet(type) {
  const cfg = CFG[type];
  if (!cfg) return;
  const root = $('#sheet-root');
  const lastFocus = activeSheet?.lastFocus || document.activeElement;
  if (activeSheet) disposeSheet(activeSheet, false);
  const session = {
    root,
    lastFocus,
    overflow: document.body.style.overflow,
    background: [...document.querySelectorAll('#app, .site-header, .tabbar')].map((el) => [el, el.inert]),
    cancelled: false,
    processing: false,
  };
  activeSheet = session;
  document.body.style.overflow = 'hidden';
  session.background.forEach(([el]) => { el.inert = true; });
  const list = cfg.list();
  const s = store.get();
  let selected = list[0].id;
  let prefilled = false;

  root.innerHTML = `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-describedby="sheet-demo" tabindex="-1">
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        <span class="sheet-ico">${icon(cfg.ico, 22)}</span>
        <div><h2 id="sheet-title">${cfg.title}</h2><p class="muted">Available: <strong>${money(s.balance)}</strong></p></div>
        <button class="icon-btn" data-close aria-label="Close">${icon('x', 20)}</button>
      </div>
      <div data-body>
        <fieldset class="field">
          <legend>${cfg.who}</legend>
          <div class="chips">
            ${list.map((it, i) => `<button type="button" class="chip-btn" data-pick="${it.id}" aria-pressed="${i === 0}"><span>${it.emoji}</span>${esc(it.name)}</button>`).join('')}
          </div>
        </fieldset>
        <label class="field amount-field">
          <span class="legend">Amount</span>
          <span class="amount-box"><b>$</b><input data-amount type="number" inputmode="decimal" step="0.01" min="0.01" max="100000" placeholder="0.00" autocomplete="off" aria-describedby="sheet-error" /></span>
        </label>
        <div class="quick-amts" aria-label="Quick amounts">
          ${[10, 25, 50, 100].map((v) => `<button type="button" class="chip-btn small" data-amt="${v}">$${v}</button>`).join('')}
        </div>
        <label class="field">
          <span class="legend">Note (optional)</span>
          <input class="text-input" data-note type="text" maxlength="40" placeholder="e.g. for the tacos 🌮" autocomplete="off" />
        </label>
        <p class="sheet-secure" id="sheet-demo">${icon('shield', 18)} <span>Demo only · ${s.settings.biometric ? 'simulated biometric check' : 'no biometric simulation'}. No real money moves.</span></p>
        <p class="sheet-error" id="sheet-error" data-error role="alert"></p>
        <button class="btn btn-primary btn-block" data-confirm>${icon(cfg.ico, 20)} ${cfg.cta}</button>
        <p class="muted center small-print">${cfg.hint}</p>
      </div>
    </div>`;

  session.sheet = $('.sheet', root);
  const amount = $('[data-amount]', root);
  const err = $('[data-error]', root);
  const setPrefill = () => {
    if (type !== 'pay') return;
    const m = store.MERCHANTS.find((x) => x.id === selected);
    if (m && (!amount.value || prefilled)) {
      amount.value = m.hint;
      prefilled = true;
    }
  };
  setPrefill();
  session.sheet.focus({ preventScroll: true });
  session.focusTimer = setTimeout(() => {
    if (activeSheet === session && !session.cancelled) amount.focus({ preventScroll: true });
  }, reduceMotion() ? 0 : 350);
  document.addEventListener('keydown', onKey);
  document.addEventListener('focusin', containFocus);

  root.onclick = (e) => {
    const t = e.target.closest('button');
    if (e.target.matches('.sheet-backdrop') || e.target.closest('[data-close]')) return closeSheet();
    if (!t || session.processing || session.cancelled) return;
    if (t.dataset.pick) {
      selected = t.dataset.pick;
      root.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
      setPrefill();
    }
    if (t.dataset.amt) {
      amount.value = t.dataset.amt;
      prefilled = false;
    }
    if (t.matches('[data-confirm]')) confirm();
  };
  amount.addEventListener('input', () => {
    prefilled = false;
    err.textContent = '';
    amount.removeAttribute('aria-invalid');
  });

  function run(val, note) {
    const res =
      type === 'send' ? store.sendMoney(selected, val, note)
      : type === 'request' ? store.requestMoney(selected, val, note)
      : type === 'pay' ? store.payMerchant(selected, val)
      : store.topUp(selected, val);
    return res;
  }

  function confirm() {
    if (session.processing || session.cancelled) return;
    const val = parseFloat(amount.value);
    if (!Number.isFinite(val) || val <= 0 || val > 100000 || amount.validity.stepMismatch) {
      err.textContent = 'Enter $0.01 to $100,000, with no more than two decimal places.';
      amount.setAttribute('aria-invalid', 'true');
      amount.focus();
      return;
    }
    const note = $('[data-note]', root).value.trim();
    const body = $('[data-body]', root);
    const controls = [...body.querySelectorAll('button, input')];
    session.processing = true;
    session.sheet.setAttribute('aria-busy', 'true');
    controls.forEach((el) => { el.disabled = true; });
    const finish = () => {
      if (activeSheet !== session || session.cancelled) return;
      const res = run(val, note);
      if (!res.ok) {
        // restore form on failure
        body.classList.remove('scanning');
        $('.scan', root)?.remove();
        session.processing = false;
        session.sheet.removeAttribute('aria-busy');
        controls.forEach((el) => { el.disabled = false; });
        err.textContent = res.msg;
        amount.focus({ preventScroll: true });
        if (!reduceMotion()) navigator.vibrate?.(80);
        return;
      }
      closeSheet();
      toast(res.msg, 'success');
      runFx(res.fx);
    };
    if (!store.get().settings.biometric) return finish();

    // Simulated biometric verification
    body.classList.add('scanning');
    $('[data-close]', session.sheet).focus({ preventScroll: true });
    const scan = document.createElement('div');
    scan.className = 'scan';
    scan.setAttribute('role', 'status');
    scan.innerHTML = `<div class="scan-ring">${icon('finger', 44)}</div><strong>Simulating a biometric check…</strong><span class="muted">This demo does not collect fingerprints.</span>`;
    $('.sheet', root).appendChild(scan);
    session.verifyTimer = setTimeout(finish, 1300);
  }
}
