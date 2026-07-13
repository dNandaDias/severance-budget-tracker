# Budget Safety Net Tracker

A severance/budget runway tracker for a career transition period (Sep 2025 - Sep 2026). Tracks income sources, fixed/variable/one-off/spread-out expenses, and projects the balance forward across a 13-month horizon.

Originally built as a Claude.ai artifact; extracted here so it can be developed locally instead of through the chat UI.

## Two ways to run it

### 1. Zero-install: `standalone.html`

Just open `standalone.html` directly in a browser (double-click it, or serve it with any static file server). It loads React, Recharts, lucide-react and PapaParse from CDNs (esm.sh / unpkg) at runtime and uses Tailwind's Play CDN, so there's nothing to install.

Good for quick edits and previewing changes without a build step. After editing the JSX inside the `<script type="text/babel" data-type="module">` block, just refresh the page.

Note: opening the file with `file://` won't work in most browsers because of ES module CORS restrictions - serve it over `http://` instead, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

### 2. Proper dev setup: Vite project

This is the same component (`src/SeveranceBudgetTracker.jsx`) wired up as a normal Vite + React + Tailwind project, for when you want fast HMR, a real build, linting, etc.

Requires [Node.js](https://nodejs.org) (18+) - this machine didn't have it installed at the time this was set up.

```bash
npm install
npm run dev      # starts a dev server with hot reload
npm run build    # production build to dist/
```

## Project structure

```
severance-budget-tracker/
├── standalone.html              # zero-install version (CDN-based)
├── index.html                   # Vite entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                 # Vite entry, mounts the component
    ├── index.css                # Tailwind directives
    └── SeveranceBudgetTracker.jsx  # the actual app (single component)
```

**Keep `src/SeveranceBudgetTracker.jsx` and the JSX embedded in `standalone.html` in sync** if you want both entry points to stay usable - they're currently identical copies of the same component, not shared via import, since `standalone.html` can't import a local `.jsx` file without a bundler.

## Data & state

All state lives in `localStorage` under these keys (nothing is sent to a server):

- `budgetTracker_income`
- `budgetTracker_fixedMonthly`
- `budgetTracker_fixedAnnual`
- `budgetTracker_variableMonthly`
- `budgetTracker_unusualExpenses`
- `budgetTracker_distributedExpenses`
- `budgetTracker_uploadedExpenses`
- `budgetTracker_currentMonthExpenses`

Because `standalone.html` and the Vite dev server run on different origins/ports, they'll have **separate localStorage**, so data entered in one won't show up in the other. If you want the same data everywhere, export/re-import manually or pick one entry point to be canonical.

## Design notes

- Material 3-inspired visuals: tonal color containers, `rounded-[28px]` cards, pill-shaped segmented tab nav, soft elevation via shadow/hover instead of heavy borders.
- Usability: undo-on-delete (5s snackbar), a "Saved" indicator that pulses on autosave, scroll-reveal + hover-expanding charts, collapsible "Spread-out Expenses" section.
- All financial calculations (severance runway, monthly projections, quarterly rollups) are unchanged from the original artifact - only the visual/interaction layer was redesigned.
