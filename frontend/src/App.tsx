// React is automatically imported in Vite React projects
import { AuthProvider, useAuth } from './components/AuthProvider'
import GameApp from './components/GameApp'
import LandingPage from './components/LandingPage'
import { useDiceCollections } from './hooks/useDiceCollections'

function AppContent() {
  const { user, loading } = useAuth()
  useDiceCollections()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return <GameApp />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}