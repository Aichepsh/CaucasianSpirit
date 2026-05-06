-- CAUCASIAN SPIRIT initial catalog seed.
-- Safe to re-run: records use stable UUIDs and ON CONFLICT upserts.

insert into public.drops (
  id,
  title,
  slug,
  status,
  description,
  release_date,
  season,
  total_quantity,
  hero_image_url
) values (
  '11111111-1111-4111-8111-111111111111',
  'КАМЕННЫЙ СЕЗОН',
  'kamennyy-sezon',
  'live',
  'Капсула из четырех вещей. Тишина гор, плотный хлопок, темная шерсть и силуэт папахи.',
  '2026-06-12',
  'SS·26',
  120,
  '/images/hero.svg'
) on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  description = excluded.description,
  release_date = excluded.release_date,
  season = excluded.season,
  total_quantity = excluded.total_quantity,
  hero_image_url = excluded.hero_image_url;

insert into public.products (
  id,
  title,
  subtitle,
  slug,
  category,
  price,
  status,
  quantity,
  description,
  drop_id,
  season,
  instagram_url,
  is_featured,
  card_image_url
) values
  (
    '22222222-2222-4222-8222-222222222221',
    'PAPAKHA HOODIE / 001',
    'Худи «Папаха»',
    'papakha-hoodie-001',
    'hoodies',
    18900,
    'LIMITED',
    120,
    'Плотное худи с высоким объемом капюшона и чистой линией плеча. Вещь собрана как тихий предмет силы, без внешнего шума.',
    '11111111-1111-4111-8111-111111111111',
    'SS·26',
    'https://instagram.com/caucasianspirit',
    true,
    '/images/product-hoodie.svg'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'ORNAMENT LONGSLEEVE',
    'Лонгслив «Орнамент»',
    'ornament-longsleeve',
    'longsleeves',
    8900,
    'NEW',
    200,
    'Лонгслив с едва заметным ритмом шва по рукаву. Отсылка к орнаменту остается в конструкции, а не на поверхности.',
    '11111111-1111-4111-8111-111111111111',
    'SS·26',
    'https://instagram.com/caucasianspirit',
    true,
    '/images/product-longsleeve.svg'
  ),
  (
    '22222222-2222-4222-8222-222222222223',
    'STONE TEE / HEAVY',
    'Футболка «Камень»',
    'stone-tee-heavy',
    't-shirts',
    5400,
    'STANDARD',
    80,
    'Тяжелая футболка с сухой посадкой и плотным воротом. Базовая вещь дропа, рассчитанная на долгую носку.',
    '11111111-1111-4111-8111-111111111111',
    'SS·26',
    'https://instagram.com/caucasianspirit',
    true,
    '/images/product-tee.svg'
  ),
  (
    '22222222-2222-4222-8222-222222222224',
    'HIGHLAND JACKET',
    'Жакет «Вершина»',
    'highland-jacket',
    'jackets',
    42000,
    'LIMITED',
    40,
    'Темный шерстяной жакет с прямой архитектурной линией. Самая редкая вещь дропа, собрана ограниченной серией.',
    '11111111-1111-4111-8111-111111111111',
    'SS·26',
    'https://instagram.com/caucasianspirit',
    true,
    '/images/product-jacket.svg'
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  category = excluded.category,
  price = excluded.price,
  status = excluded.status,
  quantity = excluded.quantity,
  description = excluded.description,
  drop_id = excluded.drop_id,
  season = excluded.season,
  instagram_url = excluded.instagram_url,
  is_featured = excluded.is_featured,
  card_image_url = excluded.card_image_url;

insert into public.product_media (
  id,
  product_id,
  url,
  path,
  alt,
  sort_order,
  is_main
) values
  (
    '33333333-3333-4333-8333-333333333331',
    '22222222-2222-4222-8222-222222222221',
    '/images/product-hoodie.svg',
    'local/product-hoodie.svg',
    'PAPAKHA HOODIE / 001',
    0,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '22222222-2222-4222-8222-222222222221',
    '/images/fabric.svg',
    'local/fabric.svg',
    'Деталь ткани',
    1,
    false
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    '/images/product-longsleeve.svg',
    'local/product-longsleeve.svg',
    'ORNAMENT LONGSLEEVE',
    0,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333334',
    '22222222-2222-4222-8222-222222222222',
    '/images/lookbook.svg',
    'local/lookbook.svg',
    'Lookbook',
    1,
    false
  ),
  (
    '33333333-3333-4333-8333-333333333335',
    '22222222-2222-4222-8222-222222222223',
    '/images/product-tee.svg',
    'local/product-tee.svg',
    'STONE TEE / HEAVY',
    0,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333336',
    '22222222-2222-4222-8222-222222222223',
    '/images/fabric.svg',
    'local/fabric.svg',
    'Деталь ткани',
    1,
    false
  ),
  (
    '33333333-3333-4333-8333-333333333337',
    '22222222-2222-4222-8222-222222222224',
    '/images/product-jacket.svg',
    'local/product-jacket.svg',
    'HIGHLAND JACKET',
    0,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333338',
    '22222222-2222-4222-8222-222222222224',
    '/images/hero.svg',
    'local/hero.svg',
    'Campaign detail',
    1,
    false
  )
on conflict (id) do update set
  product_id = excluded.product_id,
  url = excluded.url,
  path = excluded.path,
  alt = excluded.alt,
  sort_order = excluded.sort_order,
  is_main = excluded.is_main;

insert into public.footer_links (
  id,
  label,
  url,
  sort_order
) values
  (
    '44444444-4444-4444-8444-444444444441',
    'Instagram',
    'https://instagram.com/caucasianspirit',
    0
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'Telegram',
    'https://t.me/caucasianspirit',
    1
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'О бренде',
    '/about',
    2
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Каталог',
    '/catalog',
    3
  )
on conflict (id) do update set
  label = excluded.label,
  url = excluded.url,
  sort_order = excluded.sort_order;
