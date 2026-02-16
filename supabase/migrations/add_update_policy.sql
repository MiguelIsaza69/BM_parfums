-- Add the missing UPDATE policy
create policy "Authenticated Update"
  on public.hero_slides for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
