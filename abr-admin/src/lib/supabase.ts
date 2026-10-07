import { createClient } from '@supabase/supabase-js'

// Values are inlined at build time from abr-admin/.env (see .env.example).
// Only the public anon key is used here — never put a service_role key in this app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Copy abr-admin/.env.example to abr-admin/.env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
