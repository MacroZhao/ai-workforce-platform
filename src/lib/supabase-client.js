import { createClient } from '@supabase/supabase-js'

// Handle both Vite (import.meta.env) and Node.js (process.env) environments
const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue
  }
  return process.env[key] || defaultValue
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '<YOUR-SUPABASE-KEY>')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)