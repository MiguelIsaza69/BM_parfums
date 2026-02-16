-- DANGER: This will delete all existing data in hero_slides
-- But it's necessary to fix the broken RLS state
drop table if exists public.hero_slides cascade;

create table public.hero_slides (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  created_at timestamp with time zone default now()
);

alter table public.hero_slides enable row level security;

create policy "Public Select"
  on public.hero_slides for select
  using (true);

create policy "Authenticated Insert"
  on public.hero_slides for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Delete"
  on public.hero_slides for delete
  using (auth.role() = 'authenticated');
