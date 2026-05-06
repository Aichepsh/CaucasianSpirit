alter table public.drops
add column if not exists hero_image_fit text not null default 'cover',
add column if not exists hero_image_position_x integer not null default 50,
add column if not exists hero_image_position_y integer not null default 50;

alter table public.drops
drop constraint if exists drops_hero_image_fit_check;

alter table public.drops
add constraint drops_hero_image_fit_check
check (hero_image_fit in ('cover', 'contain'));

alter table public.drops
drop constraint if exists drops_hero_image_position_x_check;

alter table public.drops
add constraint drops_hero_image_position_x_check
check (hero_image_position_x >= 0 and hero_image_position_x <= 100);

alter table public.drops
drop constraint if exists drops_hero_image_position_y_check;

alter table public.drops
add constraint drops_hero_image_position_y_check
check (hero_image_position_y >= 0 and hero_image_position_y <= 100);
