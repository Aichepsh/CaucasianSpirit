export type ProductStatus = "NEW" | "LIMITED" | "SOLD OUT" | "STANDARD";
export type DropStatus = "draft" | "scheduled" | "live" | "archived";

export type ProductCategory = "hoodies" | "longsleeves" | "t-shirts" | "jackets";

export type ProductMedia = {
  id: string;
  productId: string;
  url: string;
  path: string;
  alt: string;
  sortOrder: number;
  isMain: boolean;
};

export type Drop = {
  id: string;
  title: string;
  slug: string;
  dropNumber: string;
  status: DropStatus;
  description: string;
  releaseDate: string | null;
  season: string;
  totalQuantity: number;
  heroImageUrl: string;
  heroImageFit: "cover" | "contain";
  heroImagePositionX: number;
  heroImagePositionY: number;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  quantity: number;
  description: string;
  material: string;
  composition: string;
  editionLabel: string;
  productionNote: string;
  dropId: null | string;
  season: string;
  instagramUrl: string;
  isFeatured: boolean;
  cardImageUrl: string;
  createdAt: string;
  updatedAt: string;
  media: ProductMedia[];
  mainImageUrl: string;
  drop: Drop | null;
};

export type FooterLink = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  createdAt: string;
};

export type SiteSettings = {
  id: string;
  brandName: string;
  footerMeta: string;
  instagramUrl: string;
  telegramUrl: string;
  activeDropId: string | null;
  updatedAt: string;
};

export type Principle = {
  number: string;
  title: string;
  text: string;
};

export type SupabaseProductRow = {
  id: string;
  title: string;
  subtitle: null | string;
  slug: string;
  category: string;
  price: number;
  status: null | string;
  quantity: null | number;
  description: null | string;
  material: null | string;
  composition: null | string;
  edition_label: null | string;
  production_note: null | string;
  drop_id: null | string;
  season: null | string;
  instagram_url: null | string;
  is_featured: null | boolean;
  card_image_url: null | string;
  created_at: string;
  updated_at: string;
  product_media?: SupabaseProductMediaRow[];
  drops?: null | SupabaseDropRow;
};

export type SupabaseProductMediaRow = {
  id: string;
  product_id: string;
  url: string;
  path: string;
  alt: null | string;
  sort_order: null | number;
  is_main: null | boolean;
  created_at: string;
};

export type SupabaseDropRow = {
  id: string;
  title: string;
  slug: string;
  status: null | string;
  drop_number: null | string;
  description: null | string;
  release_date: null | string;
  season: null | string;
  total_quantity: null | number;
  hero_image_url: null | string;
  hero_image_fit: null | string;
  hero_image_position_x: null | number;
  hero_image_position_y: null | number;
  is_active: null | boolean;
  created_at: string;
};

export type SupabaseFooterLinkRow = {
  id: string;
  label: string;
  url: string;
  sort_order: null | number;
  created_at: string;
};

export type SupabaseSiteSettingsRow = {
  id: string;
  brand_name: string;
  footer_meta: string;
  instagram_url: string;
  telegram_url: string;
  active_drop_id: string | null;
  updated_at: string;
};
