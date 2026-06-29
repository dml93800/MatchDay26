import { useState, useEffect } from 'react'
import { getFlagUrl } from '../lib/utils'

export default function MatchDetail({ match, onClose }) {
  const [activeTab, setActiveTab] = useState('resume')
  const [stats, setStats] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)

  const hs = match.score?.ft[0]
  const as_ = match.score?.ft[1]
  const flag1 = getFlagUrl(match.team1)
  const flag2 = getFlagUrl(match.team2)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch(`/api/match-stats?team1=${encodeURIComponent(match.team1)}&team2=${encodeURIComponent(match.team2)}&date=${match.date}`)
      const data = await res.json()
      setStats(data)
    } catch {}
    setLoadingStats(false)
  }

  async function generateAnalysis() {
    setLoadingAI(true)
    try {
      const goals = [...(match.goals1||[]).map(g => `${g.name} (${g.minute}' - ${match.team1})`), ...(match.goals2||[]).map(g => `${g.name} (${g.minute}' - ${match.team2})`)]
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1: match.team1,
          team2: match.team2,
          score: `${hs}-${as_}`,
          type: 'summary',
          goals: goals.join(', '),
          group: match.group,
          ground: match.ground
        })
      })
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch {}
    setLoadingAI(false)
  }

  const homeStats = stats?.statistics?.[0]?.statistics || []
  const awayStats = stats?.statistics?.[1]?.statistics || []

  function getStat(arr, type) {
    return arr.find(s => s.type === type)?.value || 0
  }

  const statItems = [
    { label: 'Possession', home: getStat(homeStats, 'Ball Possession'), away: getStat(awayStats, 'Ball Possession'), isPercent: true },
    { label: 'Tirs', home: getStat(homeStats, 'Total Shots'), away: getStat(awayStats, 'Total Shots') },
    { label: 'Tirs cadrés', home: getStat(homeStats, 'Shots on Goal'), away: getStat(awayStats, 'Shots on Goal') },
    { label: 'Corners', home: getStat(homeStats, 'Corner Kicks'), away: getStat(awayStats, 'Corner Kicks') },
    { label: 'Fautes', home: getStat(homeStats, 'Fouls'), away: getStat(awayStats, 'Fouls') },
    { label: 'Cartons jaunes', home: getStat(homeStats, 'Yellow Cards'), away: getStat(awayStats, 'Yellow Cards') },
    { label: 'Cartons rouges', home: getStat(homeStats, 'Red Cards'), away: getStat(awayStats, 'Red Cards') },
    { label: 'Hors-jeux', home: getStat(homeStats, 'Offsides'), away: getStat(awayStats, 'Offsides') },
  ]

  const allGoals = [
    ...(match.goals1||[]).map(g => ({ ...g, team: match.team1, flag: flag1 })),
    ...(match.goals2||[]).map(g => ({ ...g, team: match.team2, flag: flag2 })),
  ].sort((a, b) => parseInt(a.minute) - parseInt(b.minute))

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)', zIndex:200, overflowY:'auto', maxWidth:480, margin:'0 auto' }}>
      {/* HEADER */}
      <div style={{ position:'sticky', top:0, background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10, zIndex:10 }}>
        <button onClick={onClose} style={{ background:'transparent', border:'none', color:'var(--text2)', fontSize:22, cursor:'pointer', padding:'0 4px' }}>←</button>
        <span style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>{match.group || match.round} · {match.ground}</span>
      </div>

      {/* SCORE HERO */}
      <div style={{ padding:'24px 16px 16px', textAlign:'center' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            {flag1 && <img src={flag1} alt={match.team1} style={{ width:52, height:35, borderRadius:6, objectFit:'cover' }} />}
            <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{match.team1}</span>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:'#fff', letterSpacing:4, lineHeight:1 }}>{hs} - {as_}</div>
            <div style={{ fontSize:11, color:'var(--green)', fontWeight:600, marginTop:4 }}>Terminé</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            {flag2 && <img src={flag2} alt={match.team2} style={{ width:52, height:35, borderRadius:6, objectFit:'cover' }} />}
            <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{match.team2}</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 16px' }}>
        {[['resume','Résumé'],['stats','Statistiques']].map(([key,label]) => (
          <button key={key} onClick={() => { setActiveTab(key); if(key==='resume' && !analysis) generateAnalysis() }}
            style={{ flex:1, padding:'10px', background:'transparent', border:'none', borderBottom:`2px solid ${activeTab===key?'var(--green)':'transparent'}`, color:activeTab===key?'var(--green)':'var(--text3)', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* RESUME TAB */}
      {activeTab === 'resume' && (
        <div style={{ padding:16 }}>
          {/* TIMELINE DES BUTS */}
          {allGoals.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>⚽ Buts</div>
              {allGoals.map((g, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:'var(--green)', width:36, textAlign:'center' }}>{g.minute}'</span>
                  {g.flag && <img src={g.flag} alt={g.team} style={{ width:24, height:16, borderRadius:2, objectFit:'cover' }} />}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'#fff', fontWeight:500 }}>{g.name}{g.penalty?' (pen.)':''}{g.owngoal?' (c.s.c)':''}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{g.team}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ANALYSE IA */}
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>🧠 Analyse du match</div>
          {loadingAI && (
            <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text3)', fontSize:13 }}>
              <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span> L'IA rédige le résumé...
            </div>
          )}
          {analysis && (
            <div style={{ background:'rgba(0,196,106,0.06)', border:'1px solid var(--green-border)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'var(--text2)', lineHeight:1.8 }}>
              {analysis}
            </div>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ padding:16 }}>
          {loadingStats && <div style={{ textAlign:'center', color:'var(--text3)', padding:'2rem', fontSize:13 }}>Chargement des stats...</div>}
          {!loadingStats && !stats?.statistics?.length && (
            <div style={{ textAlign:'center', color:'var(--text3)', padding:'2rem', fontSize:13 }}>
              Stats non disponibles pour ce match
            </div>
          )}
          {!loadingStats && stats?.statistics?.length > 0 && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {flag1 && <img src={flag1} alt={match.team1} style={{ width:24, height:16, borderRadius:2, objectFit:'cover' }} />}
                  <span style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{match.team1}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{match.team2}</span>
                  {flag2 && <img src={flag2} alt={match.team2} style={{ width:24, height:16, borderRadius:2, objectFit:'cover' }} />}
                </div>
              </div>
              {statItems.map(({ label, home, away, isPercent }) => {
                const h = parseInt(home) || 0
                const a = parseInt(away) || 0
                const total = h + a || 1
                const hPct = Math.round(h / total * 100)
                const aPct = 100 - hPct
                return (
                  <div key={label} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:'#fff' }}>{home}{isPercent?'':''}</span>
                      <span style={{ fontSize:11, color:'var(--text3)', alignSelf:'center' }}>{label}</span>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:'#fff' }}>{away}{isPercent?'':''}</span>
                    </div>
                    <div style={{ display:'flex', height:4, borderRadius:2, overflow:'hidden', gap:2 }}>
                      <div style={{ flex:hPct, background:'var(--green)', borderRadius:2 }} />
                      <div style={{ flex:aPct, background:'var(--blue)', borderRadius:2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}