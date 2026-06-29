export default async function handler(req, res) {
  const { team1, team2, date } = req.query

  try {
    // Cherche le match sur API-Football
    const searchRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}&season=2026&league=1`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const searchData = await searchRes.json()
    const fixtures = searchData.response || []

    // Trouve le bon match
    const fixture = fixtures.find(f => {
      const home = f.teams.home.name.toLowerCase()
      const away = f.teams.away.name.toLowerCase()
      return (home.includes(team1.toLowerCase()) || team1.toLowerCase().includes(home)) &&
             (away.includes(team2.toLowerCase()) || team2.toLowerCase().includes(away))
    })

    if (!fixture) return res.status(404).json({ error: 'Match non trouvé' })

    const fixtureId = fixture.fixture.id

    // Récupère les stats
    const statsRes = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const statsData = await statsRes.json()

    // Récupère les events (buts, cartons)
    const eventsRes = await fetch(
      `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY } }
    )
    const eventsData = await eventsRes.json()

    res.setHeader('Cache-Control', 's-maxage=300')
    res.status(200).json({
      fixture: fixture.fixture,
      teams: fixture.teams,
      score: fixture.score,
      statistics: statsData.response || [],
      events: eventsData.response || []
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}