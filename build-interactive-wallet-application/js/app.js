// PocketPal – app entry. Hash router + bottom nav + global wiring.
import { $, $$ } from './format.js';
import { icon } from './icons.js';
import { onNotice, USER } from './state.js';
import { openSheet, runFx, toast } from './ui.js';
import home from '../pages/home.js';
import cards from '../pages/cards.js';
import activity from '../pages/activity.js';
import profile from '../pages/profile.js';

const routes = {
  '/': { page: home, label: 'Overview', icon: 'home' },
  '/cards': { page: cards, label: 'Cards', icon: 'card' },
  '/activity': { page: activity, label: 'Activity', icon: 'activity' },
  '/profile': { page: profile, label: 'Profile', icon: 'user' },
};

const app = $('#app');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let cleanup = null;
let currentPath = '/';

/* ---------- Bottom navigation ---------- */
$$('.tab').forEach((a) => {
  const r = routes[a.dataset.route];
  a.innerHTML = `${icon(r.icon, 24)}<span>${r.label}</span>`;
});

const profileLink = $('.header-profile');
profileLink.textContent = USER.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
profileLink.setAttribute('aria-label', `Open profile for ${USER.name}`);

// Keep the skip link out of the hash router so it never resets the current page.
$('.skip-link').addEventListener('click', (event) => {
  event.preventDefault();
  app.focus({ preventScroll: true });
  app.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
});

$$('[data-route], .brand').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.hash === `#${currentPath}`) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
      app.focus({ preventScroll: true });
    }
  });
});

/* ---------- Router ---------- */
function navigate() {
  const path = location.hash.replace(/^#/, '') || '/';
  const route = routes[path] || routes['/'];
  currentPath = routes[path] ? path : '/';

  cleanup?.();
  cleanup = null;
  app.classList.remove('page-in');
  app.innerHTML = route.page.render();
  window.scrollTo(0, 0);
  document.body.dataset.page = currentPath === '/' ? 'home' : currentPath.slice(1);
  document.title = currentPath === '/' ? 'PocketPal — A wallet with a wild side' : `${route.page.title} · PocketPal After Dark`;

  cleanup = route.page.mount(app) || null;

  $$('.tab, .nav-link').forEach((a) => {
    if (a.dataset.route === currentPath) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  observeReveals();
  void app.offsetWidth;
  if (!reduceMotion) app.classList.add('page-in');
  app.focus({ preventScroll: true });
}

/* ---------- Scroll reveal ---------- */
let io = null;
function observeReveals() {
  io?.disconnect();
  const items = $$('.reveal', app);
  if (reduceMotion || !('IntersectionObserver' in window)) return items.forEach((el) => el.classList.add('in'));
  io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Global actions (Send / Request / Pay / Top-Up) ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn) openSheet(btn.dataset.action);
});

// Notices coming from the store (e.g. a friend finally paid you back)
onNotice((msg, kind, fx) => {
  toast(msg, kind);
  runFx(fx);
});

window.addEventListener('hashchange', navigate);
navigate();
