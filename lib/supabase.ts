import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type JournalEntry = {
  id: string
  user_id: string
  content: string
  emotion: 'verdriet' | 'boosheid' | 'angst' | 'vrede' | 'gemengd' | 'neutraal'
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  created_at: string
}
