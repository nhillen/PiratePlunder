/**
 * GameRouter - Routes user to selected game after login
 *
 * Flow:
 * 1. User logs in
 * 2. Show GameHub (new platform UI)
 * 3. User selects game
 * 4. Show appropriate game component
 */

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import GameHub from './platform/GameHub'
import GameApp from './GameApp'
import LandingPage from './LandingPage'

export default function GameRouter() {
  const { user, loading } = useAuth()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const handleSelectGame = (gameType: string) => {
    console.log(`🎮 Selected game: ${gameType}`)
    setSelectedGame(gameType)
  }

  const handleBackToSelector = () => {
    setSelectedGame(null)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Show landing page if not authenticated
  if (!user) {
    return <LandingPage />
  }

  // Show game hub if no game selected
  if (!selectedGame) {
    return <GameHub onSelectGame={handleSelectGame} />
  }

  // Route to appropriate game
  switch (selectedGame) {
    case 'pirate-plunder':
      return <GameApp onBackToMenu={handleBackToSelector} />

    case 'flipz':
      return <GameApp gameType="flipz" onBackToMenu={handleBackToSelector} />

    case 'warfaire':
      return <GameApp gameType="warfaire" onBackToMenu={handleBackToSelector} />

    case 'houserules-poker':
      return <GameApp gameType="houserules-poker" onBackToMenu={handleBackToSelector} />

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-emerald-900 flex items-center justify-center">
          <div className="text-white text-xl">Unknown game type</div>
        </div>
      )
  }
}
