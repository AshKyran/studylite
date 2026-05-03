// utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("🚨 FATAL: Supabase environment variables are missing in the client.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}