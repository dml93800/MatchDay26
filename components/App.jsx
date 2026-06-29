import Auth from './Auth'
import MatchCard from './MatchCard'

export default function App() {
  return (
    <div style={{ color: 'white', padding: 20, background: '#050508', minHeight: '100vh' }}>
      <h1>Auth : {Auth ? '✅' : '❌'}</h1>
      <h1>MatchCard : {MatchCard ? '✅' : '❌'}</h1>
    </div>
  )
}