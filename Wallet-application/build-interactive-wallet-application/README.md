# PocketPal After Dark

A floating, devil-inspired wallet with interactive cards, demo payments, spending charts, and a responsive dark interface. Demo data is saved in this browser's local storage; no real money moves.

## Run locally

From the `Wallet-application` folder:

```sh
cd build-interactive-wallet-application
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally `http://localhost:5173/`. Stop the server with `Ctrl+C`.

Use a Node.js version supported by Vite 7: Node 20.19+ or 22.12+. This project was built with Node 24.15.0.

## Build and preview

```sh
npm run build
npm run preview
```

Open the preview URL printed in the terminal, normally `http://localhost:4173/`. The production output is `dist/index.html`.

## Try the experience

- Scroll to open the floating wallet, or choose **Open my wallet** to jump directly to your overview.
- Move your pointer around the wallet or tap it for a reaction.
- Try Send, Request, Pay, and Top-Up with demo funds. Escape closes a dialog, and Tab stays inside it.
- Explore Cards to flip, reveal, freeze, or add demo cards.
- Search and filter Activity; manage demo settings in Profile.
- Resize to a mobile width to use the bottom navigation. System reduced-motion preferences disable floating and decorative motion.
- Use **Reset demo data** in Profile to restore the initial sample state.

## Active source files

The app is a Vite-served vanilla JavaScript application. `index.html` loads `js/app.js`, the page modules in `pages/`, and `css/styles.css`. The React files under `src/` are unused starter files; editing them does not change this app.
