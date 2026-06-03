import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Score = {
  id: number
  player_name: string
  score: number
  created_at: string
}

export async function getTopScores(): Promise<Score[]> {
  const { data, error } = await supabase
    .from('trebor_toilet_scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10)
  if (error) throw error
  return data ?? []
}

export async function saveScore(playerName: string, score: number): Promise<void> {
  const { error } = await supabase
    .from('trebor_toilet_scores')
    .insert({ player_name: playerName.trim().slice(0, 50) || 'Anónimo', score })
  if (error) throw error
}
