-- BrandOn Studio: database setup. Paste this whole file into Supabase > SQL Editor and press Run.

-- One table holds everything: people, projects, tasks, announcements, events.
create table if not exists public.docs (
  col        text        not null,
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

-- Live updates need the full old row on deletes and updates.
alter table public.docs replica identity full;

-- Only the signed-in studio account can read or write. The public cannot.
alter table public.docs enable row level security;
drop policy if exists "studio read"   on public.docs;
drop policy if exists "studio insert" on public.docs;
drop policy if exists "studio update" on public.docs;
drop policy if exists "studio delete" on public.docs;
create policy "studio read"   on public.docs for select to authenticated using (true);
create policy "studio insert" on public.docs for insert to authenticated with check (true);
create policy "studio update" on public.docs for update to authenticated using (true) with check (true);
create policy "studio delete" on public.docs for delete to authenticated using (true);

-- Turn on live sync for the table.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- The team. Change names here or later in Team settings.
insert into public.docs (col, id, data) values
  ('people','nomin',    '{"name":"Nomin","role":"exec","color":"#141414","finance":true}'),
  ('people','suvdaa',   '{"name":"Suvdaa","role":"pm","color":"#DA1F34","finance":true}'),
  ('people','reka',     '{"name":"Reka","role":"pm","color":"#B5532A"}'),
  ('people','tulgaa',   '{"name":"Tulgaa","role":"designer","color":"#2F5DA8","finance":true}'),
  ('people','khongoroo','{"name":"Khongoroo","role":"designer","color":"#7A4FB0"}'),
  ('people','jerry',    '{"name":"Jerry","role":"video","color":"#1F7A5A"}'),
  ('people','tumku',    '{"name":"Tumku","role":"video","color":"#8A6D00"}')
on conflict (col, id) do nothing;

-- ================= Finance =================
-- Money lives in its own table. Only the separate finance login can read or write it.
-- The studio login (that everyone uses) cannot see a single row, even with developer tools.
-- If you use another email for the finance login, change it in the four policies below.
create table if not exists public.finance (
  col        text        not null,
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
alter table public.finance replica identity full;
alter table public.finance enable row level security;
drop policy if exists "finance read"   on public.finance;
drop policy if exists "finance insert" on public.finance;
drop policy if exists "finance update" on public.finance;
drop policy if exists "finance delete" on public.finance;
create policy "finance read"   on public.finance for select to authenticated using ((auth.jwt()->>'email') = 'finance@brand-on.mn');
create policy "finance insert" on public.finance for insert to authenticated with check ((auth.jwt()->>'email') = 'finance@brand-on.mn');
create policy "finance update" on public.finance for update to authenticated using ((auth.jwt()->>'email') = 'finance@brand-on.mn') with check ((auth.jwt()->>'email') = 'finance@brand-on.mn');
create policy "finance delete" on public.finance for delete to authenticated using ((auth.jwt()->>'email') = 'finance@brand-on.mn');
do $$ begin
  alter publication supabase_realtime add table public.finance;
exception when duplicate_object then null; end $$;

-- People who see the Finance section (they still need the finance code to open it).
update public.docs set data = data || '{"finance":true}'::jsonb where col='people' and id in ('suvdaa','tulgaa','nomin');
insert into public.docs (col, id, data) values ('people','nomin','{"name":"Nomin","role":"exec","color":"#141414","finance":true}') on conflict (col, id) do nothing;
