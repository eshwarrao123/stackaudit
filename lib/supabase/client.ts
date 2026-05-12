import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// Supabase Browser Client (singleton)
//
// Safe to import in any "use client" file.
// For server-side usage, use createServerClient instead.
// ─────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client when both vars are real URLs (not placeholder strings)
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  isValidUrl(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

