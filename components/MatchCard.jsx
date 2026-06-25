export function formatMatchTime(timeStr) {
  if (!timeStr) return 'À venir'
  const match = timeStr.match(/(\d+):(\d+)\s*UTC([+-]\d+)/)
  if (!match) return timeStr
  const [, h, m, offset] = match
  const utcHour = parseInt(h) - parseInt(offset)
  const frHour = (utcHour + 2 + 24) % 24
  const us12h = parseInt(h) % 12 || 12
  const period = parseInt(h) >= 12 ? 'PM' : 'AM'
  return `${String(frHour).padStart(2,'0')}:${m} (FR) · ${us12h}:${m} ${period} (US)`
}