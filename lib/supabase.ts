import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type AgentRow = {
  id: string
  name: string
  role: string
  zone_id: string
  status: 'working' | 'reviewing' | 'waiting' | 'publishing' | 'idle'
  task: string
  progress: number
  color_key: string
}

export type TaskRow = {
  id: string
  agent_name: string
  action: string
  detail: string
  created_at: string
  color_key: string
}
