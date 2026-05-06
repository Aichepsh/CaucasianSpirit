import { fallbackSiteSettings } from "@/data/qoru";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettings, SupabaseSiteSettingsRow } from "@/types/qoru";
import { unstable_noStore as noStore } from "next/cache";

export function mapSiteSettings(row: SupabaseSiteSettingsRow): SiteSettings {
  return {
    id: row.id,
    brandName: row.brand_name,
    footerMeta: row.footer_meta,
    instagramUrl: row.instagram_url,
    telegramUrl: row.telegram_url,
    activeDropId: row.active_drop_id,
    updatedAt: row.updated_at
  };
}

export async function getSiteSettings() {
  noStore();
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      settings: fallbackSiteSettings,
      setupError:
        "Supabase не подключен. Показаны локальные настройки. " +
        "Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      queryError: null
    };
  }

  const settingsTable = supabase.from("site_settings") as any;
  const { data, error } = await settingsTable
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    return {
      settings: fallbackSiteSettings,
      setupError: null,
      queryError: `Ошибка чтения site_settings: ${error.message}. Показаны локальные настройки.`
    };
  }

  return {
    settings: data ? mapSiteSettings(data as SupabaseSiteSettingsRow) : fallbackSiteSettings,
    setupError: null,
    queryError: null
  };
}
