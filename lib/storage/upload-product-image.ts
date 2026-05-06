"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type UploadedProductImage = {
  path: string;
  url: string;
};

function fileNameSafe(file: File) {
  return file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

async function uploadImageToProductBucket(
  file: File,
  folder = "products"
): Promise<UploadedProductImage> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    throw new Error(
      "Supabase не подключен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileNameSafe(file)}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: false, cacheControl: "3600" });

  if (uploadError) {
    throw new Error(`Ошибка загрузки изображения: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  return uploadImageToProductBucket(file, "products");
}

export async function uploadDropHeroImage(file: File): Promise<UploadedProductImage> {
  return uploadImageToProductBucket(file, "drops");
}
