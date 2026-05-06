import type { Drop, FooterLink, Principle, Product, SiteSettings } from "@/types/qoru";
import { BRAND_INSTAGRAM_URL, BRAND_TELEGRAM_URL } from "@/lib/brand";

export const categoryLabels: Record<string, string> = {
  all: "ВСЕ",
  hoodies: "HOODIES",
  longsleeves: "LONGSLEEVES",
  "t-shirts": "T-SHIRTS",
  jackets: "JACKETS"
};

export const principles: Principle[] = [
  {
    number: "01",
    title: "ЛИМИТ",
    text: "Ограниченный тираж — наша форма уважения к вещи."
  },
  {
    number: "02",
    title: "ТИШИНА",
    text: "Никаких логотипов на показ. Только материал и силуэт."
  },
  {
    number: "03",
    title: "КОРНИ",
    text: "Деликатные отсылки к кавказской культуре, без сувенирности."
  },
  {
    number: "04",
    title: "РУЧНАЯ РАБОТА",
    text: "Малые цеха, нумерация каждого изделия."
  }
];

export const fallbackDrop: Drop = {
  id: "drop-fallback-03",
  title: "КАМЕННЫЙ СЕЗОН",
  slug: "kamennyy-sezon",
  dropNumber: "03",
  status: "live",
  description:
    "Капсула из четырех вещей. Тишина гор, плотный хлопок, темная шерсть и силуэт папахи.",
  releaseDate: "2026-06-12",
  season: "SS·26",
  totalQuantity: 120,
  heroImageUrl: "/images/hero.svg",
  heroImageFit: "cover",
  heroImagePositionX: 50,
  heroImagePositionY: 50,
  isActive: true,
  createdAt: new Date("2026-06-12").toISOString()
};

export const fallbackProducts: Product[] = [
  {
    id: "p-001",
    title: "PAPAKHA HOODIE / 001",
    subtitle: "Худи «Папаха»",
    slug: "papakha-hoodie-001",
    category: "hoodies",
    status: "LIMITED",
    price: 18900,
    quantity: 120,
    description:
      "Плотное худи с высоким объемом капюшона и чистой линией плеча. Вещь собрана как тихий предмет силы, без внешнего шума.",
    material: "Плотный хлопок",
    composition: "100% хлопок",
    editionLabel: "120 номерных изделий",
    productionNote: "Малые цеха, ручная сборка",
    dropId: fallbackDrop.id,
    season: "SS·26",
    instagramUrl: BRAND_INSTAGRAM_URL,
    isFeatured: true,
    cardImageUrl: "/images/product-hoodie.svg",
    createdAt: new Date("2026-06-12").toISOString(),
    updatedAt: new Date("2026-06-12").toISOString(),
    mainImageUrl: "/images/product-hoodie.svg",
    drop: fallbackDrop,
    media: [
      {
        id: "m-001-1",
        productId: "p-001",
        url: "/images/product-hoodie.svg",
        path: "local/product-hoodie.svg",
        alt: "PAPAKHA HOODIE / 001",
        sortOrder: 0,
        isMain: true
      },
      {
        id: "m-001-2",
        productId: "p-001",
        url: "/images/fabric.svg",
        path: "local/fabric.svg",
        alt: "Деталь ткани",
        sortOrder: 1,
        isMain: false
      }
    ]
  },
  {
    id: "p-002",
    title: "ORNAMENT LONGSLEEVE",
    subtitle: "Лонгслив «Орнамент»",
    slug: "ornament-longsleeve",
    category: "longsleeves",
    status: "NEW",
    price: 8900,
    quantity: 200,
    description:
      "Лонгслив с едва заметным ритмом шва по рукаву. Отсылка к орнаменту остается в конструкции, а не на поверхности.",
    material: "Плотный хлопок",
    composition: "100% хлопок",
    editionLabel: "200 номерных изделий",
    productionNote: "Малые цеха, ручная сборка",
    dropId: fallbackDrop.id,
    season: "SS·26",
    instagramUrl: BRAND_INSTAGRAM_URL,
    isFeatured: true,
    cardImageUrl: "/images/product-longsleeve.svg",
    createdAt: new Date("2026-06-12").toISOString(),
    updatedAt: new Date("2026-06-12").toISOString(),
    mainImageUrl: "/images/product-longsleeve.svg",
    drop: fallbackDrop,
    media: [
      {
        id: "m-002-1",
        productId: "p-002",
        url: "/images/product-longsleeve.svg",
        path: "local/product-longsleeve.svg",
        alt: "ORNAMENT LONGSLEEVE",
        sortOrder: 0,
        isMain: true
      },
      {
        id: "m-002-2",
        productId: "p-002",
        url: "/images/lookbook.svg",
        path: "local/lookbook.svg",
        alt: "Lookbook",
        sortOrder: 1,
        isMain: false
      }
    ]
  },
  {
    id: "p-003",
    title: "STONE TEE / HEAVY",
    subtitle: "Футболка «Камень»",
    slug: "stone-tee-heavy",
    category: "t-shirts",
    status: "STANDARD",
    price: 5400,
    quantity: 80,
    description:
      "Тяжелая футболка с сухой посадкой и плотным воротом. Базовая вещь дропа, рассчитанная на долгую носку.",
    material: "Тяжелый хлопок",
    composition: "100% хлопок",
    editionLabel: "80 номерных изделий",
    productionNote: "Малые цеха, ручная сборка",
    dropId: fallbackDrop.id,
    season: "SS·26",
    instagramUrl: BRAND_INSTAGRAM_URL,
    isFeatured: true,
    cardImageUrl: "/images/product-tee.svg",
    createdAt: new Date("2026-06-12").toISOString(),
    updatedAt: new Date("2026-06-12").toISOString(),
    mainImageUrl: "/images/product-tee.svg",
    drop: fallbackDrop,
    media: [
      {
        id: "m-003-1",
        productId: "p-003",
        url: "/images/product-tee.svg",
        path: "local/product-tee.svg",
        alt: "STONE TEE / HEAVY",
        sortOrder: 0,
        isMain: true
      },
      {
        id: "m-003-2",
        productId: "p-003",
        url: "/images/fabric.svg",
        path: "local/fabric.svg",
        alt: "Деталь ткани",
        sortOrder: 1,
        isMain: false
      }
    ]
  },
  {
    id: "p-004",
    title: "HIGHLAND JACKET",
    subtitle: "Жакет «Вершина»",
    slug: "highland-jacket",
    category: "jackets",
    status: "LIMITED",
    price: 42000,
    quantity: 40,
    description:
      "Темный шерстяной жакет с прямой архитектурной линией. Самая редкая вещь дропа, собрана ограниченной серией.",
    material: "Темная шерсть",
    composition: "Шерсть / подкладочная вискоза",
    editionLabel: "40 номерных изделий",
    productionNote: "Малые цеха, ручная сборка",
    dropId: fallbackDrop.id,
    season: "SS·26",
    instagramUrl: BRAND_INSTAGRAM_URL,
    isFeatured: true,
    cardImageUrl: "/images/product-jacket.svg",
    createdAt: new Date("2026-06-12").toISOString(),
    updatedAt: new Date("2026-06-12").toISOString(),
    mainImageUrl: "/images/product-jacket.svg",
    drop: fallbackDrop,
    media: [
      {
        id: "m-004-1",
        productId: "p-004",
        url: "/images/product-jacket.svg",
        path: "local/product-jacket.svg",
        alt: "HIGHLAND JACKET",
        sortOrder: 0,
        isMain: true
      },
      {
        id: "m-004-2",
        productId: "p-004",
        url: "/images/hero.svg",
        path: "local/hero.svg",
        alt: "Campaign detail",
        sortOrder: 1,
        isMain: false
      }
    ]
  }
];

export const fallbackFooterLinks: FooterLink[] = [
  {
    id: "f-1",
    label: "Instagram",
    url: BRAND_INSTAGRAM_URL,
    sortOrder: 0,
    createdAt: new Date("2026-06-12").toISOString()
  },
  {
    id: "f-2",
    label: "Telegram",
    url: BRAND_TELEGRAM_URL,
    sortOrder: 1,
    createdAt: new Date("2026-06-12").toISOString()
  },
  {
    id: "f-3",
    label: "О бренде",
    url: "/about",
    sortOrder: 2,
    createdAt: new Date("2026-06-12").toISOString()
  },
  {
    id: "f-4",
    label: "Каталог",
    url: "/catalog",
    sortOrder: 3,
    createdAt: new Date("2026-06-12").toISOString()
  }
];

export const fallbackSiteSettings: SiteSettings = {
  id: "main",
  brandName: "CAUCASIAN SPIRIT",
  footerMeta: "LIMITED DROPS · EST. 2025",
  instagramUrl: BRAND_INSTAGRAM_URL,
  telegramUrl: BRAND_TELEGRAM_URL,
  activeDropId: fallbackDrop.id,
  updatedAt: new Date("2026-06-12").toISOString()
};
