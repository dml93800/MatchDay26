import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, match_id, team1, team2, score_home, score_away } = req.body
    const { error } = await supabase.from('pronos').upsert({
      user_id, match_id, team1, team2, score_home, score_away
    }, { onConflict: 'user_id,match_id' })
    if (error) return res.status(500).json({ error })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('pronos')
      .select('*, profiles(username)')
    if (error) return res.status(500).json({ error })
    return res.status(200).json({ pronos: data })
  }

  res.status(405).end()
}