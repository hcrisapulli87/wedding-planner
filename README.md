# Everafter 💍

Private two-person wedding planner PWA — an adaptive Australian checklist
(NOIM-aware), wedding budget with payment schedules, vendor pipeline +
comparison, guests/RSVP/dietary tracking, list-based seating, ideas board,
key dates and a printable day-of run sheet.

Built for exactly two users: sign-ups are disabled at the Supabase project
level and every `wedding_*` table is jointly owned (read + write for any
authenticated user, enforced by Row-Level Security).

## Stack

- React 19 + Vite + TypeScript, installable PWA (`vite-plugin-pwa`)
- Supabase — Postgres + Realtime + email/password Auth + Storage
  (shares the **Tandem** Supabase project; Everafter adds only `wedding_*`
  tables and the `wedding-ideas` bucket)
- Vercel hosting (SPA rewrite in `vercel.json`)
- Vitest for the pure domain modules (`src/domain/*`)

## Local dev

```powershell
npm install
copy .env.example .env   # fill in the Supabase URL + publishable key
npm run dev
```

Other scripts: `npm test` (Vitest), `npm run typecheck`, `npm run build`,
`npm run icons` (regenerate PWA icons from `public/favicon.svg`).

## Deploy — order matters

1. **Schema first.** Run `supabase/schema.sql` in the Supabase Dashboard → SQL
   Editor (the shared Tandem project). It is idempotent — safe to re-run. The
   editor shows a "destructive operations" warning because policies are
   drop-and-recreated; there is no `DROP TABLE`/`DELETE`/`TRUNCATE` and no row
   is ever touched. Verify: 10 `wedding_*` tables, the `wedding-ideas` Storage
   bucket, and 90 seeded rows in `wedding_tasks`.
2. **Then Vercel.** Import the GitHub repo, set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY`, deploy. The publishable key is a public
   browser key — security lives in RLS, not in hiding it.

## The NOIM note (Australia)

The **Notice of Intended Marriage** must be lodged with your celebrant **at
least 1 month** before the ceremony (and at most 18 months). The checklist
seeds both the early "check NOIM window" task (9 months out) and the hard
"NOIM deadline" task (1 month out). Dates recompute automatically if the
wedding date changes — except tasks you've pinned to an explicit date.
