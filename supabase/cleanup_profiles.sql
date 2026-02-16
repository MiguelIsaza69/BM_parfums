-- Clean up profiles table to remove unused columns
alter table public.profiles 
  drop column if exists username,
  drop column if exists avatar_url,
  drop column if exists website;

-- Ensure necessary columns exist
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists role text check (role in ('admin', 'user')) default 'user';

-- Update trigger function to reflect changes
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;
