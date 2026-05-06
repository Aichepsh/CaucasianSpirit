alter table public.drops
add column if not exists drop_number text not null default '03';
