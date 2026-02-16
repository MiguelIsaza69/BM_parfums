-- 1. Reset RLS on the table
alter table public.hero_slides disable row level security;
alter table public.hero_slides enable row level security;

-- 2. Drop all existing complex policies for this table
drop policy if exists "Hero slides are viewable by everyone." on public.hero_slides;
drop policy if exists "Only admins can insert hero slides." on public.hero_slides;
drop policy if exists "Only admins can update hero slides." on public.hero_slides;
drop policy if exists "Only admins can delete hero slides." on public.hero_slides;

-- 3. Create simplified policies (No joins to profiles table to avoid locks)
create policy "Public Select"
on public.hero_slides for select
using (true);

create policy "Authenticated Insert"
on public.hero_slides for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated Delete"
on public.hero_slides for delete
using (auth.role() = 'authenticated');
