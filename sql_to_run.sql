-- Виконайте це в Supabase SQL Editor:
drop policy if exists "Admin manage settings" on site_settings;
create policy "Admin manage settings" on site_settings for all to anon using (true);

drop policy if exists "Admin manage categories" on menu_categories;
create policy "Admin manage categories" on menu_categories for all to anon using (true);

drop policy if exists "Admin manage items" on menu_items;
create policy "Admin manage items" on menu_items for all to anon using (true);
