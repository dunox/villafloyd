import { createClient } from 'npm:@supabase/supabase-js@2';
import { getRequiredEnv } from './http.ts';

export function getAdminClient() {
  return createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
