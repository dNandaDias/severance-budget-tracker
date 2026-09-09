# Budget Tracker

A personal budget tracker with two modes, chosen from a landing screen:

- **Usual Budget** — everyday income and expenses, categorized, with monthly and
  spending-by-category breakdowns. For ongoing, month-to-month budgeting.
- **Severance / Career Transition** — a severance payout draining over time,
  alongside income and expenses, with a runway projection. Built first, for a real
  career-transition period; the generic mode came later, reusing the same
  components.

Originally built as a Claude.ai artifact, then extracted into a proper local
project and rebuilt into a two-mode app with categorized spending, CSV import/export,
dark mode, and a privacy-blur toggle.

## Running it

Requires [Node.js](https://nodejs.org) (18+).

```bash
npm install
npm run dev      # starts a dev server with hot reload
npm run build    # production build to dist/
```

There's a single entry point now — the Vite project. (An earlier zero-install
`standalone.html` version existed for a while during development but was retired
once the app grew a second mode; keeping a hand-copied duplicate of a two-mode,
multi-file app in sync by hand stopped being worth it.)

## Features

- **Mode picker** on first visit; your choice is remembered, and a "Switch mode"
  button in the header takes you back to it any time.
- **Categorized spending** — every expense (fixed, variable, one-off, or uploaded
  via CSV) can be tagged with a category, from a preset list or a custom one you
  add. One unified "Expense Breakdown by Category" chart across all of it.
- **CSV import** for migrating from another budgeting tool or spreadsheet (expects
  Date/Amount/Category columns), plus **CSV and JSON export** of everything entered.
- **"Start a new period"** — download a full backup, then clear a mode's data for a
  fresh start (e.g. severance ending, a new job starting). Confirms first, and the
  clear itself is undoable for a few seconds. The other mode is never affected.
- **Dark mode** and a **privacy-blur toggle** (for screen-sharing or screenshots),
  both real Material 3 treatments, not a quick inversion.

## Project structure

```
severance-budget-tracker/
├── index.html                      # Vite entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── docs/
│   ├── specs/                      # written plans for larger features
│   └── figma-screenshots/          # before/after screenshots for design documentation
└── src/
    ├── main.jsx                    # Vite entry, mounts <App />
    ├── App.jsx                     # holds the chosen mode, renders the picker or a tracker
    ├── index.css                   # Tailwind directives
    ├── BudgetTracker.jsx           # "Usual Budget" mode
    ├── SeveranceBudgetTracker.jsx  # "Severance / Career Transition" mode
    ├── components/                 # shared UI: both trackers import from here
    │   ├── ModePicker.jsx, AppHeader.jsx, TabNav.jsx, ThemeStyles.jsx
    │   ├── StatCard.jsx, SectionCard.jsx, ExpandingChart.jsx, NumberField.jsx
    │   ├── CategorySelect.jsx, AmountListSection.jsx, UnusualExpensesSection.jsx,
    │   │   DistributedExpensesSection.jsx
    │   ├── ExportDataSection.jsx, ConfirmDialog.jsx, Snackbar.jsx
    │   ├── PrivacyContext.jsx, icons.jsx
    ├── hooks/                       # useInView, useCountUp
    └── lib/                         # format.js, categories.js, chartTheme.js
```

Both trackers are separate top-level components (not one component with
conditional sections) but share almost everything presentational — only the data
model and the dashboard's calculations differ between them.

## Data & state

Nothing is sent to a server; everything lives in `localStorage`.

Each mode's financial data is **namespaced separately**, so switching modes never
overwrites the other:

- `budgetTracker_severance_*` — income, fixedMonthly, fixedAnnual, variableMonthly,
  unusualExpenses, distributedExpenses, uploadedExpenses (severance mode)
- `budgetTracker_generic_*` — the same fields, for Usual Budget mode

A few things are **shared** across both modes, since they're viewing preferences
or a personal taxonomy, not data tied to one period:

- `budgetTracker_categories` — your preset + custom category list
- `budgetTracker_darkMode`, `budgetTracker_hideAmounts` — appearance preferences
- `budgetTracker_activeMode` — which mode the picker last sent you to

## Design notes

- Material 3-inspired visuals: tonal colour containers, `rounded-[28px]` cards,
  pill-shaped segmented tab nav, soft elevation via shadow/hover instead of heavy
  borders, Fraunces for headings.
- Usability: undo-on-delete (5s snackbar, also used for the "start fresh" reset),
  a confirmation dialog before anything destructive, a "Saved" indicator that
  pulses on autosave, scroll-reveal + hover-expanding charts, a collapsible
  "Spread-out Expenses" section.
- Checked against this workspace's `design-principles.md` (WCAG 2.2 contrast,
  Gestalt grouping, Nielsen's heuristics) rather than just eyeballed — a couple of
  real contrast bugs were found and fixed this way during development, not
  assumed away.
