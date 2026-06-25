export const COUNTRY_CODE = {
  'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Bosnia & Herzegovina': 'ba', 'Qatar': 'qa', 'Switzerland': 'ch',
  'Brazil': 'br', 'Morocco': 'ma', 'Haiti': 'ht', 'Scotland': 'gb-sct',
  'USA': 'us', 'United States': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turkey': 'tr',
  'Germany': 'de', 'Curaçao': 'cw', 'Ivory Coast': 'ci', "Côte d'Ivoire": 'ci', 'Ecuador': 'ec',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'Egypt': 'eg', 'Iran': 'ir', 'New Zealand': 'nz',
  'Spain': 'es', 'Cape Verde': 'cv', 'Saudi Arabia': 'sa', 'Uruguay': 'uy',
  'France': 'fr', 'Senegal': 'sn', 'Iraq': 'iq', 'Norway': 'no',
  'Argentina': 'ar', 'Algeria': 'dz', 'Austria': 'at', 'Jordan': 'jo',
  'Portugal': 'pt', 'DR Congo': 'cd', 'Uzbekistan': 'uz', 'Colombia': 'co',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
  'Wales': 'gb-wls', 'Serbia': 'rs', 'Poland': 'pl', 'Denmark': 'dk',
  'Ukraine': 'ua', 'Georgia': 'ge', 'Chile': 'cl', 'Peru': 'pe',
  'Venezuela': 've', 'Honduras': 'hn', 'Costa Rica': 'cr', 'Jamaica': 'jm',
  'Indonesia': 'id', 'Kenya': 'ke', 'Mali': 'ml', 'Senegal': 'sn',
}

export function getFlagUrl(country) {
  const code = COUNTRY_CODE[country]
  if (!code) return null
  return `https://flagcdn.com/w40/${code}.png`
}

export function calcPoints(prono, real) {
  if (real.hs === null || real.as === null) return null
  const ph = parseInt(prono.hs), pa = parseInt(prono.as)
  const rh = parseInt(real.hs), ra = parseInt(real.as)
  if (ph === rh && pa === ra) return 3
  const pWin = ph > pa ? 'h' : ph < pa ? 'a' : 'd'
  const rWin = rh > ra ? 'h' : rh < ra ? 'a' : 'd'
  return pWin === rWin ? 1 : 0
}

export function getTopScorers(matches) {
  const scorers = {}
  matches.forEach(m => {
    const team1 = m.team1, team2 = m.team2
    ;(m.goals1 || []).forEach(g => {
      if (g.owngoal) return
      const key = `${g.name}|${team1}`
      scorers[key] = (scorers[key] || { name: g.name, team: team1, goals: 0 })
      scorers[key].goals++
    })
    ;(m.goals2 || []).forEach(g => {
      if (g.owngoal) return
      const key = `${g.name}|${team2}`
      scorers[key] = (scorers[key] || { name: g.name, team: team2, goals: 0 })
      scorers[key].goals++
    })
  })
  return Object.values(scorers).sort((a, b) => b.goals - a.goals).slice(0, 10)
}

export function getGroupStandings(matches) {
  const groups = {}
  matches.forEach(m => {
    if (!m.group || !m.score) return
    const g = m.group
    if (!groups[g]) groups[g] = {}
    const hs = m.score.ft[0], as_ = m.score.ft[1]
    const t1 = m.team1, t2 = m.team2
    if (!groups[g][t1]) groups[g][t1] = { name: t1, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
    if (!groups[g][t2]) groups[g][t2] = { name: t2, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
    groups[g][t1].p++; groups[g][t2].p++
    groups[g][t1].gf += hs; groups[g][t1].ga += as_
    groups[g][t2].gf += as_; groups[g][t2].ga += hs
    if (hs > as_) { groups[g][t1].w++; groups[g][t1].pts += 3; groups[g][t2].l++ }
    else if (hs < as_) { groups[g][t2].w++; groups[g][t2].pts += 3; groups[g][t1].l++ }
    else { groups[g][t1].d++; groups[g][t1].pts++; groups[g][t2].d++; groups[g][t2].pts++ }
  })
  const result = {}
  Object.entries(groups).forEach(([g, teams]) => {
    result[g] = Object.values(teams).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))
  })
  return result
}
