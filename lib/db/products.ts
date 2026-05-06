import { fallbackProducts } from "@/data/qoru";
import { getProductSelectQuery, mapProductRow } from "@/lib/db/product-shared";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product, SupabaseProductRow } from "@/types/qoru";
import { unstable_noStore as noStore } from "next/cache";

type ProductResult = {
  products: Product[];
  setupError: string | null;
  queryError: string | null;
};

export async function getProducts(): Promise<ProductResult> {
  noStore();
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      products: fallbackProducts,
      setupError:
        "Supabase не подключен. Показаны локальные данные. " +
        "Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      queryError: null
    };
  }

  const productsTable = supabase.from("products") as any;
  const { data, error } = await productsTable
    .select(getProductSelectQuery())
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "product_media", ascending: true });

  if (error) {
    return {
      products: fallbackProducts,
      setupError: null,
      queryError: `Ошибка чтения products: ${error.message}. Показаны локальные данные.`
    };
  }

  return {
    products: ((data ?? []) as unknown as SupabaseProductRow[]).map(mapProductRow),
    setupError: null,
    queryError: null
  };
}

export async function getFeaturedProducts() {
  const result = await getProducts();
  const featured = result.products.filter((product) => product.isFeatured);
  return {
    ...result,
    products: featured.length > 0 ? featured : result.products.slice(0, 4)
  };
}

export async function getProductBySlug(slug: string): Promise<ProductResult> {
  const result = await getProducts();
  return {
    ...result,
    products: result.products.filter((product) => product.slug === slug)
  };
}

export async function getProductsByDropId(dropId: string) {
  const result = await getProducts();
  return {
    ...result,
    products: result.products.filter((product) => product.dropId === dropId)
  };
}
