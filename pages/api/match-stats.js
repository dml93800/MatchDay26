export default async function handler(req, res) {
  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=2026-06-11&season=2026&league=1`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const data = await r.json()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
} 