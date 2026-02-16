-- Definitive Fix: Reset ALL policies to allow full CRUD
alter table public.hero_slides disable row level security;
alter table public.hero_slides enable row level security;

-- Drop ALL existing policies to avoid conflicts
drop policy if exists "Public Select" on public.hero_slides;
drop policy if exists "Authenticated Insert" on public.hero_slides;
drop policy if exists "Authenticated Update" on public.hero_slides;
drop policy if exists "Authenticated Delete" on public.hero_slides;
drop policy if exists "Hero slides are viewable by everyone." on public.hero_slides;
drop policy if exists "Only admins can insert hero slides." on public.hero_slides;

-- Create FULL set of policies
create policy "Public Select"
  on public.hero_slides for select
  using (true);

create policy "Authenticated Insert"
  on public.hero_slides for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Update"
  on public.hero_slides for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated Delete"
  on public.hero_slides for delete
  using (auth.role() = 'authenticated');
