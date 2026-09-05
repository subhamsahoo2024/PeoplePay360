import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function createUserScopedClient(accessToken: string) {
  return createClient<Database>(
    required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { global: { headers: { Authorization: `Bearer ${accessToken}` } }, auth: { persistSession: false } }
  );
}

export function createServiceRoleClient() {
  return createClient<Database>(
    required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
