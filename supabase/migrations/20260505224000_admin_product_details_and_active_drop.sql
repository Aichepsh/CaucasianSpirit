alter table public.products
add column if not exists material text,
add column if not exists composition text,
add column if not exists edition_label text,
add column if not exists production_note text;

alter table public.drops
add column if not exists is_active boolean not null default false;

update public.drops
set is_active = true
where id = (
  select id
  from public.drops
  order by created_at desc
  limit 1
)
and not exists (
  select 1
  from public.drops
  where is_active = true
);

create index if not exists drops_is_active_idx on public.drops(is_active);
