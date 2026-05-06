drop policy if exists "DEV public write site_settings" on public.site_settings;

create policy "DEV public write site_settings"
on public.site_settings
for all
to anon
using (true)
with check (true);
