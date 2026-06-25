import { useState } from 'react'
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
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚽</div>
          <div className="auth-logo-name">MatchDay26</div>
          <div className="auth-logo-sub">USA · Canada · Mexique 2026</div>
        </div>

        <div className="auth-tabs">
          {[['login', 'Connexion'], ['signup', 'Inscription']].map(([m, label]) => (
            <button
              key={m}
              className={`auth-tab ${mode === m ? 'active' : ''}`}
              onClick={() => { setMode(m); setError(null) }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="auth-fields">
          {mode === 'signup' && (
            <input
              className="auth-input"
              placeholder="Ton pseudo"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <div className="auth-error">{error}</div>}
          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}