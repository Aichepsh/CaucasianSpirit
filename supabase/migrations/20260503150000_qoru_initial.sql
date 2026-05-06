-- CAUCASIAN SPIRIT initial schema for products, media, drops, footer links and storage.
-- This migration is additive and non-destructive.

create extension if not exists pgcrypto;

create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  release_date date,
  season text,
  total_quantity integer,
  hero_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  category text not null,
  price integer not null,
  status text not null,
  quantity integer,
  description text,
  drop_id uuid references public.drops(id) on delete set null,
  season text,
  instagram_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_non_negative check (price >= 0),
  constraint products_quantity_non_negative check (quantity is null or quantity >= 0),
  constraint products_status_check check (status in ('NEW', 'LIMITED', 'SOLD OUT', 'STANDARD')),
  constraint products_category_check check (category in ('hoodies', 'longsleeves', 't-shirts', 'jackets'))
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text not null,
  alt text,
  sort_order integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.footer_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_drop_id_idx on public.products(drop_id);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_is_featured_idx on public.products(is_featured);
create index if not exists product_media_product_id_idx on public.product_media(product_id);
create index if not exists product_media_sort_order_idx on public.product_media(product_id, sort_order);
create index if not exists footer_links_sort_order_idx on public.footer_links(sort_order);
create unique index if not exists product_media_one_main_per_product_idx
  on public.product_media(product_id)
  where is_main;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.drops enable row level security;
alter table public.footer_links enable row level security;

create policy "Public read products"
on public.products
for select
to public
using (true);

create policy "Public read product_media"
on public.product_media
for select
to public
using (true);

create policy "Public read drops"
on public.drops
for select
to public
using (true);

create policy "Public read footer_links"
on public.footer_links
for select
to public
using (true);

create policy "Public read product-images bucket"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

-- Write policies are intentionally not open for public/anon users.
-- Recommended prototype strategy:
-- 1) keep write access only for service role or authenticated admin users;
-- 2) add auth-based admin policies later.
--
-- Development-only policy example (do not use in production):
-- create policy "DEV allow all writes to product-images"
-- on storage.objects
-- for all
-- to anon
-- using (bucket_id = 'product-images')
-- with check (bucket_id = 'product-images');
