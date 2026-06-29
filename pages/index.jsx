import dynamic from 'next/dynamic'
import Head from 'next/head'

const App = dynamic(() => import('../components/App'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>MatchDay26 — Coupe du Monde 2026</title>
        <meta name="description" content="Scores, pronos et prédictions IA — Coupe du Monde 2026" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050508" />
      </Head>
      <App />
    </>
  )
}