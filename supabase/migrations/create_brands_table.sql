-- Create brands table
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.brands enable row level security;

-- Policies
create policy "Public Select Brands"
  on public.brands for select
  using (true);

create policy "Authenticated Insert Brands"
  on public.brands for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Update Brands"
  on public.brands for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated Delete Brands"
  on public.brands for delete
  using (auth.role() = 'authenticated');
