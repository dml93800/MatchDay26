export default async function handler(req, res) {
  try {
    const r = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json')
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=120')
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ matches: [] })
  }
}
