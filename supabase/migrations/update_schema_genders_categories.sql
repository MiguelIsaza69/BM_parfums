-- 1. Create Genders table
create table if not exists public.genders (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Enable RLS for genders
alter table public.genders enable row level security;

-- Policies for Genders
create policy "Public Select Genders" on public.genders for select using (true);
create policy "Authenticated Insert Genders" on public.genders for insert with check (auth.role() = 'authenticated');
create policy "Authenticated Update Genders" on public.genders for update using (auth.role() = 'authenticated');
create policy "Authenticated Delete Genders" on public.genders for delete using (auth.role() = 'authenticated');

-- Insert default genders
insert into public.genders (name) values 
('Para Hombre'), 
('Para Mujer'), 
('Unisex')
on conflict (name) do nothing;

-- 2. Update Categories table
-- Clear existing categories (assuming we want to replace them completely as per user request to change meaning)
truncate table public.categories cascade;

-- Insert new categories
insert into public.categories (name) values 
('Arabe'), 
('De nicho'), 
('Diseñador'), 
('Cítricos'), 
('Dulces'), 
('Frescos'), 
('Tropicales'), 
('Florales'), 
('Amaderados')
on conflict (name) do nothing;

-- 3. Modify Products table
-- Add gender_id
alter table public.products add column if not exists gender_id uuid references public.genders(id) on delete set null;

-- Remove old category_id relationship and add array for multiple categories
alter table public.products drop column if exists category_id;
alter table public.products add column if not exists category_ids uuid[] default array[]::uuid[];

-- Update RLS if needed (existing policies cover the table, so generic update/insert works)
