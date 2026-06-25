export default async function handler(req, res) {
  const { query } = req.query
  const searchQuery = query || 'football stadium night'
  
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    )
    const data = await r.json()
    const photos = data.photos || []
    if (!photos.length) return res.status(404).json({ url: null })
    const random = photos[Math.floor(Math.random() * photos.length)]
    res.setHeader('Cache-Control', 's-maxage=3600')
    res.status(200).json({ url: random.src.large2x })
  } catch (e) {
    res.status(500).json({ url: null })
  }
}