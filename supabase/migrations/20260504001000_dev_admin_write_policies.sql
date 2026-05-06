-- Development-only admin write policies for the no-auth prototype.
-- Do not use these policies in production. Replace with authenticated admin
-- policies before launch.

drop policy if exists "DEV public write products" on public.products;
create policy "DEV public write products"
on public.products
for all
to public
using (true)
with check (true);

drop policy if exists "DEV public write product_media" on public.product_media;
create policy "DEV public write product_media"
on public.product_media
for all
to public
using (true)
with check (true);

drop policy if exists "DEV public write drops" on public.drops;
create policy "DEV public write drops"
on public.drops
for all
to public
using (true)
with check (true);

drop policy if exists "DEV public write footer_links" on public.footer_links;
create policy "DEV public write footer_links"
on public.footer_links
for all
to public
using (true)
with check (true);

drop policy if exists "DEV public write product-images bucket" on storage.objects;
create policy "DEV public write product-images bucket"
on storage.objects
for all
to public
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
