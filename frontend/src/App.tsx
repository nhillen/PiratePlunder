// React is automatically imported in Vite React projects
import { AuthProvider } from './components/AuthProvider'
import GameRouter from './components/GameRouter'
import { useDiceCollections } from './hooks/useDiceCollections'

export default function App() {
  // Initialize dice collections cache early
  useDiceCollections()

  return (
    <AuthProvider>
      <GameRouter />
    </AuthProvider>
  )
}