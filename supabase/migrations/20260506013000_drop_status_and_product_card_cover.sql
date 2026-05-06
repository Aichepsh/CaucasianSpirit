alter table public.drops
add column if not exists status text not null default 'archived';

update public.drops
set status = case
  when is_active = true then 'live'
  else 'archived'
end
where status is null
   or status not in ('draft', 'scheduled', 'live', 'archived');

alter table public.drops
drop constraint if exists drops_status_check;

alter table public.drops
add constraint drops_status_check
check (status in ('draft', 'scheduled', 'live', 'archived'));

create index if not exists drops_status_idx on public.drops(status);

alter table public.products
add column if not exists card_image_url text;

