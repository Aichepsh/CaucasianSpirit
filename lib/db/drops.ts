import { fallbackDrop } from "@/data/qoru";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/db/site-settings";
import type { Drop, DropStatus, SupabaseDropRow } from "@/types/qoru";
import { unstable_noStore as noStore } from "next/cache";

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

function isPublicDrop(drop: Drop) {
  return drop.status === "live" || drop.status === "archived";
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

type DropResult = {
  drops: Drop[];
  setupError: string | null;
  queryError: string | null;
};

export async function getDrops(): Promise<DropResult> {
  noStore();
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      drops: [fallbackDrop],
      setupError:
        "Supabase не подключен. Показаны локальные данные. " +
        "Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      queryError: null
    };
  }

  const dropsTable = supabase.from("drops") as any;
  const { data, error } = await dropsTable
    .select("*")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      drops: [fallbackDrop],
      setupError: null,
      queryError: `Ошибка чтения drops: ${error.message}. Показаны локальные данные.`
    };
  }

  return {
    drops: ((data ?? []) as unknown as SupabaseDropRow[]).map(mapDrop),
    setupError: null,
    queryError: null
  };
}

export async function getPublicDrops(): Promise<DropResult> {
  const result = await getDrops();
  return {
    ...result,
    drops: result.drops.filter(isPublicDrop)
  };
}

export async function getDropBySlug(slug: string): Promise<DropResult> {
  const result = await getPublicDrops();
  return {
    ...result,
    drops: result.drops.filter((drop) => drop.slug === slug)
  };
}

export async function getCurrentDrop(): Promise<DropResult> {
  const result = await getDrops();
  const settingsResult = await getSiteSettings();
  const activeDropId = settingsResult.settings.activeDropId;
  const settingsDrop = activeDropId
    ? result.drops.find((drop) => drop.id === activeDropId)
    : null;
  const activeDrop =
    (settingsDrop && settingsDrop.status === "live" ? settingsDrop : null) ??
    result.drops.find((drop) => drop.isActive && drop.status === "live") ??
    result.drops.find((drop) => drop.status === "live");

  return {
    ...result,
    setupError: result.setupError ?? settingsResult.setupError,
    queryError: result.queryError ?? settingsResult.queryError,
    drops: activeDrop ? [activeDrop] : result.drops.length > 0 ? [result.drops[0]] : [fallbackDrop]
  };
}
