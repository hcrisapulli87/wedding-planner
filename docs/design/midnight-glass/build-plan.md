# Everafter — Midnight Glass redesign

Design/build plan for direction 1c (Midnight Glass), covering all 17 screens explored in `EverAfter Redesign.dc.html`. Target: ship this as the app's new visual layer on top of the existing React/Vite/Supabase codebase without touching data or domain logic.

## 1. What's changing (and what isn't)

This is a **visual system replacement**, not a rebuild. Every screen keeps its existing routes, data hooks (`useData()`), domain logic (`src/domain/*`), and Supabase schema exactly as-is. Only `src/styles/theme.css` and each screen/component's markup+classnames change to the new tokens and glass treatment.

| Unaffected | Rebuilt |
|---|---|
| Data layer, Supabase schema, domain math (budget/RSVP/seating rollups), routing, auth | theme.css tokens, all card/pill/button/tabbar/nav visual treatment, dark mode as default |

## 2. Design tokens

**Colour**
- `#15161e` / `#1c1e2a` / `#211f2a` — background gradient
- `#d4b06a` gold, `#e8cf9c` gold-tint
- `#9fd494` confirmed, `#e0a394` overdue/declined
- `#f2efe9` text

Glass surface: `background: rgba(255,255,255,.06)`, `backdrop-filter: blur(24px) saturate(140%)`, `border: 1px solid rgba(255,255,255,.12)`, `border-radius: 26px`. Background blobs (radial-gradient circles, `blur(40px)`, opacity ~.26–.55) sit behind cards to make the blur legible — every screen keeps 1–2.

**Type**: Lora (serif) for wordmark, screen titles, the countdown number, stat figures — Inter/-apple-system for everything else (body copy, labels, buttons). No more than 2 weights per screen.

**Shape**: no sharp corners anywhere, per brief — cards `26px`, tiles `22px`, pills/tab bar/buttons `9999px`, small icon chips `10–16px`.

**Navigation chrome**: floating pill tab bar (`64px` tall, inset 16px from edges, glass), replacing the current edge-to-edge bar. Subscreens (anything under Plan) get a glass back-pill + Lora title instead of the current text-link back button, and keep the same floating tab bar with Plan highlighted.

## 3. Screen inventory (17)

| Screen | Route | Notes |
|---|---|---|
| Sign in | /login | No tab bar (pre-auth) |
| Home | / | Countdown, due soon, budget health, RSVPs |
| Checklist | /checklist | Bucketed by months-out, per-person filter chips |
| Budget | /budget | Overall bar + category drilldown |
| Guests | /guests | Segmented Guests/Seating, household groups |
| Seating | /guests (tab) | Unseated chips + table cards |
| Plan (hub) | /plan | 2-col tile grid + list links |
| Vendors | /vendors | Pipeline sections, compare CTA |
| Ideas | /ideas | 2-col image grid, placeholder art |
| Wedding party | /party | Grouped by role, outfit-status pill |
| Engagement party | /engagement | Banner total + filter chips |
| Gifts | /gifts | 3-stat row + thank-you filter |
| Music | /music | 3-way segmented control |
| Honeymoon | /honeymoon | Itinerary / packing segments |
| Key dates | /key-dates | Date-tile list, wedding day emphasized |
| Run sheet | /run-sheet | Time-stamped timeline, also a print view |
| Exports & prints | /exports | Simple icon+sub link list |
| Settings | /settings | Wedding date/budget/partner fields, sign out |

**Not yet designed:** the ~10 bottom sheets (Task, Vendor, Guest/Household, Budget item, Idea, Party member, Engagement item, Gift, Song, Honeymoon item) and the 4 print-only export views (dietary, guest list, seating chart, music list). These reuse the same glass-sheet and form-field tokens but need their own pass — flagged as Phase 3 below.

## 4. Build plan

**Phase 0 · ~1 day — Token foundation**
Rewrite `theme.css` variables to the Midnight Glass palette; add the reusable glass-card, glass-pill, and floating-tabbar classes; swap body background to the dark gradient; import Lora alongside the existing sans stack. No screen changes yet — app should still run, just visually broken until screens adopt the new classes.

**Phase 1 · ~2–3 days — Shell + tab destinations**
Rebuild `Layout.tsx`'s tab bar as the floating glass pill. Then Home, Checklist, Budget, Guests (incl. Seating tab) — the 5 screens users see most, and where the countdown hero, due-soon list, budget bars, and RSVP/guest pills establish every reusable pattern the rest of the app leans on.

**Phase 2 · ~2–3 days — Plan hub + its 11 subscreens**
Plan hub tiles, then Vendors, Ideas, Wedding party, Engagement, Gifts, Music, Honeymoon, Key dates, Run sheet, Exports, Settings. Build the shared `SubscreenHeader` glass back-pill once, reuse everywhere. Ideas needs real photography or user-supplied images to replace the placeholder grid.

**Phase 3 · ~2 days — Sheets & print views**
Restyle the ~10 bottom sheets (form fields, segmented pickers, save/cancel actions) to the glass-sheet token set, and the 4 print-only export pages (these intentionally stay light/high-contrast for paper, not dark glass). Add one reusable glass confirmation sheet (title, consequence copy, Cancel/Confirm) and wire it to sign-out and every delete action app-wide.

**Phase 4 · ~1–2 days — Polish & QA**
Contrast pass on gold/blush text over the dark gradient (target WCAG AA for body text), reduced-motion / reduced-transparency fallback (flatten glass to solid dark cards when `prefers-reduced-transparency: reduce`), empty-state and loading-state styling, cross-device check on older iPhones where `backdrop-filter` is more expensive.

## 5. Technical considerations

- **Performance:** layered `backdrop-filter: blur()` on many stacked cards can be costly on older devices — cap concurrent blurred layers per screen (kept to ≤6) and test on an A12-class device before sign-off.
- **Contrast:** gold-on-dark and blush-on-dark pass visually but need a real contrast audit once real photos/backgrounds sit behind the blobs.
- **Light mode:** the app currently has no light/dark toggle — decide whether Midnight Glass becomes the only mode or an option alongside the existing Ivory Editorial theme.
- **No schema/API changes** — this plan is purely `src/styles` + component markup/className work across `src/screens` and `src/components`.

## 6. Decisions

- **Icons:** move fully to the line-icon set (drop emoji everywhere, including the tab bar and Plan tiles).
- **Imagery:** real photography for Ideas / vendor cards, with the couple able to upload their own to replace it per-item.
- **Destructive actions:** add a glass confirmation sheet (not the native `confirm()`) for sign-out and any delete action (guests, vendors, budget items, tasks, etc.).
- **Uploads:** ideas/vendor image upload needs storage — reuse the Supabase storage bucket pattern already in place for the app's other assets.
