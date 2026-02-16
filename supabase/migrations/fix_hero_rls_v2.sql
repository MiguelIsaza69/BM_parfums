-- 1. Reset RLS on the table to ensure clean slate
alter table public.hero_slides disable row level security;
alter table public.hero_slides enable row level security;

-- 2. Drop ALL possible existing policies (including the one that caused error)
drop policy if exists "Hero slides are viewable by everyone." on public.hero_slides;
drop policy if exists "Only admins can insert hero slides." on public.hero_slides;
drop policy if exists "Only admins can update hero slides." on public.hero_slides;
drop policy if exists "Only admins can delete hero slides." on public.hero_slides;
drop policy if exists "Public Select" on public.hero_slides;
drop policy if exists "Authenticated Insert" on public.hero_slides;
drop policy if exists "Authenticated Delete" on public.hero_slides;
drop policy if exists "Admin Insert" on public.hero_slides;
drop policy if exists "Admin Delete" on public.hero_slides;

-- 3. Create simplified policies
create policy "Public Select"
  on public.hero_slides for select
  using (true);

create policy "Authenticated Insert"
  on public.hero_slides for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Delete"
  on public.hero_slides for delete
  using (auth.role() = 'authenticated');
