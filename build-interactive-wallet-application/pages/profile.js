// PROFILE – security score, privacy & security settings, panic button, silly achievements.
import { $ } from '../js/format.js';
import { icon } from '../js/icons.js';
import * as store from '../js/state.js';
import { pageHead, securePill, switchBtn } from '../js/components.js';
import { confetti, toast } from '../js/ui.js';

const SETTINGS = [
  ['biometric', 'Biometric confirmation', 'Fingerprint / face check before any payment', 'finger'],
  ['twofa', '2-step login', 'Extra code when signing in', 'shield'],
  ['alerts', 'Spending alerts', 'Instant notifications for every payment', 'bell'],
  ['travel', 'Travel mode', 'Allow payments abroad (off = safer)', 'globe'],
];

export default {
  title: 'Profile',
  render() {
    return `<div class="page page-profile">
      ${pageHead('Profile', 'You, but in wallet form.', securePill())}
      <section class="panel me" data-r="me"></section>
      <section class="panel" data-r="score" aria-labelledby="h-sec"></section>
      <section class="panel" aria-labelledby="h-set">
        <h2 class="h3" id="h-set">Security & privacy</h2>
        <div data-r="settings"></div>
      </section>
      <section class="panel panic" aria-labelledby="h-panic">
        <h2 class="h3" id="h-panic">${icon('alert', 22)} Panic button</h2>
        <p class="muted">Lost your wallet or just feeling dramatic? Freeze every card instantly.</p>
        <button class="btn btn-danger btn-block" data-act="panic">${icon('snow', 20)} Freeze all cards</button>
      </section>
      <section class="panel" aria-labelledby="h-ach">
        <h2 class="h3" id="h-ach">Achievements</h2>
        <ul class="badges" data-r="badges"></ul>
      </section>
      <button class="btn btn-ghost btn-block" data-act="reset">${icon('refresh', 20)} Reset demo data</button>
    </div>`;
  },

  mount(root) {
    const region = (n) => $(`[data-r="${n}"]`, root);

    function paint() {
      const s = store.get();
      const score = store.securityScore();
      const level = score >= 90 ? 'Fort Knox' : score >= 70 ? 'Well protected' : 'Needs attention';
      region('me').innerHTML = `
        <div class="avatar" aria-hidden="true">🦊</div>
        <div><h2 class="h2">${store.USER.name}</h2><p class="muted">${store.USER.handle}</p>
          <p class="level">Level 7 · Pocket Lint Pro 🧶</p></div>`;

      const C = 2 * Math.PI * 42;
      region('score').innerHTML = `
        <h2 class="h3" id="h-sec">Security score</h2>
        <div class="score">
          <div class="ring-chart" role="img" aria-label="Security score ${score} out of 100">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#eadfca" stroke-width="10"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="${score >= 70 ? '#1a6b43' : '#b3261e'}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${(score / 100) * C} ${C}" transform="rotate(-90 50 50)"/></svg>
            <b>${score}</b>
          </div>
          <div><strong class="score-label ${score >= 70 ? 'good' : 'low'}">${score >= 70 ? icon('check', 16) : icon('alert', 16)} ${level}</strong>
            <p class="muted">${score >= 90 ? 'Your wallet is basically a vault with feelings.' : 'Turn on more protections below to boost your score.'}</p></div>
        </div>`;

      region('settings').innerHTML = SETTINGS.map(
        ([k, t, d, ic]) => `<div class="row"><span class="set-ico">${icon(ic, 22)}</span>
          <div><strong>${t}</strong><p class="muted small-print">${d}</p></div>${switchBtn(k, s.settings[k], t)}</div>`
      ).join('') + `<div class="row"><span class="set-ico">${icon(s.hide ? 'eyeOff' : 'eye', 22)}</span>
          <div><strong>Hide balance</strong><p class="muted small-print">Mask your balance on the home screen</p></div>${switchBtn('hide', s.hide, 'Hide balance')}</div>`;

      const has = (f) => s.txs.some(f);
      const badges = [
        ['🏆', 'Wallet Bully', 'Poke the wallet 10 times', s.stats.pokes >= 10],
        ['🔥', 'Thick Skin', 'Get roasted once', s.stats.roasts >= 1],
        ['🐷', 'Top-Up Titan', 'Add money to your wallet', has((t) => t.title.startsWith('Top-up'))],
        ['🛡️', 'Fort Knox', 'Security score of 90+', store.securityScore() >= 90],
        ['🦋', 'Moth Whisperer', 'Evacuate 5 moths', s.stats.moths >= 5],
      ];
      region('badges').innerHTML = badges
        .map(([e, t, d, on]) => `<li class="badge-item ${on ? 'on' : ''}"><span>${e}</span><div><strong>${t}</strong><small>${d}</small></div><b>${on ? '✓ Earned' : 'Locked'}</b></li>`)
        .join('');
    }
    paint();
    const unsub = store.subscribe(paint);

    const onClick = (e) => {
      const sw = e.target.closest('[data-switch]');
      if (sw) {
        const k = sw.dataset.switch;
        if (k === 'hide') {
          store.toggleHide();
          return toast(store.get().hide ? 'Balance hidden 🕶️' : 'Balance visible 👀');
        }
        const next = !store.get().settings[k];
        store.setSetting(k, next);
        return toast(`${SETTINGS.find((x) => x[0] === k)[1]} is now ${next ? 'ON' : 'OFF'}`, next ? 'success' : 'info');
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'panic') {
        store.freezeAll();
        toast('All cards frozen ❄️ The wallet is now an ice cube.', 'success');
      }
      if (a.dataset.act === 'reset') {
        store.reset();
        confetti(24);
        toast('Demo data reset. Fresh start! 🌱', 'success');
      }
    };
    root.addEventListener('click', onClick);
    return () => {
      unsub();
      root.removeEventListener('click', onClick);
    };
  },
};
