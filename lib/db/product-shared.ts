import type {
  DropStatus,
  Product,
  SupabaseDropRow,
  SupabaseProductMediaRow,
  SupabaseProductRow
} from "@/types/qoru";
import { BRAND_INSTAGRAM_URL } from "@/lib/brand";

export function getProductSelectQuery() {
  return `
    id,
    title,
    subtitle,
    slug,
    card_image_url,
    category,
    price,
    status,
    quantity,
    description,
    material,
    composition,
    edition_label,
    production_note,
    drop_id,
    season,
    instagram_url,
    is_featured,
    created_at,
    updated_at,
    product_media (
      id,
      product_id,
      url,
      path,
      alt,
      sort_order,
      is_main,
      created_at
    ),
    drops (
      id,
      title,
      slug,
      status,
      drop_number,
      description,
      release_date,
      season,
      total_quantity,
      hero_image_url,
      hero_image_fit,
      hero_image_position_x,
      hero_image_position_y,
      is_active,
      created_at
    )
  `;
}

function normalizeDropStatus(status: null | string): DropStatus {
  if (
    status === "draft" ||
    status === "scheduled" ||
    status === "live" ||
    status === "archived"
  ) {
    return status;
  }
  return "archived";
}

function mapDrop(row: SupabaseDropRow | null | undefined) {
  if (!row) return null;
  const heroImageFit: "cover" | "contain" =
    row.hero_image_fit === "contain" ? "contain" : "cover";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: normalizeDropStatus(row.status),
    dropNumber: row.drop_number?.trim() || "03",
    description: row.description ?? "",
    releaseDate: row.release_date,
    season: row.season ?? "",
    totalQuantity: row.total_quantity ?? 0,
    heroImageUrl: row.hero_image_url ?? "/images/hero.svg",
    heroImageFit,
    heroImagePositionX: row.hero_image_position_x ?? 50,
    heroImagePositionY: row.hero_image_position_y ?? 50,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

function mapMedia(row: SupabaseProductMediaRow) {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.url,
    path: row.path,
    alt: row.alt ?? "",
    sortOrder: row.sort_order ?? 0,
    isMain: Boolean(row.is_main)
  };
}

function normalizeCategory(category: string): Product["category"] {
  if (
    category === "hoodies" ||
    category === "longsleeves" ||
    category === "t-shirts" ||
    category === "jackets"
  ) {
    return category;
  }
  return "hoodies";
}

function normalizeStatus(status: null | string): Product["status"] {
  if (
    status === "NEW" ||
    status === "LIMITED" ||
    status === "SOLD OUT" ||
    status === "STANDARD"
  ) {
    return status;
  }
  return "STANDARD";
}

export function mapProductRow(row: SupabaseProductRow): Product {
  const mediaRows = (row.product_media ?? []).slice().sort((a, b) => {
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const media = mediaRows.map(mapMedia);
  const main = media.find((item) => item.isMain) ?? media[0];
  const cardImageUrl = row.card_image_url ?? main?.url ?? "/images/product-hoodie.svg";

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    slug: row.slug,
    category: normalizeCategory(row.category),
    status: normalizeStatus(row.status),
    price: row.price,
    quantity: row.quantity ?? 0,
    description: row.description ?? "",
    material: row.material ?? "Плотный хлопок / темная шерсть",
    composition: row.composition ?? "Детали зависят от изделия",
    editionLabel: row.edition_label ?? `${row.quantity ?? 0} номерных изделий`,
    productionNote: row.production_note ?? "Малые цеха, ручная сборка",
    dropId: row.drop_id,
    season: row.season ?? "",
    instagramUrl: row.instagram_url ?? BRAND_INSTAGRAM_URL,
    isFeatured: Boolean(row.is_featured),
    cardImageUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media,
    mainImageUrl: main?.url ?? "/images/product-hoodie.svg",
    drop: mapDrop(row.drops)
  };
}
