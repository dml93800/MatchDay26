import { useState } from 'react'
import { getFlagUrl } from '../lib/utils'
import { useState, useEffect } from 'react'
const [stadiumImg, setStadiumImg] = useState(null)

useEffect(() => {
  const query = match.ground 
    ? `football stadium ${match.ground}` 
    : 'football stadium night'
  fetch(`/api/stadium?query=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .then(data => { if (data.url) setStadiumImg(data.url) })
    .catch(() => {})
}, [match.ground])

export default function MatchCard({ match, prono, onSaveProno, isHero = false }) {
  const [showProno, setShowProno] = useState(false)
  const [ph, setPh] = useState(0)
  const [pa, setPa] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [showAI, setShowAI] = useState(false)

  const hasScore = !!match.score
  const hs = hasScore ? match.score.ft[0] : null
  const as_ = hasScore ? match.score.ft[1] : null
  const isUpcoming = !hasScore
  const matchId = `${match.team1}-${match.team2}-${match.date}`

  const homeP = isUpcoming ? 42 : (hs > as_ ? 58 : hs === as_ ? 32 : 22)
  const drawP = isUpcoming ? 25 : 20
  const awayP = 100 - homeP - drawP

  const flag1 = getFlagUrl(match.team1)
  const flag2 = getFlagUrl(match.team2)
  const stadiumImg = getStadiumImg(match.team1, match.team2)

  async function askAI() {
    setLoadingAI(true)
    setShowAI(true)
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

  if (isHero) {
    return (
      <>
        <div className="hero">
          <img className="hero-img" src={stadiumImg} alt="Stade" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-meta">
              {match.group || match.round} · {match.ground}
            </div>
            <div className="hero-teams">
              <div className="hero-team">
                {flag1 && <img className="hero-flag" src={flag1} alt={match.team1} />}
                <span className="hero-team-name">{match.team1}</span>
              </div>
              <div className="hero-score-block">
                {isUpcoming
                  ? <div className="hero-score-vs">vs</div>
                  : <div className="hero-score">{hs} - {as_}</div>
                }
                <div className="hero-score-status">
                  {isUpcoming ? (match.time?.replace(/ UTC.*/,'') || 'À venir') : 'Terminé'}
                </div>
              </div>
              <div className="hero-team">
                {flag2 && <img className="hero-flag" src={flag2} alt={match.team2} />}
                <span className="hero-team-name">{match.team2}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prob-strip">
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
        </div>

        <div className="action-row">
          <button className="action-btn" onClick={askAI} disabled={loadingAI}>
            <i className="ti ti-brain" aria-hidden="true" />
            {loadingAI ? 'Analyse...' : 'Analyse IA'}
          </button>
          {isUpcoming && (
            <button
              className={`action-btn green ${prono ? 'done' : ''}`}
              onClick={() => !prono && setShowProno(v => !v)}
            >
              <i className="ti ti-target" aria-hidden="true" />
              {prono ? `${prono.hs}-${prono.as}` : 'Mon prono'}
            </button>
          )}
          <button className="action-btn">
            <i className="ti ti-share" aria-hidden="true" />
            Partager
          </button>
        </div>

        {loadingAI && (
          <div className="ai-loading">
            <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
            <span>L'IA analyse...</span>
          </div>
        )}
        {analysis && <div className="ai-result">{analysis}</div>}

        {showProno && (
          <div style={{ margin: '0 16px 8px' }}>
            <div className="prono-form-card">
              <p className="prono-form-title">Ton pronostic — {match.team1} vs {match.team2}</p>
              <div className="score-inputs">
                <div className="score-input-wrap">
                  {flag1 && <img className="score-input-flag" src={flag1} alt={match.team1} />}
                  <input type="number" className="score-input" min={0} max={20} value={ph} onChange={e => setPh(e.target.value)} />
                </div>
                <span className="score-sep">-</span>
                <div className="score-input-wrap">
                  {flag2 && <img className="score-input-flag" src={flag2} alt={match.team2} />}
                  <input type="number" className="score-input" min={0} max={20} value={pa} onChange={e => setPa(e.target.value)} />
                </div>
              </div>
              <button className="btn-save" onClick={saveProno}>Enregistrer</button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="match-item">
      <div className="match-item-flags">
        {flag1 ? <img className="match-item-flag" src={flag1} alt={match.team1} /> : <div className="match-item-flag" />}
        {flag2 ? <img className="match-item-flag" src={flag2} alt={match.team2} /> : <div className="match-item-flag" />}
      </div>
      <div className="match-item-info">
        <div className="match-item-teams">
          <div className="match-item-team">
            <span className={`match-item-name ${hasScore && hs > as_ ? 'winner' : ''}`}>{match.team1}</span>
            {hasScore && <span className={`match-item-score ${hs > as_ ? 'winner' : ''}`}>{hs}</span>}
          </div>
          <div className="match-item-team">
            <span className={`match-item-name ${hasScore && as_ > hs ? 'winner' : ''}`}>{match.team2}</span>
            {hasScore && <span className={`match-item-score ${as_ > hs ? 'winner' : ''}`}>{as_}</span>}
          </div>
        </div>
        <div className="match-item-meta">{match.group || match.round} · {match.ground}</div>
      </div>
      {isUpcoming && <span className="match-badge mb-soon">{match.time?.replace(/ UTC.*/,'') || 'À venir'}</span>}
      {hasScore && <span className="match-badge mb-fin">Terminé</span>}
    </div>
  )
}