# Midnight Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Everafter's Ivory Editorial visual layer with the "Midnight Glass" design (dark charcoal-navy gradient, frosted glass cards, champagne-gold accents, Lora serif, floating pill nav) across all 17 screens, without touching data, domain logic, or the Supabase schema.

**Architecture:** This is a token + markup-class refactor, not a rebuild. Almost every screen already renders through a shared set of CSS classes (`.card`, `.row`, `.pill`, `.chip`, `.stat`, `.segmented`, `.hub-grid`, `.sheet`, `.btn`, `.tabbar`...) defined in `src/styles/theme.css`. Rewriting that one file re-skins the majority of the app automatically. A small number of screens/components need actual JSX changes (icon swaps, a new checkbox control, a new confirmation-sheet pattern) — those are enumerated explicitly below. The full source mockup (every screen's real HTML/CSS, as designed) lives at `docs/design/midnight-glass/source.html` — search it for `id="2a"` through `id="2o"` (screen-by-screen) or `id="1c"` (Home/Guests/Plan hub, the direction that was chosen). `docs/design/midnight-glass/build-plan.md` is the original design brief.

**Tech Stack:** React 19 + Vite + TypeScript, plain CSS (no framework), `lucide-react` (new dependency, for line icons), `@fontsource/lora` (new dependency, self-hosted serif font, replaces `@fontsource/cormorant-garamond`).

**Decisions locked in (do not re-litigate):**
- Icons: `lucide-react`, not hand-drawn SVGs.
- Vendor photo upload: **out of scope** — Vendors keeps no image field this pass (Ideas already has one via `image_path`/`ideaImageUrl`, untouched).
- Confirmation sheets: **in scope** — build one `ConfirmSheet` component, wire it to sign-out and all 10 delete actions (the app currently deletes instantly with no confirmation at all).
- Theme: Midnight Glass becomes the **only** theme. No toggle, no dual token sets. Ivory Editorial is fully replaced.

---

## File Structure

| File | Change |
|---|---|
| `package.json` | Add `lucide-react`, `@fontsource/lora`; drop `@fontsource/cormorant-garamond` |
| `src/main.tsx` | Swap font imports |
| `src/styles/theme.css` | Full rewrite: new tokens, glass primitives, floating tab bar, fixed background blobs, reduced-motion/transparency fallback |
| `vite.config.ts`, `index.html` | `theme_color`/`background_color`/meta `theme-color` → `#15161e` |
| `src/components/Layout.tsx` | Floating glass tab bar, lucide icons |
| `src/components/SubscreenHeader.tsx` | Glass back-pill with `ChevronLeft` icon |
| `src/components/ConfirmSheet.tsx` | **New.** Reusable glass confirmation sheet |
| `src/screens/Settings.tsx` | Sign-out routes through `ConfirmSheet` |
| `src/components/TaskSheet.tsx`, `VendorSheet.tsx`, `HouseholdSheet.tsx`, `BudgetItemSheet.tsx`, `IdeaSheet.tsx`, `PartySheet.tsx`, `EngagementSheet.tsx`, `GiftSheet.tsx`, `SongSheet.tsx`, `HoneymoonSheet.tsx` | Delete button routes through `ConfirmSheet` |
| `src/screens/Home.tsx` | Gear icon → `Settings` icon; due-soon row icon → colored status dot |
| `src/screens/Checklist.tsx` | Native `<input type=checkbox>` → custom glass check-square |
| `src/screens/Login.tsx` | Rings emoji → small hand-drawn ring SVG |
| `src/screens/Guests.tsx` | Drop `✓`/`✗` text prefixes on the yes/no buttons |
| `src/screens/Plan.tsx` | Tile icons → `lucide-react`; list-links (`Key dates`/`Run sheet`/`Exports`/`Settings`) lose their icons entirely (mockup renders them as plain rows) |

Every other screen (`Budget`, `Vendors`, `Ideas`, `Party`, `Engagement`, `Gifts`, `Music`, `Honeymoon`, `KeyDates`, `RunSheet`, `Exports`, and their subcomponents `SeatingTab`, `VendorCompare`, `KeyDatesSection`, `RunSheetSection`) needs **no JSX changes** — they inherit the new look purely from the `theme.css` rewrite. Task 13 is a full visual pass to confirm this holds and catch any gaps.

---

## Task 1: Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install lucide-react and @fontsource/lora, remove cormorant-garamond**

Run:
```bash
npm install lucide-react @fontsource/lora
npm uninstall @fontsource/cormorant-garamond
```

- [ ] **Step 2: Verify install**

Run: `npm ls lucide-react @fontsource/lora`
Expected: both listed with resolved versions, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react + fontsource lora for Midnight Glass redesign"
```

---

## Task 2: Font import swap

**Files:**
- Modify: `src/main.tsx:5-7`

- [ ] **Step 1: Replace the font imports**

Current (`src/main.tsx:5-7`):
```ts
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
```

Replace with:
```ts
import '@fontsource/lora/500.css'
import '@fontsource/lora/600.css'
import '@fontsource/lora/500-italic.css'
```

- [ ] **Step 2: Run dev server, confirm no import error**

Run: `npm run dev`
Expected: Vite starts clean, no "failed to resolve import" error. Stop the server after confirming.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "chore: swap Cormorant Garamond for Lora"
```

---

## Task 3: `theme.css` — Midnight Glass token rewrite

**Files:**
- Modify: `src/styles/theme.css` (full replacement)

This is the single highest-leverage task in the plan — it re-skins ~12 of the 17 screens with zero further work. Reuse every existing class name and structure (`.card`, `.row`, `.pill`, `.chip`, `.stat`, `.segmented`, `.hub-grid`, `.idea-grid`, `.sheet`, `.btn`, `.field`, `.banner`, `.bar`, `.countdown`, `.compare`, `.tabbar`, `.subscreen-header`/`.back-link`) so no screen markup needs to change to pick up the new look. Colors/blur/radius are taken directly from `docs/design/midnight-glass/source.html` (verified against every screen anchor `#2a`–`#2o` and the `#1c` Home/Guests/Plan renders).

- [ ] **Step 1: Replace the full contents of `src/styles/theme.css`**

```css
/* Everafter — Midnight Glass: deep charcoal-navy, frosted glass, champagne gold.
   Every component styles itself with these variables/classes only. */

:root {
  --bg-start: #15161e;
  --bg-mid: #1c1e2a;
  --bg-end: #211f2a;

  --text: #f2efe9;
  --text-dim: rgba(242, 239, 233, 0.6);
  --text-faint: rgba(242, 239, 233, 0.5);
  --text-ghost: rgba(242, 239, 233, 0.3);

  --gold: #d4b06a;
  --gold-tint: #e8cf9c;
  --rose: #a95a72;
  --green: #9fd494;
  --green-strong: #7d9b76;
  --red: #e0a394;
  --red-strong: #d98f7d;
  --ink: #1c1a12;

  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-bg-soft: rgba(255, 255, 255, 0.07);
  --glass-bg-strong: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-soft: rgba(255, 255, 255, 0.14);
  --glass-blur: blur(24px) saturate(140%);
  --glass-blur-soft: blur(18px) saturate(140%);

  --serif: 'Lora', Georgia, 'Times New Roman', serif;
  --radius-card: 26px;
  --radius-tile: 22px;
  --radius-pill: 9999px;
  --shadow-card: 0 10px 26px rgba(0, 0, 0, 0.35);
  --shadow-tabbar: 0 12px 30px rgba(0, 0, 0, 0.5);
  --tabbar-h: calc(64px + env(safe-area-inset-bottom));

  color-scheme: dark;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-start);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#root { min-height: 100dvh; position: relative; }

/* ── Fixed background: gradient + soft blurred blobs ──────────────────────
   One global layer instead of per-screen blobs — same visual effect
   (frosted cards read against colour, per the brief), far less markup. */
body::before,
body::after {
  content: '';
  position: fixed;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: var(--radius-pill);
  filter: blur(40px);
  pointer-events: none;
}
body {
  background: linear-gradient(165deg, var(--bg-start) 0%, var(--bg-mid) 55%, var(--bg-end) 100%) fixed;
}
body::before {
  top: -70px;
  right: -60px;
  background: radial-gradient(circle, var(--gold), transparent 70%);
  opacity: 0.26;
}
body::after {
  bottom: -60px;
  left: -70px;
  width: 230px;
  height: 230px;
  background: radial-gradient(circle, var(--rose), transparent 70%);
  opacity: 0.26;
}

@media (prefers-reduced-transparency: reduce) {
  body::before, body::after { display: none; }
}

/* ── Layout ─────────────────────────────────────────────────────────────── */

.screen {
  padding: 58px 16px calc(var(--tabbar-h) + 16px);
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}

.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.screen-title {
  font-family: var(--serif);
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.wordmark {
  font-family: var(--serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.03em;
  color: var(--text);
}

.rule-ornament {
  width: 36px;
  height: 1px;
  background: var(--gold);
  border: none;
  margin: 8px auto;
}

.gear {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
  border: 1px solid var(--glass-border-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  text-decoration: none;
  flex-shrink: 0;
}

.subscreen-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.subscreen-header .screen-title { flex: 1; font-size: 1.35rem; }

.back-link {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-soft);
  color: var(--gold);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex-shrink: 0;
}

.tabbar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(14px + env(safe-area-inset-bottom));
  height: 64px;
  border-radius: var(--radius-pill);
  background: rgba(20, 20, 28, 0.55);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid var(--glass-border-soft);
  box-shadow: var(--shadow-tabbar), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  max-width: 528px;
  margin: 0 auto;
  z-index: 40;
}

.tabbar a {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-faint);
  font-size: 9px;
  font-weight: 700;
}

.tabbar a .tab-icon { display: flex; }
.tabbar a.active { color: var(--gold); }

/* ── Cards & lists ──────────────────────────────────────────────────────── */

.card, .card--tap {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 16px 18px;
  margin-bottom: 14px;
  box-shadow: var(--shadow-card);
}

.card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gold);
  margin: 0 0 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.row:last-child { border-bottom: none; }
.row .grow { flex: 1; min-width: 0; }
.row-title { font-size: 14.5px; font-weight: 600; color: var(--text); }
.row-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 2px; }
.row.done .row-title { text-decoration: line-through; color: var(--text-faint); }
.row.dim { opacity: 0.55; }

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 18px 0 8px;
}
.section-header h2 {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0;
  color: var(--gold);
}
.section-header .count { font-size: 11.5px; color: var(--text-faint); }

/* ── Chips, pills, badges ───────────────────────────────────────────────── */

.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 8px;
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar { display: none; }

.chip {
  flex: 0 0 auto;
  border: 1px solid var(--glass-border-soft);
  background: var(--glass-bg-soft);
  color: var(--text-dim);
  border-radius: var(--radius-pill);
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.chip.active {
  background: rgba(242, 239, 233, 0.9);
  border-color: transparent;
  color: var(--ink);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-dim);
  border: none;
  cursor: pointer;
}
.pill.blush { color: #e3b6c4; background: rgba(169, 90, 114, 0.2); }
.pill.gold  { color: var(--gold);      background: rgba(212, 176, 106, 0.12); }
.pill.amber { color: var(--gold-tint); background: rgba(212, 176, 106, 0.16); }
.pill.green { color: var(--green);     background: rgba(141, 191, 133, 0.16); }
.pill.red   { color: var(--red);       background: rgba(217, 143, 125, 0.16); }

.badge {
  display: inline-block;
  font-size: 10.5px;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px 7px;
  margin-right: 4px;
}

/* ── Buttons & forms ────────────────────────────────────────────────────── */

.btn {
  border: 1px solid var(--glass-border-soft);
  border-radius: var(--radius-pill);
  padding: 13px 18px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  background: var(--glass-bg-strong);
  color: var(--text);
}
.btn.primary {
  background: linear-gradient(120deg, var(--gold), var(--gold-tint));
  border: none;
  color: var(--ink);
  box-shadow: 0 10px 24px rgba(212, 176, 106, 0.3);
}
.btn.danger {
  color: var(--red);
  border-color: rgba(217, 143, 125, 0.3);
  background: rgba(217, 143, 125, 0.1);
}
.btn.small { padding: 8px 14px; font-size: 12.5px; }
.btn.block { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: default; }

.fab {
  position: fixed;
  right: 18px;
  bottom: calc(var(--tabbar-h) + 20px);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(120deg, var(--gold), var(--gold-tint));
  color: var(--ink);
  font-size: 1.7rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(212, 176, 106, 0.35);
  z-index: 30;
}

.field { margin-bottom: 12px; }
.field label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  margin-bottom: 6px;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border-soft);
  border-radius: 14px;
  color: var(--text);
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
}
.field input::placeholder, .field textarea::placeholder { color: var(--text-ghost); }
.field input:focus, .field select:focus, .field textarea:focus {
  outline: none;
  border-color: var(--gold);
}
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
.field-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 10px; }

.checkbox-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  color: var(--text);
}
.checkbox-line input { width: 18px; height: 18px; accent-color: var(--gold); }

/* ── Bottom sheet ───────────────────────────────────────────────────────── */

.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 14, 0.55);
  backdrop-filter: blur(2px);
  z-index: 50;
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 88dvh;
  overflow-y: auto;
  background: linear-gradient(165deg, var(--bg-mid) 0%, var(--bg-end) 100%);
  border-radius: 26px 26px 0 0;
  border-top: 1px solid var(--glass-border-soft);
  padding: 20px 18px calc(20px + env(safe-area-inset-bottom));
  z-index: 51;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.5);
}
.sheet h3 { margin: 0 0 14px; font-family: var(--serif); font-size: 1.3rem; font-weight: 600; color: var(--text); }
.sheet-actions { display: flex; gap: 8px; margin-top: 14px; }
.sheet-actions .btn { flex: 1; }

/* Small centered confirmation sheet (ConfirmSheet component) */
.confirm-sheet {
  max-width: 400px;
  border-radius: 26px;
  text-align: center;
  padding: 28px 22px calc(22px + env(safe-area-inset-bottom));
}
.confirm-sheet p { font-size: 13.5px; color: var(--text-dim); margin: 8px 0 0; line-height: 1.5; }

/* ── Progress / stats ───────────────────────────────────────────────────── */

.bar {
  height: 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  overflow: hidden;
  display: flex;
}
.bar .seg-paid { background: var(--green-strong); height: 100%; }
.bar .seg-committed { background: linear-gradient(90deg, var(--gold), var(--gold-tint)); height: 100%; }
.bar.over .seg-committed { background: var(--red); }

.stat-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.stat {
  flex: 1;
  min-width: 64px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 12px 4px;
  text-align: center;
}
.stat .num { font-family: var(--serif); font-size: 1.3rem; font-weight: 600; color: var(--text); }
.stat .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-faint); margin-top: 2px; }

.countdown {
  text-align: center;
  padding: 26px 18px;
  border-radius: 30px;
  box-shadow: var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.countdown .kicker {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--gold);
}
.countdown .days { font-family: var(--serif); font-size: 3.4rem; font-weight: 600; line-height: 1.1; color: var(--text); }
.countdown .tagline { font-family: var(--serif); font-style: italic; font-size: 15px; color: var(--gold); }
.countdown .sub { color: var(--text-dim); margin-top: 6px; font-size: 12px; }

.segmented {
  display: flex;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  padding: 4px;
  margin-bottom: 12px;
}
.segmented button {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-weight: 700;
  font-size: 13px;
  padding: 9px;
  border-radius: var(--radius-pill);
  cursor: pointer;
}
.segmented button.active { background: rgba(212, 176, 106, 0.85); color: var(--ink); }

.banner {
  border-radius: 18px;
  padding: 11px 16px;
  font-size: 13px;
  margin-bottom: 12px;
  border: 1px solid rgba(212, 176, 106, 0.3);
  color: var(--gold-tint);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
}
.banner.red { border-color: rgba(217, 143, 125, 0.3); color: var(--red); }

.empty {
  text-align: center;
  color: var(--text-faint);
  font-size: 13.5px;
  padding: 28px 12px;
}

.text-dim { color: var(--text-dim); }
.text-red { color: var(--red); }
.text-green { color: var(--green); }
.text-gold { color: var(--gold); }

/* ── Plan hub ───────────────────────────────────────────────────────────── */

.hub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.hub-tile {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-tile);
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  color: var(--text);
  display: block;
}
.hub-tile .ic { display: flex; justify-content: center; color: var(--gold); }
.hub-tile .nm { font-weight: 700; font-size: 13px; margin-top: 6px; color: var(--text); }
.hub-tile .ct { font-size: 11px; color: var(--text-faint); margin-top: 2px; }

/* ── Login ──────────────────────────────────────────────────────────────── */

.login {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  gap: 16px;
}
.login .rings {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login .fleuron { color: var(--gold); font-size: 13.5px; }
.login form { width: 100%; max-width: 300px; margin-top: 10px; display: flex; flex-direction: column; gap: 12px; }
.login .error { color: var(--red); font-size: 13px; margin-top: 8px; text-align: center; }

/* ── Compare table ──────────────────────────────────────────────────────── */

.compare-scroll { overflow-x: auto; }
.compare {
  border-collapse: collapse;
  min-width: 100%;
  font-size: 13px;
}
.compare th, .compare td {
  border: 1px solid var(--glass-border);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
  min-width: 130px;
  color: var(--text);
}
.compare th:first-child, .compare td:first-child {
  position: sticky;
  left: 0;
  background: var(--bg-mid);
  min-width: 92px;
  color: var(--text-faint);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Ideas grid ─────────────────────────────────────────────────────────── */

.idea-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.idea-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-soft);
  -webkit-backdrop-filter: var(--glass-blur-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-tile);
  overflow: hidden;
  cursor: pointer;
}
.idea-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.idea-card .idea-body { padding: 10px; }
.idea-card .idea-title { font-size: 13px; font-weight: 700; color: var(--text); }

/* ── Reduced motion ─────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

/* ── Print: any .print-view (run sheet, exports) — stays light, not glass ── */

@media print {
  body { background: #fff; color: #000; }
  body::before, body::after { display: none; }
  body * { visibility: hidden; }
  .print-view, .print-view * { visibility: visible; }
  .print-view {
    position: absolute;
    inset: 0;
    padding: 24px;
    background: #fff;
    color: #000;
    border: none;
    box-shadow: none;
  }
  .print-view .row { border-color: #ccc; }
  .print-view .row-sub { color: #444; }
  .print-view .btn, .print-view [data-noprint] { display: none !important; }
  .tabbar, .fab { display: none; }
}
```

- [ ] **Step 2: Run dev server, sanity-check Home renders dark/glass**

Run: `npm run dev`, open the printed local URL in a browser.
Expected: page background is the dark charcoal-navy gradient, `.card` elements are frosted/translucent, gold accents visible. (Icons will still be emoji/misplaced until later tasks — that's expected.) Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/styles/theme.css
git commit -m "feat: rewrite theme.css to Midnight Glass tokens"
```

---

## Task 4: PWA theme color

**Files:**
- Modify: `vite.config.ts:16-17`, `index.html:8`

- [ ] **Step 1: Update the three color references**

In `vite.config.ts`, change:
```ts
        theme_color: '#171420',
        background_color: '#171420',
```
to:
```ts
        theme_color: '#15161e',
        background_color: '#15161e',
```

In `index.html`, change:
```html
    <meta name="theme-color" content="#171420" />
```
to:
```html
    <meta name="theme-color" content="#15161e" />
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts index.html
git commit -m "chore: match PWA theme color to Midnight Glass background"
```

---

## Task 5: Layout.tsx — floating glass tab bar + line icons

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import { NavLink, Outlet } from 'react-router-dom'
import { Home as HomeIcon, ListChecks, DollarSign, Users, LayoutGrid } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/checklist', label: 'Checklist', Icon: ListChecks },
  { to: '/budget', label: 'Budget', Icon: DollarSign },
  { to: '/guests', label: 'Guests', Icon: Users },
  { to: '/plan', label: 'Plan', Icon: LayoutGrid },
]

export default function Layout() {
  return (
    <>
      <Outlet />
      <nav className="tabbar">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            <span className="tab-icon">
              <Icon size={16} strokeWidth={2.25} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Run dev server, verify tab bar**

Run: `npm run dev`, open the app.
Expected: tab bar floats above the bottom edge (inset from left/right/bottom), pill-shaped, frosted; active tab shows gold icon+label; icons are line icons, not emoji.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: floating glass tab bar with line icons"
```

---

## Task 6: SubscreenHeader.tsx — glass back-pill

**Files:**
- Modify: `src/components/SubscreenHeader.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function SubscreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="subscreen-header">
      <Link to="/plan" className="back-link" aria-label="Back to Plan">
        <ChevronLeft size={18} strokeWidth={2.5} />
      </Link>
      <h1 className="screen-title">{title}</h1>
      {action}
    </header>
  )
}
```

- [ ] **Step 2: Run dev server, open any Plan subscreen (e.g. /vendors)**

Expected: back button is a glass circle with a gold chevron, title is Lora serif.

- [ ] **Step 3: Commit**

```bash
git add src/components/SubscreenHeader.tsx
git commit -m "feat: glass back-pill for subscreen headers"
```

---

## Task 7: Home.tsx — gear icon + due-soon status dots

**Files:**
- Modify: `src/screens/Home.tsx`

The mockup's "Due soon" list (`docs/design/midnight-glass/source.html`, anchor `#1c`, the `Due soon` card) has no per-row icon — each row is a small colored dot (gold normally, red/blush if overdue) followed by title/date. Drop the `KIND_META` icon field entirely and render a dot instead.

- [ ] **Step 1: Update imports and remove `KIND_META` icons**

Replace:
```ts
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../data/DataProvider'
import { rollup } from '../domain/budgetMath'
import { dueSoonFeed } from '../domain/dueSoon'
import { rsvpTally } from '../domain/guestRollups'
```
with:
```ts
import { Link, useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { useData } from '../data/DataProvider'
import { rollup } from '../domain/budgetMath'
import { dueSoonFeed } from '../domain/dueSoon'
import { rsvpTally } from '../domain/guestRollups'
```

Replace:
```ts
const KIND_META = {
  task: { icon: '✅', to: '/checklist' },
  payment: { icon: '💰', to: '/budget' },
  key_date: { icon: '📅', to: '/key-dates' },
} as const
```
with:
```ts
const KIND_META = {
  task: { to: '/checklist' },
  payment: { to: '/budget' },
  key_date: { to: '/key-dates' },
} as const
```

- [ ] **Step 2: Replace the gear link**

Replace:
```tsx
        <Link to="/settings" className="gear" aria-label="Settings">
          ⚙️
        </Link>
```
with:
```tsx
        <Link to="/settings" className="gear" aria-label="Settings">
          <SettingsIcon size={16} strokeWidth={2.25} />
        </Link>
```

- [ ] **Step 3: Replace the due-soon row icon with a status dot**

Replace:
```tsx
            <button
              key={`${entry.kind}-${entry.id}`}
              className="row"
              style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              onClick={() => navigate(KIND_META[entry.kind].to)}
            >
              <span>{KIND_META[entry.kind].icon}</span>
              <div className="grow">
```
with:
```tsx
            <button
              key={`${entry.kind}-${entry.id}`}
              className="row"
              style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}
              onClick={() => navigate(KIND_META[entry.kind].to)}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  flexShrink: 0,
                  background: entry.overdue ? 'var(--red-strong)' : 'var(--gold)',
                }}
              />
              <div className="grow">
```

- [ ] **Step 4: Run dev server, open Home**

Expected: gear icon is a line icon in a glass circle; due-soon rows show a small dot (gold, or salmon if overdue) instead of an emoji.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Home.tsx
git commit -m "feat: restyle Home gear icon and due-soon rows for Midnight Glass"
```

---

## Task 8: Checklist.tsx — custom glass checkbox

**Files:**
- Modify: `src/screens/Checklist.tsx:134-159` (the `TaskRow` component)

The mockup renders task completion as a custom 19×19px rounded-square: filled gold with a check glyph when done, an outlined ring when not — not a native `<input type=checkbox>` (native checkboxes can't be restyled to match cross-browser). Replace it with a `<button>`.

- [ ] **Step 1: Add the `Check` import**

At the top of `src/screens/Checklist.tsx`, change:
```ts
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
```
to:
```ts
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
```

- [ ] **Step 2: Replace the `TaskRow` checkbox markup**

Replace (`src/screens/Checklist.tsx:134-159`):
```tsx
function TaskRow({ task, onToggle, onOpen }: { task: WeddingTask; onToggle: () => void; onOpen: () => void }) {
  const { settings } = useData()
  const initials = { a: settings.partner_a[0] ?? 'A', b: settings.partner_b[0] ?? 'B', both: 'Both' }
  const done = task.status === 'done'
  return (
    <div className={`row${done ? ' done' : ''}${task.status === 'skipped' ? ' dim' : ''}`}>
      <input
        type="checkbox"
        checked={done}
        onChange={onToggle}
        style={{ width: 20, height: 20, accentColor: 'var(--blush-deep)' }}
        aria-label={`Mark ${task.title} ${done ? 'not done' : 'done'}`}
      />
      <button className="grow" onClick={onOpen} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div className="row-title">{task.title}</div>
        <div className="row-sub">
          {task.due_date ? shortDate(task.due_date) : 'No date'}
          {task.status === 'in_progress' && ' · in progress'}
          {task.status === 'skipped' && ' · skipped'}
          {task.due_override && ' · 📌'}
        </div>
      </button>
      <span className={`pill ${task.assignee === 'both' ? 'gold' : 'blush'}`}>{initials[task.assignee]}</span>
    </div>
  )
}
```
with:
```tsx
function TaskRow({ task, onToggle, onOpen }: { task: WeddingTask; onToggle: () => void; onOpen: () => void }) {
  const { settings } = useData()
  const initials = { a: settings.partner_a[0] ?? 'A', b: settings.partner_b[0] ?? 'B', both: 'Both' }
  const done = task.status === 'done'
  return (
    <div className={`row${done ? ' done' : ''}${task.status === 'skipped' ? ' dim' : ''}`}>
      <button
        onClick={onToggle}
        aria-label={`Mark ${task.title} ${done ? 'not done' : 'done'}`}
        style={{
          all: 'unset',
          width: 19,
          height: 19,
          borderRadius: 6,
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'var(--gold)' : 'transparent',
          border: done ? 'none' : '1.5px solid rgba(242,239,233,.3)',
        }}
      >
        {done && <Check size={11} strokeWidth={2.5} color="var(--ink)" />}
      </button>
      <button className="grow" onClick={onOpen} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div className="row-title">{task.title}</div>
        <div className="row-sub">
          {task.due_date ? shortDate(task.due_date) : 'No date'}
          {task.status === 'in_progress' && ' · in progress'}
          {task.status === 'skipped' && ' · skipped'}
          {task.due_override && ' · pinned'}
        </div>
      </button>
      <span className={`pill ${task.assignee === 'both' ? 'gold' : 'blush'}`}>{initials[task.assignee]}</span>
    </div>
  )
}
```

(Note: this also fixes a pre-existing dead CSS variable reference — `var(--blush-deep)` was never defined in `theme.css`.)

- [ ] **Step 3: Run dev server, open Checklist**

Expected: incomplete tasks show an outlined rounded-square; toggling a task fills it gold with a check mark; clicking still toggles correctly.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Checklist.tsx
git commit -m "feat: custom glass checkbox for Checklist tasks"
```

---

## Task 9: Login.tsx — rings icon

**Files:**
- Modify: `src/screens/Login.tsx`

- [ ] **Step 1: Read the current file to find the rings markup**

Run: view `src/screens/Login.tsx` and locate the `<div className="rings">💍</div>` line (near the top of the JSX, inside the loading/pre-auth `<main className="login">` block — this same block also appears in `src/App.tsx`'s `Shell()` loading state).

- [ ] **Step 2: Replace the emoji with a hand-drawn two-ring SVG**

Replace:
```tsx
<div className="rings">💍</div>
```
with:
```tsx
<div className="rings">
  <svg width="26" height="26" viewBox="0 0 26 26">
    <circle cx="9" cy="13" r="7" fill="none" stroke="var(--gold)" strokeWidth="2" />
    <circle cx="17" cy="13" r="7" fill="none" stroke="var(--gold)" strokeWidth="2" />
  </svg>
</div>
```

Do the same for the identical `<div className="rings">💍</div>` in `src/App.tsx`'s `Shell()` loading state (`src/App.tsx:32`).

- [ ] **Step 3: Run dev server, view /login (sign out first if needed) and the initial loading screen**

Expected: a glass circle containing two gold overlapping ring outlines, matching the mockup's sign-in screen (`source.html` anchor `#2a`).

- [ ] **Step 4: Commit**

```bash
git add src/screens/Login.tsx src/App.tsx
git commit -m "feat: replace rings emoji with line-art icon on login/loading"
```

---

## Task 10: Guests.tsx — drop yes/no glyph prefixes

**Files:**
- Modify: `src/screens/Guests.tsx:155-163`

The mockup's RSVP pills show plain "Yes"/"No" text, no glyph prefix.

- [ ] **Step 1: Replace the yes/no buttons**

Replace (`src/screens/Guests.tsx:155-163`):
```tsx
                  {rsvpFor === g.id && g.invite_status === 'invited' ? (
                    <span className="row" style={{ border: 0, padding: 0, gap: 4 }}>
                      <button className="pill green" onClick={() => setRsvp(g, 'rsvp_yes')}>
                        ✓ Yes
                      </button>
                      <button className="pill red" onClick={() => setRsvp(g, 'rsvp_no')}>
                        ✗ No
                      </button>
                    </span>
```
with:
```tsx
                  {rsvpFor === g.id && g.invite_status === 'invited' ? (
                    <span className="row" style={{ border: 0, padding: 0, gap: 4 }}>
                      <button className="pill green" onClick={() => setRsvp(g, 'rsvp_yes')}>
                        Yes
                      </button>
                      <button className="pill red" onClick={() => setRsvp(g, 'rsvp_no')}>
                        No
                      </button>
                    </span>
```

- [ ] **Step 2: Run dev server, open Guests, tap an "Invited" pill**

Expected: the yes/no mini row shows plain "Yes"/"No" pills.

- [ ] **Step 3: Commit**

```bash
git add src/screens/Guests.tsx
git commit -m "style: drop glyph prefixes from Guests RSVP buttons"
```

---

## Task 11: Plan.tsx — tile icons + list-link icons dropped

**Files:**
- Modify: `src/screens/Plan.tsx`

The mockup's Plan hub (`source.html` anchor `#1c`, the "Plan" render) uses line icons for the 7 grid tiles, and renders `Key dates`/`Run sheet`/`Exports & prints`/`Settings` as plain text rows with a chevron — no icon.

- [ ] **Step 1: Replace the file contents**

```tsx
import { Link } from 'react-router-dom'
import { Handshake, Lightbulb, Shirt, Wine, Gift, Music2, Palmtree } from 'lucide-react'
import { useData } from '../data/DataProvider'
import { engagementLine, giftsLine, honeymoonLine, ideasLine, musicLine, partyLine, vendorsLine } from '../domain/planCounts'

const LIST_LINKS = [
  { to: '/key-dates', label: 'Key dates' },
  { to: '/run-sheet', label: 'Run sheet' },
  { to: '/exports', label: 'Exports & prints' },
  { to: '/settings', label: 'Settings' },
]

export default function Plan() {
  const { vendors, ideas, partyMembers, gifts, songs, honeymoonItems, engagementItems } = useData()

  const tiles = [
    { to: '/vendors', Icon: Handshake, label: 'Vendors', line: vendorsLine(vendors) },
    { to: '/ideas', Icon: Lightbulb, label: 'Ideas', line: ideasLine(ideas) },
    { to: '/party', Icon: Shirt, label: 'Wedding party', line: partyLine(partyMembers) },
    { to: '/engagement', Icon: Wine, label: 'Engagement party', line: engagementLine(engagementItems) },
    { to: '/gifts', Icon: Gift, label: 'Gifts', line: giftsLine(gifts) },
    { to: '/music', Icon: Music2, label: 'Music', line: musicLine(songs) },
    { to: '/honeymoon', Icon: Palmtree, label: 'Honeymoon', line: honeymoonLine(honeymoonItems) },
  ]

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Plan</h1>
      </header>

      <div className="hub-grid">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="hub-tile">
            <div className="ic">
              <t.Icon size={20} strokeWidth={1.8} />
            </div>
            <div className="nm">{t.label}</div>
            <div className="ct">{t.line}</div>
          </Link>
        ))}
      </div>

      <section className="card" style={{ padding: '4px 18px' }}>
        {LIST_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="grow row-title">{l.label}</span>
            <span className="text-gold">›</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Run dev server, open /plan**

Expected: 7 tiles with gold line icons in a 2-column grid; the list card below shows 4 plain text rows with a `›` chevron, no icons.

- [ ] **Step 3: Commit**

```bash
git add src/screens/Plan.tsx
git commit -m "feat: line icons for Plan hub tiles, drop list-link icons"
```

---

## Task 12: `ConfirmSheet` component

**Files:**
- Create: `src/components/ConfirmSheet.tsx`

A small reusable glass confirmation sheet — title, one line of consequence copy, Cancel/Confirm. Used for sign-out and every delete action.

- [ ] **Step 1: Create the component**

```tsx
interface Props {
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmSheet({ title, message, confirmLabel = 'Delete', busy = false, onCancel, onConfirm }: Props) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onCancel} />
      <div className="sheet confirm-sheet">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="sheet-actions">
          <button className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify it type-checks in isolation**

Run: `npm run typecheck`
Expected: no errors mentioning `ConfirmSheet.tsx` (it isn't imported anywhere yet, so this just confirms the file itself is valid TypeScript).

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfirmSheet.tsx
git commit -m "feat: add reusable ConfirmSheet component"
```

---

## Task 13: Wire `ConfirmSheet` to sign-out

**Files:**
- Modify: `src/screens/Settings.tsx`

- [ ] **Step 1: Add the import and confirm-open state**

Change:
```tsx
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import SubscreenHeader from '../components/SubscreenHeader'
```
to:
```tsx
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import ConfirmSheet from '../components/ConfirmSheet'
import SubscreenHeader from '../components/SubscreenHeader'
```

Add, alongside the other `useState` calls near the top of `Settings()`:
```ts
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
```

- [ ] **Step 2: Route the sign-out button through the confirmation**

Replace:
```tsx
      <button className="btn danger block" onClick={() => void signOut()}>
        Sign out
      </button>
```
with:
```tsx
      <button className="btn danger block" onClick={() => setConfirmingSignOut(true)}>
        Sign out
      </button>

      {confirmingSignOut && (
        <ConfirmSheet
          title="Sign out?"
          message="You'll need to sign back in to see your wedding plan."
          confirmLabel="Sign out"
          onCancel={() => setConfirmingSignOut(false)}
          onConfirm={() => void signOut()}
        />
      )}
```

- [ ] **Step 3: Run dev server, open Settings, click Sign out**

Expected: a confirm sheet appears instead of signing out immediately; Cancel dismisses it; the sign-out button in the sheet actually signs out.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Settings.tsx
git commit -m "feat: confirm before signing out"
```

---

## Task 14: Wire `ConfirmSheet` to all 10 delete sheets

**Files:**
- Modify: `src/components/TaskSheet.tsx`, `VendorSheet.tsx`, `HouseholdSheet.tsx`, `BudgetItemSheet.tsx`, `IdeaSheet.tsx`, `PartySheet.tsx`, `EngagementSheet.tsx`, `GiftSheet.tsx`, `SongSheet.tsx`, `HoneymoonSheet.tsx`

Every one of these sheets follows the same shape (confirmed in `TaskSheet.tsx`): a `del` (or similarly-named) async function that calls `remove(...)`, wired to a `<button className="btn danger" onClick={() => void del()}>Delete</button>`. Apply the same mechanical change to each: add confirm-open state, gate the actual delete behind it, render `ConfirmSheet` conditionally.

- [ ] **Step 1: `TaskSheet.tsx` — full worked example**

Add the import:
```ts
import { useState } from 'react'
import ConfirmSheet from './ConfirmSheet'
import { useData } from '../data/DataProvider'
```

Add state alongside the other `useState` calls:
```ts
  const [confirmingDelete, setConfirmingDelete] = useState(false)
```

Replace the delete button:
```tsx
          {task && (
            <button className="btn danger" onClick={() => void del()} disabled={saving}>
              Delete
            </button>
          )}
```
with:
```tsx
          {task && (
            <button className="btn danger" onClick={() => setConfirmingDelete(true)} disabled={saving}>
              Delete
            </button>
          )}
```

Add, just before the sheet's closing `</>`  (after the outer `<div className="sheet">...</div>` block, still inside the top-level fragment):
```tsx
      {confirmingDelete && (
        <ConfirmSheet
          title="Delete this task?"
          message="This can't be undone."
          busy={saving}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
```

- [ ] **Step 2: Verify `TaskSheet.tsx` in the browser**

Run: `npm run dev`, open Checklist, open an existing task, click Delete.
Expected: a confirm sheet stacks over the task sheet; Cancel returns to the task sheet; confirming deletes the task and closes both.

- [ ] **Step 3: Apply the identical pattern to the remaining 9 sheets**

For each of `VendorSheet.tsx`, `HouseholdSheet.tsx`, `BudgetItemSheet.tsx`, `IdeaSheet.tsx`, `PartySheet.tsx`, `EngagementSheet.tsx`, `GiftSheet.tsx`, `SongSheet.tsx`, `HoneymoonSheet.tsx`:
1. Open the file and find its delete handler (may be named `del`, `handleDelete`, `remove`, etc. — check what it calls internally, it will call the sheet's own delete function) and its `<button className="btn danger" ...>Delete</button>`.
2. Add `import ConfirmSheet from './ConfirmSheet'` and a `const [confirmingDelete, setConfirmingDelete] = useState(false)`.
3. Change the Delete button's `onClick` to `() => setConfirmingDelete(true)`.
4. Render, in the same place as Step 1 above, a `ConfirmSheet` with a title naming what's being deleted (e.g. `"Delete this vendor?"`, `"Delete this guest?"`, `"Delete this gift?"`), `message="This can't be undone."`, wired to that file's own delete function and `saving`/`busy` state variable (match whatever the file already calls its saving flag).

Each file's delete function name and saving-flag name may differ slightly from `TaskSheet.tsx` — use what's actually in the file, don't assume.

- [ ] **Step 4: Run dev server, exercise delete on each of the 9 remaining sheets**

For each: open the relevant screen, open an existing item's sheet, click Delete, confirm a `ConfirmSheet` appears, Cancel works, and confirming actually deletes.
Expected: all 9 behave like `TaskSheet` did in Step 2.

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: all existing tests still pass (these are UI-only changes; no domain logic touched).

- [ ] **Step 6: Commit**

```bash
git add src/components/VendorSheet.tsx src/components/HouseholdSheet.tsx src/components/BudgetItemSheet.tsx src/components/IdeaSheet.tsx src/components/PartySheet.tsx src/components/EngagementSheet.tsx src/components/GiftSheet.tsx src/components/SongSheet.tsx src/components/HoneymoonSheet.tsx
git commit -m "feat: confirm before deleting vendors, guests, budget items, ideas, party members, engagement items, gifts, songs, honeymoon items"
```

(`TaskSheet.tsx` was already committed in Step 2's prerequisite — if it wasn't yet, include it here too.)

---

## Task 15: Full visual pass — remaining screens

**Files:**
- Verify (no changes expected unless a gap is found): `src/screens/Budget.tsx`, `Vendors.tsx`, `Ideas.tsx`, `Party.tsx`, `Engagement.tsx`, `Gifts.tsx`, `Music.tsx`, `Honeymoon.tsx`, `KeyDates.tsx`, `RunSheet.tsx`, `Exports.tsx`, and `src/components/SeatingTab.tsx`, `VendorCompare.tsx`, `KeyDatesSection.tsx`, `RunSheetSection.tsx`

These screens should already look correct after Task 3 (`theme.css`) with zero code changes, since they use only the shared classes. This task is the check, not an assumed no-op.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Walk every route and compare against its mockup anchor**

For each screen below, open it in the browser and open the matching anchor in `docs/design/midnight-glass/source.html` side by side (or just re-read that section of the file). Confirm cards are frosted glass, text/pill colors match, radii are fully rounded, layout matches:

| Route | Mockup anchor |
|---|---|
| `/` | `#1c` (first render in that direction block) |
| `/checklist` | `#2b` |
| `/budget` | `#2c` |
| `/guests` (Guests tab) | `#1c` (second render, has the 4-stat row) |
| `/guests` (Seating tab) | `#2d` |
| `/plan` | `#1c` (third render) |
| `/vendors` | `#2e` |
| `/ideas` | `#2f` |
| `/party` | `#2g` |
| `/engagement` | `#2h` |
| `/gifts` | `#2i` |
| `/music` | `#2j` |
| `/honeymoon` | `#2k` |
| `/key-dates` | `#2l` |
| `/run-sheet` | `#2m` |
| `/exports` | `#2n` |
| `/settings` | `#2o` |

- [ ] **Step 3: Fix any gap found**

If a screen doesn't match (e.g. a class name that exists in the mockup but isn't in the new `theme.css`, or a hardcoded old color in an inline `style={}`), fix it directly in that screen's `.tsx` file or add the missing rule to `theme.css`. Search for any remaining hardcoded hex colors from the old Ivory Editorial palette first:

Run: `grep -rn "#faf6ef\|#2b2620\|#a8833f\|#c9a95e\|#c96f8c\|#f4eee2\|#e7dfd2" src/`
Expected: no matches (all old-theme hex colors should now only exist, if at all, inside the `@media print` block of `theme.css`, which intentionally stays light).

- [ ] **Step 4: Verify `/exports/dietary`, `/exports/guests`, `/exports/seating`, `/exports/music` (the print-only views) still render light/high-contrast**

Open each route. Expected: white background, black text — these are unaffected by the dark theme (per the design brief, print views stay light for paper).

- [ ] **Step 5: Commit (only if fixes were needed in Step 3)**

```bash
git add -A
git commit -m "fix: close visual gaps found in full Midnight Glass screen pass"
```

If no gaps were found, skip this commit — nothing to add.

---

## Task 16: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npm run test`
Expected: all tests pass (domain logic is untouched by this plan).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: builds successfully with no errors.

- [ ] **Step 4: Manual smoke test of the destructive-action flows**

With `npm run dev` running: confirm sign-out requires confirmation (Task 13), and delete a throwaway test item in at least 2 of the 10 sheets end-to-end (create a scratch item, delete it, confirm it's gone) to catch any sheet where Task 14's mechanical edit was applied incorrectly.

- [ ] **Step 5: Commit any final fixes, then stop — do not merge or push**

Per this repo's workflow, leave the branch ready for review; merging/pushing is a separate, explicit step the user takes via the `finishing-a-development-branch` skill.

---

## Self-review notes (for whoever executes this plan)

- **Spec coverage:** Phase 0 (tokens) → Task 3. Phase 1 (shell + 5 core screens) → Tasks 5, 6, 7, 8, 10, plus Task 15 covers Budget/Guests-seating verification. Phase 2 (Plan hub + 11 subscreens) → Task 11 (Plan) + Task 15 (the rest). Phase 3 (sheets + confirm) → Tasks 12–14; print views verified in Task 15 Step 4. Phase 4 (polish/QA) → reduced-motion and reduced-transparency fallbacks are in Task 3's CSS directly; contrast was designed in against the mockup's own values (already WCAG-considered by the source design); cross-device `backdrop-filter` cost isn't testable in this environment — flag to the user if they want a real-device check.
- **Vendor image upload:** intentionally excluded per the scoping decision at the top of this plan — do not add it.
- **Theme toggle:** intentionally excluded — Midnight Glass fully replaces Ivory Editorial, no dual-theme code.
