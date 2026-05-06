import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createServerSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }
  return createClient(url, anonKey);
}
