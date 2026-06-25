import Flag from './Flag'

const ROUNDS = [
  { key: 'Round of 32', label: 'Huitièmes', matches: 16 },
  { key: 'Round of 16', label: 'Quarts', matches: 8 },
  { key: 'Quarter-final', label: 'Demies', matches: 4 },
  { key: 'Semi-final', label: 'Finales', matches: 2 },
  { key: 'Final', label: 'Finale', matches: 1 },
]

function BracketMatch({ match }) {
  const hasScore = !!match.score
  const hs = hasScore ? match.score.ft[0] : null
  const as_ = hasScore ? match.score.ft[1] : null
  const t1Win = hasScore && hs > as_
  const t2Win = hasScore && as_ > hs

  return (
    <div style={{ background:'#141720', border:'1px solid #1e2330', borderRadius:10, overflow:'hidden', minWidth:180, marginBottom:8 }}>
      {[
        { team: match.team1, score: hs, win: t1Win },
        { team: match.team2, score: as_, win: t2Win },
      ].map(({ team, score, win }, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderBottom: i===0 ? '1px solid #1e2330' : 'none', background: win ? '#00c46a08' : 'transparent' }}>
          <Flag country={team} size="sm" />
          <span style={{ flex:1, fontSize:12, color: win?'#fff':'#8890a4', fontWeight: win?600:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {team || '?'}
          </span>
          {score !== null && (
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:18, color: win?'#00c46a':'#4a5168', minWidth:16, textAlign:'right' }}>{score}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Bracket({ matches }) {
  const rounds = ROUNDS.map(r => ({
    ...r,
    games: matches.filter(m => m.round === r.key)
  })).filter(r => r.games.length > 0)

  if (!rounds.length) return (
    <div style={{ textAlign:'center', padding:'3rem', color:'#4a5168', fontSize:14 }}>
      <i className="ti ti-tournament" style={{ fontSize:36, display:'block', marginBottom:10 }} aria-hidden="true" />
      Les phases finales commencent le 28 juin
    </div>
  )

  return (
    <div style={{ overflowX:'auto', paddingBottom:16 }}>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', minWidth:'max-content' }}>
        {rounds.map(round => (
          <div key={round.key} style={{ minWidth:200 }}>
            <div style={{ fontSize:10, fontWeight:600, color:'#4a5168', textTransform:'uppercase', letterSpacing:'1px', marginBottom:12, textAlign:'center' }}>
              {round.label}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {round.games.map((m, i) => (
                <BracketMatch key={i} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}