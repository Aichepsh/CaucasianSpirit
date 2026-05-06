"use client";

import { getProductSelectQuery, mapProductRow } from "@/lib/db/product-shared";
import { mapSiteSettings } from "@/lib/db/site-settings";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type {
  Drop,
  DropStatus,
  FooterLink,
  SiteSettings,
  ProductCategory,
  ProductStatus,
  SupabaseDropRow,
  SupabaseFooterLinkRow,
  SupabaseProductRow,
  SupabaseSiteSettingsRow
} from "@/types/qoru";

export type ProductMutationInput = {
  title: string;
  subtitle: string;
  slug: string;
  category: ProductCategory;
  price: number;
  status: ProductStatus;
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
};

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

function mapDrop(row: SupabaseDropRow): Drop {
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

function mapFooterLink(row: SupabaseFooterLinkRow): FooterLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at
  };
}

function getClientOrThrow() {
  const client = createBrowserSupabaseClient();
  if (!client) {
    throw new Error(
      "Supabase не подключен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return client;
}

export async function fetchProductsClient() {
  const supabase = getClientOrThrow();
  const productsTable = supabase.from("products") as any;
  const { data, error } = await productsTable
    .select(getProductSelectQuery())
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "product_media", ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data as SupabaseProductRow[]).map(mapProductRow);
}

export async function fetchDropsClient() {
  const supabase = getClientOrThrow();
  const dropsTable = supabase.from("drops") as any;
  const { data, error } = await dropsTable.select("*")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data as SupabaseDropRow[]).map(mapDrop);
}

export async function fetchFooterLinksClient() {
  const supabase = getClientOrThrow();
  const footerTable = supabase.from("footer_links") as any;
  const { data, error } = await footerTable.select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data as SupabaseFooterLinkRow[]).map(mapFooterLink);
}

export async function fetchSiteSettingsClient() {
  const supabase = getClientOrThrow();
  const settingsTable = supabase.from("site_settings") as any;
  const { data, error } = await settingsTable
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapSiteSettings(data as SupabaseSiteSettingsRow) : null;
}

export async function saveSiteSettings(settings: SiteSettings) {
  const supabase = getClientOrThrow();
  const settingsTable = supabase.from("site_settings") as any;
  const { error } = await settingsTable.upsert(
    {
      id: "main",
      brand_name: settings.brandName,
      footer_meta: settings.footerMeta,
      instagram_url: settings.instagramUrl,
      telegram_url: settings.telegramUrl,
      active_drop_id: settings.activeDropId,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (error) {
    throw new Error(error.message);
  }

  const dropsTable = supabase.from("drops") as any;

  if (settings.activeDropId) {
    const { error: resetError } = await dropsTable
      .update({ is_active: false })
      .neq("id", settings.activeDropId);
    if (resetError) {
      throw new Error(resetError.message);
    }

    const { error: activeError } = await dropsTable
      .update({ is_active: true })
      .eq("id", settings.activeDropId);
    if (activeError) {
      throw new Error(activeError.message);
    }
    return;
  }

  const { error: resetAllError } = await dropsTable.update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  if (resetAllError) {
    throw new Error(resetAllError.message);
  }
}

export async function insertProduct(input: ProductMutationInput) {
  const supabase = getClientOrThrow();
  const productsTable = supabase.from("products") as any;
  const { data, error } = await productsTable
    .insert({
      title: input.title,
      subtitle: input.subtitle || null,
      slug: input.slug,
      category: input.category,
      price: input.price,
      status: input.status,
      quantity: input.quantity,
      description: input.description || null,
      material: input.material || null,
      composition: input.composition || null,
      edition_label: input.editionLabel || null,
      production_note: input.productionNote || null,
      drop_id: input.dropId,
      season: input.season || null,
      instagram_url: input.instagramUrl || null,
      is_featured: input.isFeatured,
      card_image_url: input.cardImageUrl || null
    })
    .select("id")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.id as string;
}

export async function updateProduct(id: string, input: ProductMutationInput) {
  const supabase = getClientOrThrow();
  const productsTable = supabase.from("products") as any;
  const { error } = await productsTable
    .update({
      title: input.title,
      subtitle: input.subtitle || null,
      slug: input.slug,
      category: input.category,
      price: input.price,
      status: input.status,
      quantity: input.quantity,
      description: input.description || null,
      material: input.material || null,
      composition: input.composition || null,
      edition_label: input.editionLabel || null,
      production_note: input.productionNote || null,
      drop_id: input.dropId,
      season: input.season || null,
      instagram_url: input.instagramUrl || null,
      is_featured: input.isFeatured,
      card_image_url: input.cardImageUrl || null
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function insertProductMedia(
  productId: string,
  items: Array<{
    url: string;
    path: string;
    alt: string;
    sortOrder: number;
    isMain: boolean;
  }>
) {
  if (items.length === 0) return;
  const supabase = getClientOrThrow();
  const mediaTable = supabase.from("product_media") as any;
  const { error } = await mediaTable.insert(
    items.map((item) => ({
      product_id: productId,
      url: item.url,
      path: item.path,
      alt: item.alt || null,
      sort_order: item.sortOrder,
      is_main: item.isMain
    }))
  );
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProductMedia(
  items: Array<{
    id: string;
    alt: string;
    sortOrder: number;
    isMain: boolean;
  }>
) {
  if (items.length === 0) return;
  const supabase = getClientOrThrow();
  const mediaTable = supabase.from("product_media") as any;

  for (const item of items) {
    const { error } = await mediaTable
      .update({
        alt: item.alt || null,
        sort_order: item.sortOrder,
        is_main: item.isMain
      })
      .eq("id", item.id);
    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function deleteProductMedia(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = getClientOrThrow();
  const mediaTable = supabase.from("product_media") as any;
  const { error } = await mediaTable.delete().in("id", ids);
  if (error) {
    throw new Error(error.message);
  }
}

export async function removeStorageFiles(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = getClientOrThrow();
  const { error } = await supabase.storage.from("product-images").remove(paths);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(id: string) {
  const supabase = getClientOrThrow();
  const productsTable = supabase.from("products") as any;
  const { error } = await productsTable.delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function saveFooterLinks(
  links: Array<{ id?: string; label: string; url: string; sortOrder: number }>
) {
  const supabase = getClientOrThrow();
  const payload = links.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    sort_order: item.sortOrder
  }));
  const footerTable = supabase.from("footer_links") as any;
  const { error } = await footerTable
    .upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }
}

export async function insertDrop(drop: Drop) {
  const supabase = getClientOrThrow();
  if (drop.isActive) {
    const dropsTableForReset = supabase.from("drops") as any;
    const { error: resetError } = await dropsTableForReset
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (resetError) {
      throw new Error(resetError.message);
    }
  }

  const dropsTable = supabase.from("drops") as any;
  const { data, error } = await dropsTable
    .insert({
      title: drop.title,
      slug: drop.slug,
      status: drop.status,
      drop_number: drop.dropNumber,
      description: drop.description || null,
      release_date: drop.releaseDate || null,
      season: drop.season || null,
      total_quantity: drop.totalQuantity,
      hero_image_url: drop.heroImageUrl || null,
      hero_image_fit: drop.heroImageFit,
      hero_image_position_x: drop.heroImagePositionX,
      hero_image_position_y: drop.heroImagePositionY,
      is_active: drop.isActive
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapDrop(data as SupabaseDropRow);
}

export async function updateDrop(drop: Drop) {
  const supabase = getClientOrThrow();
  if (drop.isActive) {
    const dropsTableForReset = supabase.from("drops") as any;
    const { error: resetError } = await dropsTableForReset
      .update({ is_active: false })
      .neq("id", drop.id);
    if (resetError) {
      throw new Error(resetError.message);
    }
  }

  const dropsTable = supabase.from("drops") as any;
  const { error } = await dropsTable
    .update({
      title: drop.title,
      slug: drop.slug,
      status: drop.status,
      drop_number: drop.dropNumber,
      description: drop.description || null,
      release_date: drop.releaseDate || null,
      season: drop.season || null,
      total_quantity: drop.totalQuantity,
      hero_image_url: drop.heroImageUrl || null,
      hero_image_fit: drop.heroImageFit,
      hero_image_position_x: drop.heroImagePositionX,
      hero_image_position_y: drop.heroImagePositionY,
      is_active: drop.isActive
    })
    .eq("id", drop.id);
  if (error) {
    throw new Error(error.message);
  }
}
