"use client";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}
