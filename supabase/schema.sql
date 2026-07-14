-- Everafter — wedding planner schema. ADDITIVE to the shared (Tandem) Supabase
-- project. Run in Dashboard → SQL Editor. Safe to re-run (drop-and-recreate
-- policies only — no DROP TABLE / DELETE / TRUNCATE; existing rows never touched).
-- Relies on project-level public.profiles (owned by tandem/supabase/schema.sql)
-- and on sign-ups being disabled, so "authenticated" = one of the two of us.

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.wedding_vendors (
  id                uuid primary key default gen_random_uuid(),
  type              text not null check (type in ('venue','photographer','videographer','celebrant','caterer','florist','band_dj','cake','hair_makeup','transport','stationery','other')),
  name              text not null,
  status            text not null default 'idea' check (status in ('idea','contacted','quoted','visited','booked','rejected')),
  contact_name      text not null default '',
  phone             text not null default '',
  email             text not null default '',
  website           text not null default '',
  quote_amount      numeric(12,2),
  available_on_date text not null default 'unknown' check (available_on_date in ('yes','no','unknown')),
  capacity          integer,
  rating            integer check (rating between 1 and 5),
  location          text not null default '',
  pros              text not null default '',
  cons              text not null default '',
  links             jsonb not null default '[]',
  notes             text not null default '',
  created_at        timestamptz not null default now()
);

create table if not exists public.wedding_settings (
  id              integer primary key check (id = 1),
  wedding_date    date,
  total_budget    numeric(12,2),
  venue_vendor_id uuid references public.wedding_vendors (id) on delete set null,
  partner_a       text not null default 'Partner A',
  partner_b       text not null default 'Partner B'
);

create table if not exists public.wedding_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (length(trim(title)) > 0),
  notes         text not null default '',
  months_out    numeric,                -- null for user tasks pinned to an explicit date
  due_date      date,                   -- computed from wedding_date − months_out unless due_override
  due_override  boolean not null default false,
  assignee      text not null default 'both' check (assignee in ('a','b','both')),
  status        text not null default 'todo' check (status in ('todo','in_progress','done','skipped')),
  from_template boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.wedding_budget_items (
  id        uuid primary key default gen_random_uuid(),
  category  text not null check (category in ('venue','catering_drinks','attire_beauty','photography_video','flowers_styling','music_entertainment','rings','stationery','transport','celebrant_ceremony','honeymoon','other')),
  name      text not null,
  estimated numeric(12,2),
  quoted    numeric(12,2),
  actual    numeric(12,2),
  vendor_id uuid references public.wedding_vendors (id) on delete set null
);

create table if not exists public.wedding_payments (
  id             uuid primary key default gen_random_uuid(),
  budget_item_id uuid not null references public.wedding_budget_items (id) on delete cascade,
  label          text not null default 'deposit',
  amount         numeric(12,2) not null,
  due_date       date,
  paid           boolean not null default false,
  paid_at        timestamptz
);

create table if not exists public.wedding_tables (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  capacity   integer not null default 10,
  sort_order integer not null default 0
);

create table if not exists public.wedding_guests (
  id             uuid primary key default gen_random_uuid(),
  household      text not null default '',
  name           text not null,
  side           text not null default 'both' check (side in ('a','b','both')),
  grp            text not null default 'friends' check (grp in ('family','friends','work','other')),
  invite_status  text not null default 'to_invite' check (invite_status in ('to_invite','invited','rsvp_yes','rsvp_no')),
  meal_choice    text not null default '',
  dietary        text not null default '',
  is_plus_one    boolean not null default false,
  is_child       boolean not null default false,
  address        text not null default '',
  thank_you_sent boolean not null default false,
  table_id       uuid references public.wedding_tables (id) on delete set null
);

create table if not exists public.wedding_ideas (
  id         uuid primary key default gen_random_uuid(),
  area       text not null default 'other' check (area in ('dress','suits','theme_colours','flowers','hair','cake','decor','music','other')),
  title      text not null default '',
  url        text not null default '',
  image_path text not null default '',
  notes      text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.wedding_key_dates (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  date              date not null,
  time              text not null default '',
  location          text not null default '',
  related_vendor_id uuid references public.wedding_vendors (id) on delete set null,
  notes             text not null default ''
);

create table if not exists public.wedding_day_events (
  id         uuid primary key default gen_random_uuid(),
  time       text not null default '',
  title      text not null,
  who        text not null default '',
  vendor_id  uuid references public.wedding_vendors (id) on delete set null,
  notes      text not null default '',
  sort_order integer not null default 0
);

create index if not exists wedding_tasks_due_idx     on public.wedding_tasks (due_date);
create index if not exists wedding_guests_table_idx  on public.wedding_guests (table_id);
create index if not exists wedding_payments_item_idx on public.wedding_payments (budget_item_id);

-- ── Settings singleton ───────────────────────────────────────────────────────

insert into public.wedding_settings (id) values (1) on conflict (id) do nothing;

-- ── RLS: every table shared read+write for authenticated ─────────────────────

do $$
declare t text;
begin
  foreach t in array array['wedding_settings','wedding_tasks','wedding_budget_items','wedding_payments','wedding_vendors','wedding_guests','wedding_tables','wedding_ideas','wedding_key_dates','wedding_day_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s: read all (authenticated)" on public.%I', t, t);
    execute format('create policy "%s: read all (authenticated)" on public.%I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists "%s: write all (authenticated)" on public.%I', t, t);
    execute format('create policy "%s: write all (authenticated)" on public.%I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ── Realtime on the interactive tables ───────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['wedding_tasks','wedding_guests','wedding_budget_items','wedding_payments','wedding_vendors','wedding_settings'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ── Storage: wedding-ideas bucket ────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('wedding-ideas', 'wedding-ideas', false)
on conflict (id) do nothing;

drop policy if exists "wedding-ideas: read (authenticated)" on storage.objects;
create policy "wedding-ideas: read (authenticated)" on storage.objects
  for select to authenticated using (bucket_id = 'wedding-ideas');

drop policy if exists "wedding-ideas: insert (authenticated)" on storage.objects;
create policy "wedding-ideas: insert (authenticated)" on storage.objects
  for insert to authenticated with check (bucket_id = 'wedding-ideas');

drop policy if exists "wedding-ideas: delete (authenticated)" on storage.objects;
create policy "wedding-ideas: delete (authenticated)" on storage.objects
  for delete to authenticated using (bucket_id = 'wedding-ideas');

-- ── Checklist template seed (AU-adjusted, 90 tasks) ──────────────────────────
-- Fires only on a fresh install: skipped entirely if any template task exists.

insert into public.wedding_tasks (title, months_out, assignee, from_template, sort_order)
select v.title, v.months_out, v.assignee, true, v.sort_order
from (values
  -- 12+ months out
  ('Celebrate + tell family and friends',                          12,    'both', 10),
  ('Set the overall budget',                                       12,    'both', 20),
  ('Draft rough guest list + numbers',                             12,    'both', 30),
  ('Choose a season / shortlist dates',                            12,    'both', 40),
  ('Research + shortlist venues',                                  12,    'both', 50),
  ('Start the ideas board (theme + colours)',                      12,    'both', 60),
  ('Decide the wedding party',                                     12,    'both', 70),
  ('Engagement party — decide + plan',                             12,    'both', 80),
  ('Research wedding insurance',                                   12,    'a',    90),
  ('Set up a wedding email folder for quotes',                     12,    'a',    100),
  -- 9 months out
  ('Visit shortlisted venues',                                     9,     'both', 110),
  ('Book the venue + lock in the date',                            9,     'both', 120),
  ('Book an authorised celebrant (AU)',                            9,     'both', 130),
  ('Check NOIM window — can lodge up to 18 months out',            9,     'both', 140),
  ('Book photographer',                                            9,     'both', 150),
  ('Decide on videographer + book',                                9,     'both', 160),
  ('Ask the wedding party',                                        9,     'both', 170),
  ('Book band / DJ',                                               9,     'both', 180),
  ('Research caterers (if venue needs one)',                       9,     'both', 190),
  ('Start dress research',                                         9,     'a',    200),
  ('Start suit research',                                          9,     'b',    210),
  ('Set up gift registry / honeymoon fund',                        9,     'both', 220),
  -- 6 months out
  ('Order the dress',                                              6,     'a',    230),
  ('Choose suits for partner + groomsmen',                         6,     'b',    240),
  ('Finalise caterer / venue package',                             6,     'both', 250),
  ('Book florist',                                                 6,     'both', 260),
  ('Book cake maker + tastings',                                   6,     'both', 270),
  ('Design + order invitations',                                   6,     'both', 280),
  ('Send save-the-dates',                                          6,     'both', 290),
  ('Plan honeymoon (destination + book leave)',                    6,     'both', 300),
  ('Book hair & makeup artist',                                    6,     'a',    310),
  ('Book wedding transport',                                       6,     'both', 320),
  ('Draft ceremony music + reception playlist',                    6,     'both', 330),
  ('Book wedding-night accommodation',                             6,     'both', 340),
  ('Order bridesmaid dresses',                                     6,     'a',    350),
  ('Check passports valid for honeymoon',                          6,     'both', 360),
  -- 3 months out
  ('Send invitations (RSVP date ~5 weeks out)',                    3,     'both', 370),
  ('Buy wedding rings',                                            3,     'both', 380),
  ('Menu tasting + finalise menu',                                 3,     'both', 390),
  ('First dress fitting',                                          3,     'a',    400),
  ('Confirm groomsmen attire ordered',                             3,     'b',    410),
  ('Start writing vows',                                           3,     'both', 420),
  ('Plan rehearsal + rehearsal dinner',                            3,     'both', 430),
  ('Confirm honeymoon bookings + travel insurance',                3,     'both', 440),
  ('Buy wedding party gifts',                                      3,     'both', 450),
  ('Hens/bucks — delegate planning',                               3,     'both', 460),
  ('Finalise ceremony details with celebrant (readings, vows)',    3,     'both', 470),
  ('Order decorations + signage',                                  3,     'both', 480),
  ('Research marriage certificate application (post-wedding)',     3,     'both', 490),
  -- 1 month out
  ('NOIM deadline — must be lodged with celebrant at least 1 month before the ceremony (AU legal requirement)', 1, 'both', 500),
  ('Chase outstanding RSVPs',                                      1,     'both', 510),
  ('Hair & makeup trial',                                          1,     'a',    520),
  ('Final dress fitting',                                          1,     'a',    530),
  ('Check every vendor''s final payment schedule',                 1,     'both', 540),
  ('Finalise vows',                                                1,     'both', 550),
  ('Draft seating chart',                                          1,     'both', 560),
  ('Confirm run sheet draft with venue',                           1,     'both', 570),
  ('Break in wedding shoes',                                       1,     'a',    580),
  ('Organise guest book + card box',                               1,     'both', 590),
  ('Confirm transport timings',                                    1,     'both', 600),
  ('Order place cards + day-of stationery',                        1,     'both', 610),
  -- 2 weeks out
  ('Final headcount to caterer/venue',                             0.5,   'both', 620),
  ('Finalise seating chart',                                       0.5,   'both', 630),
  ('Confirm morning hair/makeup schedule',                         0.5,   'a',    640),
  ('Collect dress',                                                0.5,   'a',    650),
  ('Collect suits',                                                0.5,   'b',    660),
  ('Confirm florist delivery times',                               0.5,   'both', 670),
  ('Prepare vendor payment/tip envelopes',                         0.5,   'both', 680),
  ('Print run sheets for wedding party',                           0.5,   'both', 690),
  -- 1 week out
  ('Confirm all vendors (final call-around)',                      0.25,  'both', 700),
  ('Pack for honeymoon',                                           0.25,  'both', 710),
  ('Give run sheet + contact list to wedding party',               0.25,  'both', 720),
  ('Collect rings + check fit',                                    0.25,  'both', 730),
  ('Prepare day-of emergency kit',                                 0.25,  'a',    740),
  ('Steam/press all attire',                                       0.25,  'b',    750),
  ('Delegate day-of jobs (gifts, suit returns)',                   0.25,  'both', 760),
  ('Final venue walkthrough',                                      0.25,  'both', 770),
  -- Wedding week
  ('Rehearsal + rehearsal dinner',                                 0,     'both', 780),
  ('Give rings to best man',                                       0,     'b',    790),
  ('Lay out attire + accessories',                                 0,     'both', 800),
  ('Early night — hydrate + eat well',                             0,     'both', 810),
  ('Get married — enjoy every second',                             0,     'both', 820),
  -- Week after
  ('Confirm celebrant lodged the marriage documents',              -0.25, 'both', 830),
  ('Apply for the official marriage certificate (BDM)',            -0.25, 'a',    840),
  ('Return hired suits/items',                                     -0.25, 'b',    850),
  ('Send thank-you notes',                                         -0.25, 'both', 860),
  ('Dress cleaning/preservation',                                  -0.25, 'a',    870),
  ('Leave vendor reviews',                                         -0.25, 'both', 880),
  ('Sort + share photos when delivered',                           -0.25, 'both', 890),
  ('Start name-change paperwork (if changing)',                    -0.25, 'both', 900)
) as v(title, months_out, assignee, sort_order)
where not exists (select 1 from public.wedding_tasks where from_template);
