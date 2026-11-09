// All the jokes live here. Because a wallet should have a personality.
import { money, pick } from './format.js';
import { byCategory } from './state.js';

const ITEMS = [
  ['avocado toasts', 12, '🥑'],
  ['oat lattes', 5.5, '☕'],
  ['pizzas', 18, '🍕'],
  ['rubber ducks', 3, '🦆'],
  ['bubble teas', 6.5, '🧋'],
  ['dramatic sighs', 0.5, '😮‍💨'],
];

export function balanceJoke(balance) {
  const [name, price, emoji] = ITEMS[Math.floor(balance) % ITEMS.length];
  const n = Math.max(0, Math.floor(balance / price));
  return `That's ${n.toLocaleString('en-US')} ${name} ${emoji}`;
}

const POKES = [
  'Hey! Personal space! 😳',
  'Ouch! I am not a piggy bank 🐷',
  'Stop poking, I am full of receipts 🧾',
  'Do that again and I tell your bank 😤',
  'Tickles! Hehehe 🤭',
  'I have filed a complaint with HR 📋',
  'Fine. Poke me. See if I care. (I care.) 😢',
];
export const pokeLine = (n) => (n === 10 ? 'Achievement unlocked: Wallet Bully 🏆' : POKES[(n - 1) % POKES.length]);

export function roast() {
  const top = byCategory(30)[0];
  if (!top) return 'No spending at all? Suspicious. Are you even a person? 🕵️';
  const v = money(top.value);
  const lines = {
    food: `${v} on food. Your fridge filed a missing-person report 🍕`,
    shopping: `${v} on shopping. Your cart called — it wants a day off 🛒`,
    fun: `${v} on fun. The couch now has your outline 🛋️`,
    bills: `${v} on bills. Adulting is expensive, and you're doing it. Respect 🫡`,
    transport: `${v} on transport. You could have bought a very small horse 🐴`,
    transfer: `${v} sent to friends. You're a walking ATM with feelings 🏧`,
  };
  return lines[top.cat] || `${v} spent. Bold choices. I'm just a wallet. 🤷`;
}

export const FEED = [
  'Nom nom… that was a 2019 receipt. Delicious 🧾',
  'Burp. Excuse me. That was a coupon that expired in 2021 🎟️',
  'Wallet ate a button. It will regret this 🔘',
  'Yum! Gift card with $0.03 left 🎁',
];

export const MOTH_LINES = [
  'Moth evacuated! It said “thanks for the shelter” 🦋',
  'Another moth escaped. Wallet feels lighter already 🦋',
  'This one was named Kevin. Goodbye, Kevin 🦋',
];

export function brokeMeter(balance) {
  const pct = Math.max(2, Math.min(100, (balance / 3000) * 100));
  let label = 'Snack budget 🍿';
  if (balance > 300) label = 'Pizza party ready 🍕';
  if (balance > 1000) label = 'Comfortably chill 😎';
  if (balance > 2000) label = 'Suspiciously rich 🧐';
  if (balance > 3500) label = 'Who are you?! 🤑';
  return { pct, label };
}

export const TICKER = [
  '🥑 Avocado toast index ▲ 2.3%',
  '☕ Coffee prices ▼ 0.4% (rejoice)',
  '🪙 Couch-cushion coins ▲ 12%',
  '🦋 Moth population in wallets ▼ 99%',
  '🍕 Pizza confidence ▲ 100%',
  '🐷 Piggy bank sentiment: nervous',
  '🧾 Receipts in your wallet: too many',
];

export const randomFeed = () => pick(FEED);
export const randomMoth = () => pick(MOTH_LINES);
