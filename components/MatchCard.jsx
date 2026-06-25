import { useState } from 'react'
import Flag from './Flag'

export default function MatchCard({ match, prono, onSaveProno }) {
  const [showProno, setShowProno] = useState(false)
  const [ph, setPh] = useState(0)
  const [pa, setPa] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  const hasScore = !!match.score
  const hs = hasScore ? match.score.ft[0] : null
  const as_ = hasScore ? match.score.ft[1] : null
  const isUpcoming = !hasScore
  const matchId = `${match.team1}-${match.team2}-${match.date}`

  const homeP = isUpcoming ? 42 : (hs > as_ ? 58 : hs === as_ ? 32 : 22)
  const drawP = isUpcoming ? 25 : 20
  const awayP = 100 - homeP - drawP

  async function askAI() {
    setLoadingAI(true)
    setAnalysis(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1: match.team1, team2: match.team2,
          score: hasScore ? `${hs}-${as_}` : null,
          type: isUpcoming ? 'upcoming' : 'finished'
        })
      })
      const data = await res.json()
      setAnalysis(data.analysis || 'Analyse indisponible.')
    } catch { setAnalysis('Erreur de connexion.') }
    setLoadingAI(false)
  }

  function saveProno() {
    onSaveProno(matchId, match.team1, match.team2, ph, pa)
    setShowProno(false)
  }

  return (
    <div className={`match-card ${isUpcoming ? 'is-upcoming' : ''}`}>
      <div className="match-top">
        <span className={`badge ${isUpcoming ? 'badge-soon' : 'badge-fin'}`}>
          {isUpcoming ? (match.time ? match.time.replace(' UTC-4','').replace(' UTC-5','').replace(' UTC-6','').replace(' UTC-7','') : 'À venir') : 'Terminé'}
        </span>
        <span className="match-info">{match.group || match.round} · {match.ground}</span>
      </div>

      <div className="match-teams">
        <div className="team">
          <Flag country={match.team1} size="md" />
          <span className="team-name">{match.team1}</span>
        </div>
        <div className="score-center">
          {isUpcoming
            ? <span className="score-vs">vs</span>
            : <span className="score-num">{hs} - {as_}</span>
          }
        </div>
        <div className="team">
          <Flag country={match.team2} size="md" />
          <span className="team-name">{match.team2}</span>
        </div>
      </div>

      <div className="prob-bar">
        <div className="pb-h" style={{ flex: homeP }} />
        <div className="pb-d" style={{ flex: drawP }} />
        <div className="pb-a" style={{ flex: awayP }} />
      </div>
      <div className="prob-labels">
        <span className="prob-lbl">{match.team1.split(' ')[0]} <span>{homeP}%</span></span>
        <span className="prob-lbl">Nul <span>{drawP}%</span></span>
        <span className="prob-lbl">{match.team2.split(' ')[0]} <span>{awayP}%</span></span>
      </div>

      <div className="card-actions">
        <button className="btn-ai" onClick={askAI} disabled={loadingAI}>
          <i className="ti ti-brain" aria-hidden="true" />
          {loadingAI ? 'Analyse...' : 'Analyse IA'}
        </button>
        {isUpcoming && (
          <button
            className={`btn-prono ${prono ? 'done' : ''}`}
            onClick={() => !prono && setShowProno(v => !v)}
          >
            <i className="ti ti-target" aria-hidden="true" />
            {prono ? `${prono.hs} - ${prono.as}` : 'Mon prono'}
          </button>
        )}
      </div>

      {loadingAI && (
        <div className="ai-loading">
          <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
          <span>L'IA analyse le match...</span>
        </div>
      )}
      {analysis && <div className="ai-result">{analysis}</div>}

      {showProno && (
        <div className="prono-form">
          <p className="prono-form-title">Ton pronostic</p>
          <div className="score-inputs">
            <div className="score-input-wrap">
              <Flag country={match.team1} size="sm" />
              <input type="number" className="score-input" min={0} max={20} value={ph} onChange={e => setPh(e.target.value)} />
            </div>
            <span className="score-sep">-</span>
            <div className="score-input-wrap">
              <Flag country={match.team2} size="sm" />
              <input type="number" className="score-input" min={0} max={20} value={pa} onChange={e => setPa(e.target.value)} />
            </div>
          </div>
          <button className="btn-save" onClick={saveProno}>Enregistrer</button>
        </div>
      )}
    </div>
  )
}
