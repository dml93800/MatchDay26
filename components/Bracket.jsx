import Flag from './Flag'

const ROUNDS = [
  { key: 'Round of 32', label: 'Huitièmes' },
  { key: 'Round of 16', label: 'Quarts' },
  { key: 'Quarter-final', label: 'Demies' },
  { key: 'Semi-final', label: 'Finales' },
  { key: 'Final', label: 'Finale' },
]

function BracketMatch({ match }) {
  const hasScore = !!match.score
  const hs = hasScore ? match.score.ft[0] : null
  const as_ = hasScore ? match.score.ft[1] : null
  const t1Win = hasScore && hs > as_
  const t2Win = hasScore && as_ > hs

  return (
    <div className="bracket-match">
      {[
        { team: match.team1, score: hs, win: t1Win },
        { team: match.team2, score: as_, win: t2Win },
      ].map(({ team, score, win }, i) => (
        <div key={i} className={`bracket-team ${win ? 'winner' : ''}`}>
          <Flag country={team} size="sm" />
          <span className={`bracket-team-name ${win ? 'winner' : ''}`}>{team || '?'}</span>
          {score !== null && <span className={`bracket-team-score ${win ? 'winner' : ''}`}>{score}</span>}
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
    <div className="empty-state">
      <i className="ti ti-tournament" aria-hidden="true" />
      Les phases finales commencent le 28 juin
    </div>
  )

  return (
    <div className="bracket-scroll">
      <div className="bracket-inner">
        {rounds.map(round => (
          <div key={round.key} className="bracket-round">
            <div className="bracket-round-title">{round.label}</div>
            {round.games.map((m, i) => (
              <BracketMatch key={i} match={m} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}