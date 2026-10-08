import { createClient } from '@supabase/supabase-js'
import { getDeviceId } from './deviceId'

// Values are inlined at build time from abr-mobile/.env (see .env.example).
// Only the public anon key is used here — never put a service_role key in this app.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Copy abr-mobile/.env.example to abr-mobile/.env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart the bundler.'
  )
}

// Custom fetch wrapper that dynamically attaches the persistent x-device-id header
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const deviceId = await getDeviceId()
  const headers = new Headers(init?.headers || {})
  headers.set('x-device-id', deviceId)
  return fetch(input, { ...init, headers })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: customFetch,
  },
})
