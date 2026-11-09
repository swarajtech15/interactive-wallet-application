// Reusable HTML-string components used by several pages.
import { esc, signed, timeLabel } from './format.js';
import { icon } from './icons.js';
import { CATS } from './state.js';

export function pageHead(title, sub, extra = '') {
  return `<header class="page-head">
    <div><p class="eyebrow">PocketPal</p><h1>${title}</h1><p class="muted">${sub}</p></div>
    ${extra}
  </header>`;
}

export function securePill() {
  return `<span class="secure-pill">${icon('lock', 16)} Secure</span>`;
}

export function cardHTML(card, { flipped = false, reveal = false, isDefault = false } = {}) {
  const num = reveal ? card.number : `•••• •••• •••• ${card.last4}`;
  return `<article class="vcard theme-${card.theme} ${card.frozen ? 'is-frozen' : ''} ${flipped ? 'flipped' : ''}" data-card="${card.id}">
    <div class="vcard-inner">
      <div class="vcard-face vcard-front">
        <div class="vcard-top">
          <span class="vcard-name">${esc(card.name)}</span>
          <span class="vcard-brand">${card.brand}</span>
        </div>
        <div class="vcard-mid"><span class="chip"></span><span class="nfc">))))</span></div>
        <div class="vcard-num">${num}</div>
        <div class="vcard-bot">
          <div><small>Card holder</small><b>ALEX MORGAN</b></div>
          <div><small>Expires</small><b>${card.expiry}</b></div>
          ${isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        ${card.frozen ? `<div class="frost"><span>${icon('snow', 18)} FROZEN</span></div>` : ''}
      </div>
      <div class="vcard-face vcard-back">
        <div class="stripe"></div>
        <div class="cvv-row"><span>Security code</span><b class="cvv">${reveal ? card.cvv : '•••'}</b></div>
        <p class="back-note">If found, please return to a very nervous owner. 🥺</p>
        <span class="vcard-brand">${card.brand}</span>
      </div>
    </div>
  </article>`;
}

export function txRow(t) {
  const c = CATS[t.cat] || CATS.transfer;
  const pos = t.amount > 0;
  return `<li class="tx">
    <span class="tx-ico" style="--c:${c.color}" aria-hidden="true">${t.emoji || c.emoji}</span>
    <div class="tx-main">
      <strong>${esc(t.title)}</strong>
      <small>${c.label} · ${timeLabel(t.date)}${t.note ? ` · “${esc(t.note)}”` : ''}</small>
    </div>
    <div class="tx-amt ${pos ? 'pos' : 'neg'}">
      <span>${signed(t.amount)}</span>
      ${t.status === 'pending' ? '<em class="badge">Pending</em>' : ''}
    </div>
  </li>`;
}

export function switchBtn(key, on, label) {
  return `<button class="switch" role="switch" aria-checked="${on}" aria-label="${label}" data-switch="${key}">
    <span class="switch-knob"></span><span class="switch-txt">${on ? 'ON' : 'OFF'}</span>
  </button>`;
}
