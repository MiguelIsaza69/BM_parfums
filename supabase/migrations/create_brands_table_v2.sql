-- Create brands table
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text, -- Optional, in case we want logos later
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.brands enable row level security;

-- Policies (Drop first to avoid conflicts if re-running)
drop policy if exists "Public Select Brands" on public.brands;
drop policy if exists "Authenticated Insert Brands" on public.brands;
drop policy if exists "Authenticated Update Brands" on public.brands;
drop policy if exists "Authenticated Delete Brands" on public.brands;

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

-- Insert default brands if table is empty
insert into public.brands (name)
select name from (values 
  ('VALENTINO'), ('VERSACE'), ('VIKTOR&ROLF'), ('PERRY ELLIS'), ('PARIS HILTON'),
  ('PACO RABANNE'), ('PARFUMS DE MARLY'), ('ORIENTICA'), ('MOSCHINO'), ('MONTALE'),
  ('MAISON FRANCIS KURKDJIAN'), ('LACOSTE'), ('LE LABO'), ('LATTAFA'), ('LANCÔME'),
  ('JEAN PAUL GAULTIER'), ('ISSEY MIYAKE'), ('INITIO'), ('HUGO BOSS'), ('GIORGIO ARMANI'),
  ('GIVENCHY'), ('DOLCE & GABBANA'), ('DUMONT'), ('CREED'), ('CHRISTIAN DIOR'),
  ('CAROLINA HERRERA'), ('CHANEL'), ('CALVIN KLEIN'), ('BVLGARI'), ('BHARARA'),
  ('ARMAF'), ('ARIANA GRANDE'), ('AL HARAMAIN'), ('AFNAN'), ('AZZARO')
) as t(name)
where not exists (select 1 from public.brands limit 1);
