-- Create categories table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Enable RLS for categories
alter table public.categories enable row level security;

-- Create products table
-- name, category, brand, image (editable, up to 5), description, price (COP), volume (ml), quality (enum)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  description text,
  price numeric not null default 0, -- Storing as numeric for currency
  volume_ml integer, -- Storing as integer (e.g., 100 for 100ml)
  quality text check (quality in ('Inspiración', '1.1', 'Original')) not null default 'Inspiración',
  images text[] default array[]::text[], -- Array of image URLs
  created_at timestamp with time zone default now()
);

-- Enable RLS for products
alter table public.products enable row level security;

-- Policies for Categories
create policy "Public Select Categories" on public.categories for select using (true);
create policy "Authenticated Insert Categories" on public.categories for insert with check (auth.role() = 'authenticated');
create policy "Authenticated Update Categories" on public.categories for update using (auth.role() = 'authenticated');
create policy "Authenticated Delete Categories" on public.categories for delete using (auth.role() = 'authenticated');

-- Policies for Products
create policy "Public Select Products" on public.products for select using (true);
create policy "Authenticated Insert Products" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Authenticated Update Products" on public.products for update using (auth.role() = 'authenticated');
create policy "Authenticated Delete Products" on public.products for delete using (auth.role() = 'authenticated');

-- Insert default categories
insert into public.categories (name) values 
('Perfumes para Hombre'), 
('Perfumes para Mujer'), 
('Unisex')
on conflict (name) do nothing;
