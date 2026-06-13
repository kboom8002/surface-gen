import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 * Uses ONLY public anon key — never the service role key.
 * Safe to use in Client Components.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
