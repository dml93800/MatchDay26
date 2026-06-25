import { useState, useEffect } from 'react'
import Head from 'next/head'
import MatchCard from '../components/MatchCard'
import Flag from '../components/Flag'
import Bracket from '../components/Bracket'
import { getTopScorers, getGroupStandings, calcPoints } from '../lib/utils'

export default function Home() {
  const [tab, setTab] = useState('matchs')
  const [matches, setMatches] = useState([])
  const [pronos, setPronos] = useState({})
  const [username, setUsername] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')
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
  const todayMatches = upcomingMatches.slice(0, 8)
  const recentMatches = finishedMatches.slice(-6).reverse()
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
    <>
      <Head>
        <title>MatchDay26 — Coupe du Monde 2026</title>
  return (
    <>
      <Head>
        <title>MatchDay26 — Coupe du Monde 2026</title>
        <meta name="description" content="Scores, pronos et prédictions IA — Coupe du Monde 2026" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d0f14" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app">
        <div className="topbar">
          <div className="topbar-logo">
            <div className="topbar-icon">🏆</div>
            <div>
              <div className="topbar-name">MatchDay26</div>
              <div className="topbar-sub">USA · Canada · Mexique</div>
            </div>
          </div>
          <div className="live-pill">
            <div className="live-dot" />
            <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 8, border: '1px solid #1e2330', background: 'transparent', color: '#4a5168', fontSize: 11, cursor: 'pointer' }}>
              Déconnexion
            </button>
          </div>
        </div>

        <nav className="nav">
          {[['matchs','ti-ball-football','Matchs'],['pronos','ti-target','Pronos'],['groupes','ti-layout-grid','Groupes'],['bracket','ti-tournament','Bracket'],['stats','ti-chart-bar','Stats']].map(([key,icon,label]) => (
            <button key={key} className={`nav-btn ${tab===key?'active':''}`} onClick={() => setTab(key)}>
              <i className={`ti ${icon}`} aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>

        <div className="content">

          {/* MATCHS */}
          {tab === 'matchs' && (
            <>
              <div className="stat-row">
                <div className="stat-card"><div className="stat-val">{finishedMatches.length || '—'}</div><div className="stat-lbl">Matchs joués</div></div>
                <div className="stat-card"><div className="stat-val">{totalGoals || '—'}</div><div className="stat-lbl">Buts marqués</div></div>
                <div className="stat-card"><div className="stat-val">{avgGoals}</div><div className="stat-lbl">Buts / match</div></div>
              </div>

              {loading && <div className="empty-state"><i className="ti ti-loader" aria-hidden="true" />Chargement...</div>}

              {!loading && todayMatches.length > 0 && (
                <>
                  <div className="section-label"><i className="ti ti-clock" aria-hidden="true" /> À venir</div>
                  {todayMatches.map((m, i) => (
                    <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />
                  ))}
                </>
              )}

              {!loading && recentMatches.length > 0 && (
                <>
                  <div className="section-label"><i className="ti ti-checks" aria-hidden="true" /> Résultats récents</div>
                  {recentMatches.map((m, i) => (
                    <MatchCard key={i} match={m} prono={pronos[`${m.team1}-${m.team2}-${m.date}`]} onSaveProno={saveProno} />
                  ))}
                </>
              )}

              {topScorers.length > 0 && (
                <>
                  <div className="section-label"><i className="ti ti-star" aria-hidden="true" /> Top buteurs</div>
                  <div className="scorers-card">
                    {topScorers.map((s, i) => (
                      <div className="scorer-row" key={i}>
                        <span className={`scorer-rank ${i === 0 ? 'gold' : ''}`}>{i + 1}</span>
                        <Flag country={s.team} size="sm" />
                        <div className="scorer-info">
                          <div className="scorer-name">{s.name}</div>
                          <div className="scorer-team">{s.team}</div>
                        </div>
                        <span className="scorer-goals">{s.goals}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* PRONOS */}
          {tab === 'pronos' && (
            <>
              {!username && (
                <div className="username-card">
                  <h3>Rejoins le classement</h3>
                  <p>Entre ton pseudo pour suivre tes points</p>
                  <div className="username-input-row">
                    <input
                      className="username-input"
                      type="text"
                      placeholder="Ton pseudo..."
                      maxLength={20}
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && joinLeaderboard()}
                    />
                    <button className="btn-join" onClick={joinLeaderboard}>Rejoindre</button>
                  </div>
                </div>
              )}

              {username && (
                <div className="user-summary">
                  <div>
                    <div className="user-pts-big">{totalPts}</div>
                    <div className="user-pts-lbl">points</div>
                  </div>
                  <div>
                    <div className="user-name">{username}</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{pronoList.length} prono{pronoList.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {!pronoList.length ? (
                <div className="empty-state">
                  <i className="ti ti-target" aria-hidden="true" />
                  Pas encore de prono — va dans Matchs pour en faire !
                </div>
              ) : (
                <>
                  <div className="section-label"><i className="ti ti-target" aria-hidden="true" /> Mes pronos</div>
                  {pronoList.map(([id, p]) => {
                    const m = matches.find(m => `${m.team1}-${m.team2}-${m.date}` === id)
                    const realHs = m?.score?.ft[0] ?? null
                    const realAs = m?.score?.ft[1] ?? null
                    const pts = calcPoints(p, { hs: realHs, as: realAs })
                    return (
                      <div key={id} className="prono-card">
                        <div className="prono-card-header">
                          <span className="prono-match">{p.team1} vs {p.team2}</span>
                          <span className={`pts-badge ${pts === 3 ? 'pts-3' : pts === 1 ? 'pts-1' : pts === 0 ? 'pts-0' : 'pts-pending'}`}>
                            {pts === 3 ? '✓ 3 pts' : pts === 1 ? '~ 1 pt' : pts === 0 ? '✗ 0 pt' : 'En attente'}
                          </span>
                        </div>
                        <div className="prono-detail">
                          <span>Mon prono : <span className="prono-score">{p.hs} - {p.as}</span></span>
                          {realHs !== null && <span style={{marginLeft:'auto'}}>Résultat : <strong>{realHs}-{realAs}</strong></span>}
                        </div>
                      </div>
                    )
                  })}
                  <div className="section-label"><i className="ti ti-trophy" aria-hidden="true" /> Classement</div>
                  <div className="leaderboard-card">
                    <div className="lb-row">
                      <span className="lb-pos">1</span>
                      <span className="lb-name">{username || 'Toi'}</span>
                      <span className="lb-detail">{pronoList.length} prono{pronoList.length > 1 ? 's' : ''}</span>
                      <span className="lb-pts">{totalPts} pts</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* GROUPES */}
          {tab === 'groupes' && (
            <>
              {Object.entries(groupStandings).length === 0 ? (
                <div className="empty-state"><i className="ti ti-loader" aria-hidden="true" />Chargement...</div>
              ) : (
                Object.entries(groupStandings).sort(([a],[b]) => a.localeCompare(b)).map(([group, teams]) => (
                  <div key={group} className="group-block">
                    <div className="section-label"><i className="ti ti-layout-grid" aria-hidden="true" /> {group}</div>
                    <table className="standings-table">
                      <thead>
                        <tr><th>#</th><th>Équipe</th><th>J</th><th>G</th><th>N</th><th>P</th><th>Bf</th><th>Bc</th><th>Pts</th></tr>
                      </thead>
                      <tbody>
                        {teams.map((t, i) => (
                          <tr key={t.name} className={i < 2 ? 'qualified' : ''}>
                            <td>{i + 1}</td>
                            <td>
                              <Flag country={t.name} size="sm" />
                              {t.name}
                            </td>
                            <td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
                            <td>{t.gf}</td><td>{t.ga}</td>
                            <td style={{fontWeight:600,color:'var(--text)'}}>{t.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          )}

          {/* STATS */}
          {tab === 'stats' && (
            <>
              <div className="stat-row">
                <div className="stat-card"><div className="stat-val">{finishedMatches.length}</div><div className="stat-lbl">Matchs joués</div></div>
                <div className="stat-card"><div className="stat-val">{totalGoals}</div><div className="stat-lbl">Buts marqués</div></div>
                <div className="stat-card"><div className="stat-val">{avgGoals}</div><div className="stat-lbl">Buts / match</div></div>
              </div>

              {(() => {
                let hw=0,d=0,aw=0
                finishedMatches.forEach(m => {
                  const h=m.score.ft[0],a=m.score.ft[1]
                  if(h>a)hw++; else if(h<a)aw++; else d++
                })
                const tot=hw+d+aw
                return tot > 0 && (
                  <>
                    <div className="section-label"><i className="ti ti-chart-bar" aria-hidden="true" /> Répartition des résultats</div>
                    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px'}}>
                      {[['Victoire domicile',hw,'var(--green)'],['Match nul',d,'var(--text3)'],['Victoire extérieur',aw,'var(--blue)']].map(([lbl,val,col])=>(
                        <div key={lbl} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                          <span style={{fontSize:12,color:'var(--text2)',width:150}}>{lbl}</span>
                          <div style={{flex:1,height:6,background:'var(--bg3)',borderRadius:3,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${Math.round(val/tot*100)}%`,background:col,borderRadius:3,transition:'width .8s'}}/>
                          </div>
                          <span style={{fontSize:12,color:'var(--text2)',width:36,textAlign:'right'}}>{Math.round(val/tot*100)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}

              {topScorers.length > 0 && (
                <>
                  <div className="section-label"><i className="ti ti-star" aria-hidden="true" /> Top buteurs</div>
                  <div className="scorers-card">
                    {topScorers.map((s,i) => (
                      <div className="scorer-row" key={i}>
                        <span className={`scorer-rank ${i===0?'gold':''}`}>{i+1}</span>
                        <Flag country={s.team} size="sm" />
                        <div className="scorer-info">
                          <div className="scorer-name">{s.name}</div>
                          <div className="scorer-team">{s.team}</div>
                        </div>
                        <span className="scorer-goals">{s.goals}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {/* BRACKET */}
          {tab === 'bracket' && (
            <>
              <div className="section-label"><i className="ti ti-tournament" aria-hidden="true" /> Phases finales</div>
              <Bracket matches={matches} />
            </>
          )}

        </div>
      </div>
    </>
  )
}