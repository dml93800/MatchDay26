import { useState, useEffect } from 'react'
import MatchCard from './MatchCard'
import Bracket from './Bracket'
import Auth from './Auth'
import { supabase } from '../lib/supabase'
import { getTopScorers, getGroupStandings, calcPoints, getFlagUrl } from '../lib/utils'

export default function App() {
  const [tab, setTab] = useState('home')
  const [matches, setMatches] = useState([])
  const [pronos, setPronos] = useState({})
  const [username, setUsername] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setAuthChecked(true)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    try {
      const saved = localStorage.getItem('md26_pronos')
      if (saved) setPronos(JSON.parse(saved))
      const name = localStorage.getItem('md26_username')
      if (name) setUsername(name)
    } catch {}
    fetchMatches()
    const interval = setInterval(fetchMatches, 120000)
    return () => clearInterval(interval)
  }, [])

  async function fetchMatches() {
    try {
      const res = await fetch('/api/matches')
      const data = await res.json()
      setMatches(data.matches || [])
    } catch {}
    setLoading(false)
  }

  function saveProno(id, t1, t2, hs, as_) {
    const updated = { ...pronos, [id]: { hs, as: as_, team1: t1, team2: t2, time: Date.now() } }
    setPronos(updated)
    try { localStorage.setItem('md26_pronos', JSON.stringify(updated)) } catch {}
  }

  function joinLeaderboard() {
    const name = usernameInput.trim()
    if (name.length < 2) return
    setUsername(name)
    try { localStorage.setItem('md26_username', name) } catch {}
  }

  const finishedMatches = matches.filter(m => m.score)
  const upcomingMatches = matches.filter(m => !m.score)
  const heroMatch = upcomingMatches[0] || finishedMatches[finishedMatches.length - 1]
  const otherUpcoming = upcomingMatches.slice(1, 6)
  const recentMatches = finishedMatches.slice(-5).reverse()
  const topScorers = getTopScorers(finishedMatches)
  const groupStandings = getGroupStandings(finishedMatches)
  const totalGoals = finishedMatches.reduce((acc, m) => acc + m.score.ft[0] + m.score.ft[1], 0)
  const avgGoals = finishedMatches.length ? (totalGoals / finishedMatches.length).toFixed(1) : '—'
  const pronoList = Object.entries(pronos)
  const totalPts = pronoList.reduce((acc, [id, p]) => {
    const m = matches.find(m => `${m.team1}-${m.team2}-${m.date}` === id)
    if (!m || !m.score) return acc
    const pts = calcPoints(p, { hs: m.score.ft[0], as: m.score.ft[1] })
    return acc + (pts || 0)
  }, 0)

  if (!authChecked) return null
  if (!user) return <Auth onLogin={setUser} />

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-name">MatchDay26</span>
        <div className="topbar-right">
          <div className="live-pill">
            <div className="live-dot" />
            <span className="live-text">LIVE</span>
          </div>
          <button className="btn-deconnect" onClick={() => supabase.auth.signOut().then(() => setUser(null))}>
            Déco
          </button>
        </div>
      </div>

      {tab === 'home' && (
        <>
          {heroMatch && (
            <MatchCard match={heroMatch} prono={pronos[`${heroMatch.team1}-${heroMatch.team2}-${heroMatch.date}`]} onSaveProno={saveProno} isHero={true} />
          )}
          {otherUpcoming.length > 0 && (
            <div className="section">
              <div className="section-header"><span className="section-title">À venir</span></div>
              {otherUpcoming.map((m, i) => <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />)}
            </div>
          )}
          {recentMatches.length > 0 && (
            <div className="section">
              <div className="section-header"><span className="section-title">Résultats récents</span></div>
              {recentMatches.map((m, i) => <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />)}
            </div>
          )}
          {topScorers.length > 0 && (
            <div className="section">
              <div className="section-header"><span className="section-title">Top buteurs</span></div>
              {topScorers.map((s, i) => {
                const flag = getFlagUrl(s.team)
                return (
                  <div className="scorer-item" key={i}>
                    <span className={`scorer-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}`}>{i+1}</span>
                    {flag && <img className="scorer-flag-sm" src={flag} alt={s.team} />}
                    <div className="scorer-info"><div className="scorer-name">{s.name}</div><div className="scorer-team">{s.team}</div></div>
                    <div><div className="scorer-goals">{s.goals}</div><div className="scorer-goals-lbl">buts</div></div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'matchs' && (
        <>
          <div className="stat-grid">
            <div className="stat-card" style={{'--accent':'var(--green)'}}><div className="stat-val">{finishedMatches.length||'—'}</div><div className="stat-lbl">Joués</div></div>
            <div className="stat-card" style={{'--accent':'var(--gold)'}}><div className="stat-val">{totalGoals||'—'}</div><div className="stat-lbl">Buts</div></div>
            <div className="stat-card" style={{'--accent':'var(--blue)'}}><div className="stat-val">{avgGoals}</div><div className="stat-lbl">Moy.</div></div>
          </div>
          {loading && <div className="empty-state"><i className="ti ti-loader" aria-hidden="true"/>Chargement...</div>}
          {upcomingMatches.length > 0 && (
            <div className="section">
              <div className="section-header"><span className="section-title">À venir</span></div>
              {upcomingMatches.slice(0,10).map((m,i) => <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />)}
            </div>
          )}
          {finishedMatches.length > 0 && (
            <div className="section">
              <div className="section-header"><span className="section-title">Résultats</span></div>
              {finishedMatches.slice().reverse().map((m,i) => <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />)}
            </div>
          )}
        </>
      )}

      {tab === 'pronos' && (
        <>
          <div className="prono-header"><h2>Mes Pronos</h2><p>3 pts score exact · 1 pt bon vainqueur</p></div>
          {!username && (
            <div className="username-card">
              <h3>Rejoins le classement</h3>
              <p>Entre ton pseudo pour suivre tes points</p>
              <div className="username-input-row">
                <input className="username-input" type="text" placeholder="Ton pseudo..." maxLength={20} value={usernameInput} onChange={e => setUsernameInput(e.target.value)} onKeyDown={e => e.key==='Enter' && joinLeaderboard()} />
                <button className="btn-join" onClick={joinLeaderboard}>Go</button>
              </div>
            </div>
          )}
          {username && (
            <div className="user-summary">
              <div><div className="user-pts-big">{totalPts}</div><div className="user-pts-lbl">points</div></div>
              <div><div className="user-name">{username}</div><div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{pronoList.length} prono{pronoList.length>1?'s':''}</div></div>
            </div>
          )}
          {!pronoList.length ? (
            <div className="empty-state"><i className="ti ti-target" aria-hidden="true"/>Fais tes pronos depuis l'onglet Matchs !</div>
          ) : (
            <>
              {pronoList.map(([id, p]) => {
                const m = matches.find(m => `${m.team1}-${m.team2}-${m.date}` === id)
                const realHs = m?.score?.ft[0] ?? null
                const realAs = m?.score?.ft[1] ?? null
                const pts = calcPoints(p, { hs: realHs, as: realAs })
                return (
                  <div key={id} className="prono-card">
                    <div className="prono-card-header">
                      <span className="prono-match">{p.team1} vs {p.team2}</span>
                      <span className={`pts-badge ${pts===3?'pts-3':pts===1?'pts-1':pts===0?'pts-0':'pts-pending'}`}>
                        {pts===3?'✓ 3 pts':pts===1?'~ 1 pt':pts===0?'✗ 0 pt':'En attente'}
                      </span>
                    </div>
                    <div className="prono-detail">
                      <span>Mon prono : <span className="prono-score">{p.hs} - {p.as}</span></span>
                      {realHs !== null && <span style={{marginLeft:'auto'}}>Résultat : <strong>{realHs}-{realAs}</strong></span>}
                    </div>
                  </div>
                )
              })}
              <div style={{margin:'16px 16px 0'}}><div className="section-header"><span className="section-title">Classement</span></div></div>
              <div className="leaderboard-card">
                <div className="lb-row">
                  <span className="lb-pos">1</span>
                  <span className="lb-name">{username||'Toi'}</span>
                  <span className="lb-detail">{pronoList.length} prono{pronoList.length>1?'s':''}</span>
                  <span className="lb-pts">{totalPts} pts</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'bracket' && (
        <>
          <div style={{padding:'16px 16px 8px'}}><div className="section-header"><span className="section-title">Phases finales</span></div></div>
          <Bracket matches={matches} />
        </>
      )}

      {tab === 'profil' && (
        <div className="section">
          <div className="section-header"><span className="section-title">Mon profil</span></div>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px',textAlign:'center',marginBottom:16}}>
            <div style={{width:60,height:60,borderRadius:'50%',background:'var(--green-dim)',border:'2px solid var(--green-border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:24}}>⚽</div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:4}}>{username||user?.email}</div>
            <div style={{fontSize:12,color:'var(--text3)'}}>{user?.email}</div>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:16}}>
              <div style={{textAlign:'center'}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'var(--green)'}}>{totalPts}</div><div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px'}}>Points</div></div>
              <div style={{textAlign:'center'}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'#fff'}}>{pronoList.length}</div><div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px'}}>Pronos</div></div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} style={{width:'100%',padding:'12px',borderRadius:10,border:'1px solid rgba(255,68,68,0.3)',background:'rgba(255,68,68,0.08)',color:'#ff6666',fontSize:14,fontWeight:600}}>
            Se déconnecter
          </button>
        </div>
      )}

      <nav className="bottom-nav">
        {[['home','ti-home','Accueil'],['matchs','ti-ball-football','Matchs'],['pronos','ti-target','Pronos'],['bracket','ti-tournament','Bracket'],['profil','ti-user','Profil']].map(([key,icon,label]) => (
          <button key={key} className={`bnav-btn ${tab===key?'active':''}`} onClick={() => setTab(key)}>
            <i className={`ti ${icon}`} aria-hidden="true"/><span className="bnav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}