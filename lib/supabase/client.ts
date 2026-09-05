'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  browserClient ??= createClient<Database>(url, anonKey);
  return browserClient;
}
