import Auth from './Auth'

export default function App() {
  return (
    <div style={{ color: 'white', padding: 20, background: '#050508', minHeight: '100vh' }}>
      <h1>Auth importé : {Auth ? '✅ OK' : '❌ undefined'}</h1>
    </div>
  )
}