-- Create a table for public profiles (accessible by everyone if public, but usually authenticated)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text check (role in ('admin', 'user')) default 'user',
  phone text,
  address_id uuid
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ADDRESSES TABLE
create table if not exists public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  alias text not null, -- e.g. "Casa", "Trabajo"
  full_address text not null,
  city text not null,
  is_default boolean default false
);

-- RLS for addresses
alter table public.addresses enable row level security;

create policy "Users can view their own addresses." on public.addresses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own addresses." on public.addresses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own addresses." on public.addresses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own addresses." on public.addresses
  for delete using (auth.uid() = user_id);
