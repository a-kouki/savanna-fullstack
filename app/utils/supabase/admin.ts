// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function getAdminClient(schema: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { db: { schema: process.env.SUPABASE_SCHEMA!, } } 
  );
}