export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { team1, team2, score, type } = req.body
  const prompt = type === 'upcoming'
    ? `Tu es un expert football. Analyse le match ${team1} vs ${team2} à la Coupe du Monde 2026. Donne une prédiction argumentée en 3-4 phrases : vainqueur probable et pourquoi (forme, historique, style de jeu). Sois direct et précis.`
    : type === 'summary'
    ? `Tu es un journaliste sportif. Rédige un résumé professionnel du match ${team1} vs ${team2} (CdM 2026) qui s'est terminé ${score}. Buts marqués : ${req.body.goals || 'aucun'}. Groupe : ${req.body.group || ''}. Stade : ${req.body.ground || ''}. Rédige 4-5 phrases dans un style journalistique dynamique et précis, comme L'Équipe ou RMC Sport.`
    : `Tu es un expert football. Le match ${team1} vs ${team2} (CdM 2026) s'est terminé ${score}. Analyse en 3-4 phrases ce que ce résultat signifie pour la suite du tournoi.`
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
    })
    const data = await r.json()
    const text = data.content?.find(b => b.type === 'text')?.text || 'Analyse indisponible.'
    res.status(200).json({ analysis: text })
  } catch (e) {
    res.status(500).json({ error: 'Erreur IA' })
  }
}
