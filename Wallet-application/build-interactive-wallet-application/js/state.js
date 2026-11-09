// Wallet data store: cards, balance, transactions, settings. Persists to localStorage.
import { money, pick } from './format.js';

const KEY = 'pocketpal.v2';
const HOUR = 3600000;
const DAY = 24 * HOUR;
const iso = (h) => new Date(Date.now() - h * HOUR).toISOString();

export const USER = { name: 'Alex Morgan', first: 'Alex', handle: '@alex.pockets' };

export const CONTACTS = [
  { id: 'maya', name: 'Maya', emoji: '🧑‍🎤' },
  { id: 'dev', name: 'Dev', emoji: '🧑‍💻' },
  { id: 'gran', name: 'Grandma', emoji: '👵' },
  { id: 'land', name: 'Landlord (scary)', emoji: '🧌' },
  { id: 'sam', name: 'Sam the Dog', emoji: '🐶' },
];

export const MERCHANTS = [
  { id: 'cafe', name: 'Corner Café', cat: 'food', emoji: '☕', hint: 4.5 },
  { id: 'pizza', name: 'Pizza Planet', cat: 'food', emoji: '🍕', hint: 18 },
  { id: 'metro', name: 'Metro Pass', cat: 'transport', emoji: '🚇', hint: 30 },
  { id: 'stream', name: 'Streamify', cat: 'fun', emoji: '🎬', hint: 12.99 },
  { id: 'gadget', name: 'Gadget Hub', cat: 'shopping', emoji: '🎧', hint: 59 },
  { id: 'power', name: 'Power & Light', cat: 'bills', emoji: '💡', hint: 64 },
];

export const SOURCES = [
  { id: 'bank', name: 'Bank •• 4421', emoji: '🏦' },
  { id: 'debit', name: 'Debit card', emoji: '💳' },
  { id: 'piggy', name: 'Emergency piggy bank', emoji: '🐷' },
  { id: 'couch', name: 'Couch cushions', emoji: '🛋️' },
];

export const CATS = {
  food: { label: 'Food', color: '#c4572f', emoji: '🍔' },
  shopping: { label: 'Shopping', color: '#7a4fa3', emoji: '🛍️' },
  transport: { label: 'Transport', color: '#2b78a1', emoji: '🚇' },
  fun: { label: 'Fun', color: '#c98f12', emoji: '🎬' },
  bills: { label: 'Bills', color: '#3f7a4c', emoji: '💡' },
  transfer: { label: 'Transfers', color: '#8a5a32', emoji: '💸' },
  income: { label: 'Income', color: '#1a6b43', emoji: '💰' },
};

const THEMES = ['night', 'teal', 'coral', 'gold', 'violet', 'forest'];
const CARD_NAMES = [
  'Definitely Not Impulse Buys', 'Snack Emergency Fund', 'Midnight Online Orders', 'Subscriptions I Forgot',
  'Coffee Addiction Card', 'Vacation (Someday)', 'Plant Shop Weakness', 'Adulting Expenses',
];

function seed() {
  return {
    balance: 1284.5,
    hide: false,
    activeCardId: 'c1',
    settings: { biometric: true, twofa: true, alerts: true, travel: false },
    stats: { pokes: 0, roasts: 0, moths: 3 },
    cards: [
      { id: 'c1', name: 'Everyday Spender', brand: 'VISA', number: '4539 1488 0343 4421', last4: '4421', expiry: '09/28', cvv: '318', theme: 'night', frozen: false, limit: 2000 },
      { id: 'c2', name: 'Online Shopping Only', brand: 'MASTERCARD', number: '5412 7512 3412 8830', last4: '8830', expiry: '03/27', cvv: '742', theme: 'teal', frozen: false, limit: 800 },
      { id: 'c3', name: 'Snack Fund', brand: 'VISA', number: '4916 3382 9090 1207', last4: '1207', expiry: '12/29', cvv: '506', theme: 'coral', frozen: false, limit: 150 },
    ],
    txs: [
      { id: 't1', title: 'Corner Café', cat: 'food', amount: -4.5, date: iso(2), note: 'Oat flat white', cardId: 'c3', emoji: '☕', status: 'done' },
      { id: 't2', title: 'Paycheck (finally)', cat: 'income', amount: 2400, date: iso(20), note: 'Acme Corp', cardId: 'c1', emoji: '💰', status: 'done' },
      { id: 't3', title: 'Streamify', cat: 'fun', amount: -12.99, date: iso(26), note: 'Just one more episode', cardId: 'c2', emoji: '🎬', status: 'done' },
      { id: 't4', title: 'Metro Pass', cat: 'transport', amount: -30, date: iso(31), note: '', cardId: 'c1', emoji: '🚇', status: 'done' },
      { id: 't5', title: 'Pizza Planet', cat: 'food', amount: -18.4, date: iso(50), note: 'Friday ritual', cardId: 'c3', emoji: '🍕', status: 'done' },
      { id: 't6', title: 'Gadget Hub', cat: 'shopping', amount: -59, date: iso(75), note: 'Noise-cancelling (for my thoughts)', cardId: 'c2', emoji: '🎧', status: 'done' },
      { id: 't7', title: 'From Maya', cat: 'transfer', amount: 25, date: iso(80), note: 'For the tacos', cardId: 'c1', emoji: '🧑‍🎤', status: 'done' },
      { id: 't8', title: 'Power & Light', cat: 'bills', amount: -64, date: iso(100), note: '', cardId: 'c1', emoji: '💡', status: 'done' },
      { id: 't9', title: 'Corner Café', cat: 'food', amount: -5.2, date: iso(122), note: '', cardId: 'c3', emoji: '☕', status: 'done' },
      { id: 't10', title: 'To Dev', cat: 'transfer', amount: -40, date: iso(142), note: 'Half the pizza', cardId: 'c1', emoji: '🧑‍💻', status: 'done' },
      { id: 't11', title: 'Gadget Hub', cat: 'shopping', amount: -22.5, date: iso(152), note: 'Cable #47', cardId: 'c2', emoji: '🎧', status: 'done' },
    ],
  };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.cards) && Array.isArray(s.txs)) return s;
  } catch { /* ignore */ }
  return seed();
}

let state = load();
const subs = new Set();
const notices = new Set();

export const get = () => state;
export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
export function onNotice(fn) {
  notices.add(fn);
}
function commit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  subs.forEach((f) => f(state));
}

const uid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const round = (n) => Math.round(n * 100) / 100;
const ok = (msg, extra = {}) => ({ ok: true, msg, ...extra });
const bad = (msg) => ({ ok: false, msg });
const validAmount = (a) => Number.isFinite(a) && a > 0 && a <= 100000;

function addTx(tx) {
  const t = { id: uid(), date: new Date().toISOString(), status: 'done', note: '', ...tx };
  state.txs.unshift(t);
  return t;
}

function activeCard() {
  const c = state.cards.find((x) => x.id === state.activeCardId) || state.cards[0];
  if (!c) return { err: 'No card selected. Wallet is confused 🤔' };
  if (c.frozen) return { err: `“${c.name}” is frozen ❄️ Unfreeze it or pick another default card.` };
  return { card: c };
}

/* ---------- Money actions ---------- */
export function sendMoney(id, amount, note) {
  const who = CONTACTS.find((c) => c.id === id);
  if (!who) return bad('Pick someone to send to first.');
  if (!validAmount(amount)) return bad('Enter an amount above $0. Even a coin counts 🪙');
  const c = activeCard();
  if (c.err) return bad(c.err);
  if (amount > state.balance) return bad('Insufficient funds. Your wallet just fainted 🫠');
  state.balance = round(state.balance - amount);
  addTx({ title: `To ${who.name}`, cat: 'transfer', amount: -amount, note, cardId: c.card.id, emoji: who.emoji });
  commit();
  return ok(`Sent ${money(amount)} to ${who.name}. Your wallet is crying softly 😢`, { fx: 'rain' });
}

export function requestMoney(id, amount, note) {
  const who = CONTACTS.find((c) => c.id === id);
  if (!who) return bad('Pick who to request from.');
  if (!validAmount(amount)) return bad('Enter an amount above $0.');
  const tx = addTx({ title: `Request from ${who.name}`, cat: 'transfer', amount, note, cardId: state.activeCardId, emoji: who.emoji, status: 'pending' });
  commit();
  setTimeout(() => {
    const t = state.txs.find((x) => x.id === tx.id);
    if (!t || t.status !== 'pending') return;
    t.status = 'done';
    t.title = `From ${who.name}`;
    t.date = new Date().toISOString();
    state.balance = round(state.balance + amount);
    commit();
    notices.forEach((fn) => fn(`${who.name} paid ${money(amount)}. Miracles happen ✨`, 'success', 'confetti'));
  }, 6000);
  return ok(`Request sent to ${who.name}. Fingers crossed 🤞`);
}

export function payMerchant(id, amount) {
  const m = MERCHANTS.find((x) => x.id === id);
  if (!m) return bad('Pick who you are paying.');
  if (!validAmount(amount)) return bad('Enter an amount above $0.');
  const c = activeCard();
  if (c.err) return bad(c.err);
  if (amount > state.balance) return bad('Insufficient funds. Maybe pay in compliments? 🫠');
  state.balance = round(state.balance - amount);
  addTx({ title: m.name, cat: m.cat, amount: -amount, note: '', cardId: c.card.id, emoji: m.emoji });
  commit();
  return ok(`Paid ${money(amount)} to ${m.name}. Worth it? Probably 🤷`, { fx: 'rain' });
}

export function topUp(id, amount) {
  const src = SOURCES.find((s) => s.id === id);
  if (!src) return bad('Pick where the money comes from.');
  if (!validAmount(amount)) return bad('Enter an amount above $0.');
  state.balance = round(state.balance + amount);
  addTx({ title: `Top-up · ${src.name}`, cat: 'income', amount, note: '', cardId: state.activeCardId, emoji: src.emoji });
  commit();
  return ok(`+${money(amount)} from ${src.name}. Wallet is purring 😻`, { fx: 'confetti' });
}

/* ---------- Cards & settings ---------- */
export function toggleFreeze(id) {
  const c = state.cards.find((x) => x.id === id);
  if (!c) return;
  c.frozen = !c.frozen;
  commit();
  return c.frozen ? `“${c.name}” frozen ❄️ Nobody is spending anything.` : `“${c.name}” thawed. Spend responsibly 🔥`;
}

export function setActive(id) {
  state.activeCardId = id;
  commit();
}

export function addCard() {
  if (state.cards.length >= 6) return bad('Wallet is full. It is a wallet, not a suitcase 🧳');
  const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
  const last4 = digits(4);
  const brand = Math.random() > 0.5 ? 'VISA' : 'MASTERCARD';
  const used = state.cards.map((c) => c.theme);
  const theme = THEMES.find((t) => !used.includes(t)) || pick(THEMES);
  const card = {
    id: 'c' + Date.now().toString(36),
    name: pick(CARD_NAMES),
    brand,
    number: `${brand === 'VISA' ? '4' : '5'}${digits(3)} ${digits(4)} ${digits(4)} ${last4}`,
    last4,
    expiry: `${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}/${28 + Math.floor(Math.random() * 3)}`,
    cvv: digits(3),
    theme,
    frozen: false,
    limit: 100 * (1 + Math.floor(Math.random() * 6)),
  };
  state.cards.push(card);
  commit();
  return ok(`New virtual card “${card.name}” is ready 🎴`, { id: card.id });
}

export function freezeAll() {
  state.cards.forEach((c) => (c.frozen = true));
  commit();
}

export function setSetting(key, value) {
  state.settings[key] = value;
  commit();
}

export function toggleHide() {
  state.hide = !state.hide;
  commit();
}

export function bump(stat) {
  state.stats[stat] = (state.stats[stat] || 0) + 1;
  commit();
  return state.stats[stat];
}

export function reset() {
  state = seed();
  commit();
}

/* ---------- Selectors ---------- */
const within = (t, days) => Date.now() - new Date(t.date).getTime() < days * DAY;

export function totals(days = 30) {
  let inn = 0;
  let out = 0;
  state.txs.forEach((t) => {
    if (t.status !== 'done' || !within(t, days)) return;
    if (t.amount > 0) inn += t.amount;
    else out += -t.amount;
  });
  return { inn: round(inn), out: round(out), net: round(inn - out) };
}

export function byCategory(days = 30) {
  const map = {};
  state.txs.forEach((t) => {
    if (t.amount < 0 && t.status === 'done' && within(t, days)) map[t.cat] = (map[t.cat] || 0) + -t.amount;
  });
  return Object.entries(map)
    .map(([cat, value]) => ({ cat, value: round(value), ...CATS[cat] }))
    .sort((a, b) => b.value - a.value);
}

export function weekly() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ start: d.getTime(), label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 });
  }
  state.txs.forEach((t) => {
    if (t.amount >= 0 || t.status !== 'done') return;
    const ts = new Date(t.date).getTime();
    for (let i = days.length - 1; i >= 0; i--) {
      if (ts >= days[i].start) {
        days[i].value += -t.amount;
        break;
      }
    }
  });
  return days.map((d) => ({ ...d, value: round(d.value) }));
}

export function cardSpent(id) {
  return round(state.txs.filter((t) => t.cardId === id && t.amount < 0 && t.status === 'done' && within(t, 30)).reduce((s, t) => s - t.amount, 0));
}

export function securityScore() {
  const s = state.settings;
  return 20 + (s.biometric ? 30 : 0) + (s.twofa ? 30 : 0) + (s.alerts ? 10 : 0) + (s.travel ? 0 : 10);
}
