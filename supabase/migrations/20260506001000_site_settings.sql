create table if not exists public.site_settings (
  id text primary key default 'main',
  brand_name text not null default 'CAUCASIAN SPIRIT',
  footer_meta text not null default 'LIMITED DROPS · EST. 2025',
  instagram_url text not null default 'https://instagram.com/caucasianspirit',
  telegram_url text not null default 'https://t.me/caucasianspirit',
  active_drop_id uuid references public.drops(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  id,
  brand_name,
  footer_meta,
  instagram_url,
  telegram_url,
  active_drop_id
)
select
  'main',
  'CAUCASIAN SPIRIT',
  'LIMITED DROPS · EST. 2025',
  'https://instagram.com/caucasianspirit',
  'https://t.me/caucasianspirit',
  (select id from public.drops where is_active = true order by created_at desc limit 1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Public read site_settings"
on public.site_settings
for select
to public
using (true);
