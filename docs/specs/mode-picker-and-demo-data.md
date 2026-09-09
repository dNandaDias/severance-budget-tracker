# Mode picker + demo data (resuming after pause)

Status: all 10 steps complete — live at https://dnandadias.github.io/severance-budget-tracker/
Created: 2026-08-27
Last updated: 2026-09-09

## Context — what "resuming" actually means here

Two separate threads were both in flight when this project paused, neither committed:

1. **A visual redesign**, uncommitted in the working tree (`index.html`, `tailwind.config.js`,
   `src/SeveranceBudgetTracker.jsx`, `standalone.html`).
2. **Real personal defaults hardcoded as fallback state** — not just data. The fallback
   values used when `localStorage` is empty (i.e. what anyone cloning the repo, or a
   fresh visitor to the deployed site, would see) are Nanda's actual figures and life
   details: `severancePay: 80000`, `severanceForMonthly: 10000`, `unemploymentPay: 2690`,
   `garageRent: 150`, and named line items "Flat Loan", "Hausgeld", "Flat Down Payment",
   "New Laptop", "Reset Trip" (`src/SeveranceBudgetTracker.jsx` lines ~575–634, mirrored
   in `standalone.html`).

**Confirmed: nothing gets committed or pushed until the personal defaults above are
replaced with generic demo data.** This is a precondition for showing the project on
GitHub at all, independent of the mode-picker feature.

## Redesign audit (done 2026-09-04) — what's actually finished

Traced through the code (not just the diff) to separate "wired up" from "half-built":

| Piece | Status |
|---|---|
| Privacy blur (`hideAmounts`, eye toggle) | ✅ Done, working end-to-end |
| CSV & JSON export (`handleExportCSV`/`handleExportJSON`, "Export Data" section) | ✅ Done, working end-to-end |
| Restyled `StatCard` + Fraunces font | ✅ Done |
| Quarterly `ComposedChart` | ✅ Done |
| Dark mode (`darkMode` toggle, `Sun`/`Moon` icons) | ⚠️ Toggle exists and persists to `localStorage`, but `tailwind.config.js` isn't set to `darkMode: 'class'` (still default `media` strategy) and there are **zero** `dark:` variant classes anywhere in the component — the button currently does nothing visible. |

**Confirmed: finish dark mode properly** — not a quick inversion. Build it as a real
Material Design 3 dark theme, checked for accessible contrast (WCAG 2.2), per
`design-principles.md` at the ND_AI workspace root — that file is the standing reference
for colour/contrast/accessible sizing on every UI built here, and this dark theme should
be checked against it before being called finished.

## Goal

Add a first screen that lets a visitor choose between:
- **Generic budget app** — fixed income, fixed/variable expenses, charts per category.
  No severance/runway concepts.
- **Special version (Nanda's)** — the existing severance runway tracker, unchanged in
  substance.

**Confirmed: separate components**, not one component with conditional sections. A
landing screen picks the mode, then mounts either `BudgetTracker` (new, generic) or
`SeveranceBudgetTracker` (existing) as distinct top-level components.

## Data model split

| Shared (generic app gets these) | Severance-only (stays in `SeveranceBudgetTracker`) |
|---|---|
| `fixedMonthly`, `fixedAnnual`, `variableMonthly` | `income.severancePay` |
| `unusualExpenses`, `distributedExpenses`, `uploadedExpenses` | `income.severanceForMonthly` |
| `income.unemploymentPay` → generalize to a generic "other income" line | `runwayMonths`, `currentSeveranceBalance`, `monthlyFromSeverance` |
| `income.sharesSold`, `income.freelancerWork`, `garageRent`, `flatRent` → generalize as generic income line items | Hero stat card "Available Severance", runway sub-label, CSV rows for severance income |

The redesign work (privacy blur, dark mode, restyled cards, Fraunces font, CSV export,
`ComposedChart`) applies to **both** modes equally — it's presentation layer, not
severance-specific — so it lands once, in shared pieces both components import.

## Migrating from another tool (Nanda's real use case)

Scenario: someone has expense history in another app/spreadsheet and wants to bring it
in rather than start from zero.

**Confirmed: already covered, no build needed.** `src/SeveranceBudgetTracker.jsx` already
has a working drag-and-drop CSV upload (`handleCSVUpload`, "Upload Expense Data" section,
~line 1567) that expects Date/Amount/Category columns and folds every row into the app's
totals and charts. The two-step workflow this supports: (1) the person sends screenshots
of their old tool to Claude in chat, who converts them into a CSV — that step happens in
conversation, not inside the app; (2) they upload the resulting CSV here, which already
works today. Nothing to build for this one.

## Spending categories (Nanda's requirement, added 2026-09-04)

**The gap found:** the existing "Expense Breakdown by Category" pie chart only reads
categories from **uploaded CSV rows** (`uploadedExpenses`, via the Category column above).
Anything typed directly into the app — `fixedMonthly`, `fixedAnnual`, `variableMonthly`,
`unusualExpenses` — has no category field at all; those only get bucketed by *type*
(fixed/variable/annual/one-off) in the separate "Expense Composition" chart, not by
*life area* (groceries, entertainment, etc.). So today: upload a CSV with categories and
you get the "where am I overspending" insight; type an expense in by hand and you don't.
There's also no preset category list anywhere, and no "add a custom category" UI.

**Confirmed scope: every manually-typed expense gets a category field too** — `fixedMonthly`,
`fixedAnnual`, `variableMonthly`, and `unusualExpenses` all gain an optional `category`
field (dropdown of presets + a "custom" option that adds a new one to the list). The
existing "Expense Breakdown by Category" chart becomes a **unified view**: uploaded CSV
rows and manually-typed expenses, categorized together in one chart, instead of two
disconnected category systems. The structural "Expense Composition" chart (fixed/variable/
annual/one-off) stays as-is — it answers a different question and both are useful.

This is a **shared** feature (per the data model split above, `fixedMonthly` etc. are
already shared columns) — it applies to both the severance tracker and the generic
`BudgetTracker`, not just the new mode.

**Confirmed starter category list (11):** Groceries · Dining Out · Transportation ·
Entertainment · Shopping & Clothing · Household · Health & Wellness · Subscriptions ·
Travel · Education · Miscellaneous. ("Household" chosen over "Utilities" since it also
covers things already tracked as separate fixed items today, like the building
maintenance fee and general home upkeep, not just metered services. "Miscellaneous" kept
deliberately as a catch-all — without one, odd expenses either get force-fit into the
wrong category and quietly skew the real numbers, or can't be logged at all; if it grows
large over time that's itself a useful signal.)

Custom categories a person adds are **per-install** (saved to their own `localStorage`
alongside their data), not global — the starter 11 are just the seed list every fresh
install begins with.

## Mode switching & data continuity (Nanda's real use case)

Scenario: using severance mode during a career transition, then getting a new job and
switching to plain budget-tracking mode, without losing the severance period's history.

**Confirmed approach: separate `localStorage` namespaces per mode** (e.g.
`budgetTracker_severance_income` vs `budgetTracker_generic_income`). Switching modes
only changes which component is mounted — each mode's data sits untouched in its own
namespace, so going back to severance mode later shows exactly what was left there, and
the generic mode starts fresh the first time it's used.

**Confirmed: also add an export/backup option** — a way to download a finished period's
numbers (CSV, building on the export work already done above) as a personal backup file,
on top of the separate-storage safety net.

## Resolved decisions (previously open questions)

1. **Code sharing / `standalone.html`.** **Confirmed: retire `standalone.html`.**
   Consolidate to the Vite project as the single source of truth (Node.js v24.18.1 /
   npm 11.16.0 confirmed installed). Shared presentational pieces (`StatCard`,
   `SectionCard`, `AmountListSection`, `NumberField`, `Amount`, `ChartTooltip`, export
   logic, chart rendering) move to `src/components/` and both mode components import
   from there — no more hand-copying changes into two files.
2. **Navigation.** **Confirmed: no router.** Plain internal state
   (`const [mode, setMode] = useState(null)`), landing screen shown when `mode` is null.
   Revisit only if a real conflict shows up in practice (Nanda's words: "only if we see
   conflicts that we should use it").
3. **Demo data scope.** **Confirmed: one shared, illustrative demo dataset** used by
   both modes, purely to show the app working / for screenshots.
4. **Redesign disposition.** **Confirmed: keep and finish everything**, including
   dark mode (see audit above) — nothing gets dumped.
5. **Easy viewing without cloning.** **Confirmed: deploy a live version via GitHub
   Pages**, built from the Vite project, instead of a duplicated zero-install file.
   One click for a visitor, no download step, and it rebuilds from the same code
   automatically instead of needing manual copies kept in sync.

## Progress log

- **2026-09-04 — Step 1 done.** Dark mode finished. Found and fixed a real WCAG
  contrast failure along the way: `StatCard` fills swapped to lighter dark-mode
  tints while still holding solid white text, dropping as low as 1.74:1 in one
  tone. Fixed by decoupling the fill colours from the theme swap so they hold
  ≥4.5:1 in both themes. Verified at desktop and mobile width.
- **2026-09-04 — Step 2 done.** Every hardcoded personal default (severance
  €80,000, unemployment €2,690, "Hausgeld", "Flat Down Payment", "Reset Trip",
  etc.) replaced with a made-up demo scenario, in **both**
  `src/SeveranceBudgetTracker.jsx` and `standalone.html` (which is still a
  synced duplicate until step 7). Two demo figures were also rebalanced so the
  default view reads as "on track" (92% budget usage, positive remaining)
  rather than over budget — a nicer first impression for a portfolio demo.
  **The repo is now safe to commit as far as private data goes** — remaining
  steps are about the mode-picker feature itself, not privacy.
- **2026-09-04 — Step 3 done.** Added the `category` field to `fixedMonthly`,
  `fixedAnnual`, `variableMonthly`, and `unusualExpenses`, backed by a new
  `CategorySelect` component (preset dropdown + inline "add category" input,
  persisted to `budgetTracker_categories`). The "Expense Breakdown by Category"
  chart now aggregates manually-typed expenses *and* uploaded CSV rows into one
  unified view — previously it only read uploaded rows. Old saved data without
  a `category` field falls back to "Miscellaneous" via `withCategoryFallback`.
  Verified end-to-end in the browser: editing, the preset list, adding a custom
  category, and the merged chart (7 pie slices from 4 different expense arrays,
  correctly grouped by category name). Ported identically into `standalone.html`;
  verified there via an `esbuild` JSX syntax check since that file's sandboxed
  preview can't execute its CDN-script-based setup in this tool.
- **2026-09-05 — Step 4 done.** Extracted every shared presentational piece out
  of `src/SeveranceBudgetTracker.jsx` into `src/lib/` (`format.js`,
  `categories.js`, `chartTheme.js`), `src/hooks/` (`useInView`, `useCountUp`),
  and `src/components/` (`icons`, `PrivacyContext`, `StatCard`, `SectionCard`,
  `ExpandingChart`, `NumberField`, `CategorySelect`, `Snackbar`,
  `AmountListSection`, `UnusualExpensesSection`, `DistributedExpensesSection`).
  `SeveranceBudgetTracker.jsx` shrank from ~1780 lines to ~1160, now just the
  main component's state/logic plus imports. Pure refactor, no behaviour
  change — verified with an esbuild syntax check, a full bundle-resolution
  check (catches import/export mismatches static parsing can't), a real
  `npm run build`, and live in the browser (dark mode, privacy blur, category
  editing all re-tested and working identically to before).
  `standalone.html` is **untouched** — it has no bundler, so it keeps its own
  fully inlined copy of everything until it's retired in step 7.
- **2026-09-05 — Step 5 done.** Built `src/BudgetTracker.jsx`, the generic
  "usual budget app". Extracted two more genuinely shared pieces first
  (`ThemeStyles`, `AppHeader`, `TabNav` — the theme CSS and header/tab chrome
  were about to get duplicated a second time otherwise) and wired both
  trackers through them. Generic tracker's own `localStorage` namespace
  (`budgetTracker_generic_*`); categories/dark-mode/privacy-blur stay on the
  shared, unprefixed keys since those are view preferences, not per-mode
  financial data. Deliberately simpler than severance mode: two-field income
  (`monthlyIncome`, `otherIncome`, no runway/severance math), a single "This
  Month" card instead of Current-Month-plus-Overall-Summary, a rolling
  12-month window from today instead of a fixed Sep 2025–Sep 2026 range,
  expense composition annualized ×12 instead of ×13. Reuses every shared
  component (StatCard, SectionCard, category system, CSV upload/export, both
  charts) unchanged. Verified by temporarily mounting it in `main.jsx`
  (reverted after): bundle check, full `npm run build`, live in the browser
  — dashboard math, category editing, the rolling month dropdown, and dark
  mode all confirmed correct — before reverting the mount back to
  `SeveranceBudgetTracker` (step 6 wires the real mode choice).
- **2026-09-05 — Step 6 done.** Built `ModePicker` (two cards: "Usual Budget" /
  "Severance / Career Transition") and `App.jsx`, the new top-level component
  `main.jsx` mounts — holds `mode` state, renders the picker when it's null,
  otherwise the matching tracker. Mode is persisted to `localStorage`
  (`budgetTracker_activeMode`), consistent with every other piece of state in
  this app, so returning visitors land straight back in their mode instead of
  re-picking every time. A "Switch mode" button was added to `AppHeader`
  (shown only when an `onSwitchMode` handler is passed in) that resets `mode`
  to `null` to get back to the picker. `SeveranceBudgetTracker`'s storage keys
  renamed to the `budgetTracker_severance_*` namespace (mirrored in
  `standalone.html`) — categories/dark-mode/privacy-blur stay on their shared,
  unprefixed keys as planned. No migration shim for pre-existing data under
  the old unprefixed keys — this project has no real deployed users yet, so
  that complexity isn't earned.
  Verified live: fresh load shows the picker; choosing a mode persists across
  a full page reload with no re-pick; "Switch mode" returns to the picker;
  both modes' `localStorage` namespaces coexist independently (checked
  severance's demo data was untouched after visiting generic mode). Full
  `npm run build` passes.
- **2026-09-09 — Step 7 done.** Added the period-backup/reset flow: a new
  "Download backup & start fresh" option in Export Data (both trackers, via
  a new shared `ExportDataSection`) downloads a CSV + JSON backup, then
  clears that mode's data only — undoable for a few seconds via the same
  snackbar pattern every delete in this app already uses. Since this clears
  data, it required an explicit confirm step first (global rule: "Always
  request confirmation before any action that deletes data or overrides
  existing data") — built a shared `ConfirmDialog` rather than a bare
  `window.confirm()`, matching design-principles.md's "every destructive
  action confirms first and is visually distinct" (red button, separated by
  a divider from the two safe download buttons).
  **Found and fixed a real bug while screenshotting it**: the confirm
  dialog's backdrop only covered its own card, not the page — `SectionCard`
  applies a Tailwind `translate-y` transform once scrolled into view, and
  any non-`none` `transform` on an ancestor becomes a containing block for
  `position: fixed` descendants. Fixed by rendering the dialog through a
  `createPortal` straight into `<body>`.
  Verified live: cancel leaves data untouched; confirming actually downloads
  real CSV/JSON files (checked the CSV's content) and clears the state;
  undo restores the exact pre-clear snapshot; tested in both trackers and in
  dark mode (inherited correctly from the existing global dark-mode CSS,
  no extra work needed). Full `npm run build` passes.
  **`standalone.html` was not updated for this step.** It was already left
  behind starting at step 5 — the mode-picker/generic-tracker architecture
  was never mirrored into it, since duplicating a growing new app structure
  into a single hand-synced file made no sense this close to deleting it
  (step 8). It still works as a severance-only tracker as of step 6's
  storage-key rename, just without steps 5–7's features.
- **2026-09-09 — Step 8 done.** Deleted `standalone.html` (checked first that
  nothing in `package.json`/`vite.config.js` referenced it — it was a fully
  standalone file, safe to remove). Rewrote `README.md` from scratch: it
  described a single-mode, two-entry-point app that no longer exists. New
  version covers the mode picker, both trackers, the current project
  structure (`App.jsx`, `src/components/`, `src/hooks/`, `src/lib/`), the
  namespaced-vs-shared `localStorage` key scheme, and the features added
  since the original artifact (categories, CSV import/export, start-fresh
  backup/reset, dark mode, privacy blur). No visual change to the running
  app — pure file deletion and documentation — so no before/after
  screenshots for this one, same reasoning as step 4. Verified `npm run
  build` still passes with `standalone.html` gone, and the app loads
  correctly (mode picker renders, both `h2`s present).
- **2026-09-09 — Step 9 done.** Committed. Before staging anything, scanned
  `git status` on the untracked items and found a real problem: the
  `Runway — Personal Finance_Categories/` folder (real subscription
  statements, PDFs) wasn't covered by any existing `.gitignore` rule —
  a broad `git add` would have pushed personal financial documents to a
  public repo. Added it to `.gitignore` before touching `git add`, then
  grepped the actual diffs for anything resembling a hardcoded secret
  (API keys, tokens, passwords) — none found. Staged everything explicitly
  by name (not `-A`) across three commits: the main feature commit (46
  files), the GitHub Pages workflow config, and a Node-version bump to
  clear a deprecation warning.
- **2026-09-09 — Step 10 done.** Created the public GitHub repo
  (`dNandaDias/severance-budget-tracker`), pushed, added a GitHub Actions
  workflow (`.github/workflows/deploy.yml`) that builds and deploys `dist/`
  to Pages on every push to `main`, and set the Vite `base` path for the
  project-page URL. Enabled Pages via the API (source: GitHub Actions).
  Watched both workflow runs to completion — both succeeded. Verified the
  live site directly: loads at the right URL, mode picker renders, clicking
  into severance mode shows the correct demo data end-to-end, no console
  errors beyond the pre-existing benign favicon 404. Added the live link
  to `README.md`.
  **Live at: https://dnandadias.github.io/severance-budget-tracker/**

## Confirmed sequencing

1. ~~**Finish dark mode**~~ — done, see progress log.
2. ~~**Replace hardcoded personal defaults**~~ — done, see progress log.
3. ~~**Add spending categories**~~ — done, see progress log.
4. ~~**Extract shared presentational pieces**~~ — done, see progress log.
5. ~~**Build the generic `BudgetTracker`**~~ — done, see progress log.
6. ~~**Build the landing/mode-picker screen**~~ — done, see progress log.
7. ~~**Add the period export/backup option**~~ — done, see progress log.
8. ~~**Delete `standalone.html`**; update `README.md`~~ — done, see progress log.
9. ~~**Commit.**~~ — done, see progress log.
10. ~~**Deploy to GitHub Pages**; add the live link to `README.md`~~ — done, see
    progress log. **All 10 steps complete.**

## Out of scope

- Any backend/server component — this stays a client-only, localStorage-based tool.
- Real investment/financial advice logic — this is a tracker, not an advisor.
