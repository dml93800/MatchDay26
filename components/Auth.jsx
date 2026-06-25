import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import { supabase } from '../lib/supabase'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onLogin(data.user)
      } else {
        if (username.length < 2) throw new Error('Pseudo trop court')
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        await supabase.from('profiles').insert({ id: data.user.id, username })
        onLogin(data.user)
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 380, margin: '4rem auto', padding: '0 20px' }}>
      <div style={{ background: '#141720', border: '1px solid #1e2330', borderRadius: 16, padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: '#fff' }}>MatchDay26</div>
          <div style={{ fontSize: 13, color: '#4a5168', marginTop: 4 }}>
            {mode === 'login' ? 'Connecte-toi pour accéder à tes pronos' : 'Crée ton compte gratuitement'}
          </div>
        </div>

        <div style={{ display: 'flex', background: '#0d0f14', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
          {[['login', 'Connexion'], ['signup', 'Inscription']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === m ? '#1a1f2e' : 'transparent',
              color: mode === m ? '#fff' : '#4a5168',
              fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif'
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'signup' && (
            <input
              placeholder="Ton pseudo"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #1e2330', background: '#0d0f14', color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #1e2330', background: '#0d0f14', color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #1e2330', background: '#0d0f14', color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />

          {error && (
            <div style={{ padding: '8px 12px', background: '#ff003318', border: '1px solid #ff003344', borderRadius: 8, fontSize: 12, color: '#ff6666' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '10px', borderRadius: 8, border: 'none', background: '#00c46a',
            color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1, marginTop: 4
          }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}