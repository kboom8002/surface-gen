import { createClient } from '@supabase/supabase-js';

/**
 * SECURITY: Service role key — ONLY used in apps/worker (server-only context).
 * NEVER import this module from apps/web or packages/*.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to browser clients.
 */
const supabaseUrl =
  process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '[Worker] Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). ' +
      'Worker will fail on DB operations.',
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
