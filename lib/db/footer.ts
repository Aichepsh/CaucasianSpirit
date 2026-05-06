import { fallbackFooterLinks } from "@/data/qoru";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FooterLink, SupabaseFooterLinkRow } from "@/types/qoru";
import { unstable_noStore as noStore } from "next/cache";

function mapFooterLink(row: SupabaseFooterLinkRow): FooterLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at
  };
}

export async function getFooterLinks() {
  noStore();
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      links: fallbackFooterLinks,
      setupError:
        "Supabase не подключен. Показаны локальные данные. " +
        "Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      queryError: null
    };
  }

  const footerTable = supabase.from("footer_links") as any;
  const { data, error } = await footerTable
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return {
      links: fallbackFooterLinks,
      setupError: null,
      queryError:
        `Ошибка чтения footer_links: ${error.message}. Показаны локальные данные.`
    };
  }

  return {
    links: ((data ?? []) as unknown as SupabaseFooterLinkRow[]).map(mapFooterLink),
    setupError: null,
    queryError: null
  };
}
