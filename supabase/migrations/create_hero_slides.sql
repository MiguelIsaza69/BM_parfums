-- HERO SLIDES TABLE
create table if not exists public.hero_slides (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- RLS for hero_slides
alter table public.hero_slides enable row level security;

create policy "Hero slides are viewable by everyone." on public.hero_slides
  for select using (true);

create policy "Only admins can insert hero slides." on public.hero_slides
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Only admins can update hero slides." on public.hero_slides
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Only admins can delete hero slides." on public.hero_slides
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
