# Pirate Plunder 🎲⚓

A real-time multiplayer dice poker game featuring sophisticated AI opponents and strategic role-based gameplay.

## 🎮 Game Overview

**Pirate Plunder** is a dice-based card game where players compete for ship roles (Ship, Captain, Crew) using five dice across three rounds. The twist: roles are awarded to whoever has the **most** of each die value (6s for Ship, 5s for Captain, 4s for Crew), with unique role vacancy rules and a cargo system that can dramatically alter payouts.

### Key Features
- 🎯 **Role-Based Strategy**: Win by having the most 6s (Ship), 5s (Captain), or 4s (Crew)
- 💰 **Dynamic Payouts**: Ship gets 50%, Captain 30%, Crew 20% with vacancy redistribution rules  
- 📦 **Cargo Twist**: Non-role players use 1s/2s/3s to trigger special payout effects
- 🎭 **Public/Private Dice**: Lock more dice than shown to opponents for strategic advantage
- 🤖 **4 AI Personalities**: From aggressive Reckless Roger to conservative Careful Kate
- ⚡ **Real-time Multiplayer**: Socket.io-powered game state synchronization
- 🎨 **Enhanced UX**: Animated showdown ceremony, visual dice indicators, responsive design

## 🚀 Quick Start

### Requirements
- Node.js 18+
- npm

### Development Setup

#### Option 1: One-Command Start (Recommended)
```bash
# Install dependencies and start both servers
npm install
npm run dev        # Mac/Linux  
npm run dev:win    # Windows
```

> First time on a new machine? Copy `.npmrc.example` to `~/.npmrc` and run `npm login --scope=@pirate --registry http://registry.tail751d97.ts.net:4873/` so the private packages resolve once they ship.

#### Option 2: Manual Setup
```bash
# Backend (Terminal 1)
npm install
npm run dev --workspace @pirate/game-pirate-plunder-backend   # Server at http://localhost:3001

# Frontend (Terminal 2) 
npm run dev --workspace @pirate/game-pirate-plunder-frontend  # App at http://localhost:5173
```

### Environment Configuration
- **Backend URL**: Set `VITE_BACKEND_URL` in `games/pirate-plunder/frontend/.env.local` (defaults to `http://localhost:3001`)
- **Auto Port Selection**: Backend automatically selects next available port if 3001 is busy
- **CORS**: Enabled for development (`origin: '*'`)

## 🤖 AI System

The game features four distinct AI personalities with sophisticated decision-making:

### AI Profiles (`games/pirate-plunder/backend/src/ai-profiles.json`)
- **🔥 Reckless Roger**: Aggressive risk-taker (85% risk tolerance, 25% bluff rate)
- **🧠 Calculating Clara**: Tight-aggressive strategist (65% risk, 10% bluff)
- **🍀 Lucky Luke**: Loose-passive player (90% risk, 5% bluff, 15% mistakes)
- **🛡️ Careful Kate**: Conservative player (40% risk, 2% bluff)

### AI Intelligence Features
- **Hand Strength Evaluation**: 0-6 scale considering role potential and game phase
- **Role Priority Systems**: Each AI targets different role combinations
- **Behavioral Variance**: ±10% randomization prevents robotic play patterns
- **Strategic Bluffing**: Profile-based bluff frequencies with mistake simulation
- **Advanced Dice Locking**: Targets highest-priority achievable roles

## 🎯 Game Flow

1. **Lobby Phase**: 2-8 players, auto-fill with AI to 4 minimum
2. **3 Rounds of Play**: Roll → Lock → Bet (with final Roll4 after Lock3)
3. **Role Assignment**: Most dice wins each role (ties = vacant roles)
4. **Cargo Effects**: Non-role players use 1s/2s/3s for special effects
5. **Payout**: Distribute pot based on roles and cargo modifications
6. **Showdown Ceremony**: Animated results with sequential role reveals

## 🛠️ Technical Stack

- **Backend**: Express.js + Socket.io + TypeScript (Port 3001)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (Port 5173)
- **Real-time**: Socket.io for game state synchronization
- **Testing**: Jest (backend) + Vitest (frontend) + Integration tests
- **Development**: Hot reload with nodemon + Vite HMR

## 🧪 Testing & Development

### Testing Commands
```bash
npm run test:all        # Full test suite (unit + integration + linting)
npm run test:backend    # Backend unit tests only
npm run test:frontend   # Frontend component tests only  
npm run test:integration # Automated game flow testing
npm run publish:game -- 1.4.0  # Publish build artifacts to OVH (requires credentials)
```

### Debug Tools
- **Debug Dashboard**: Open `debug-client.html` for real-time game state monitoring
- **Integration Testing**: `backend/scripts/test-game-flow.js` simulates full games
- **TypeScript Validation**: Always run `npm exec --workspace @pirate/game-pirate-plunder-backend tsc -- --noEmit` and `npm exec --workspace @pirate/game-pirate-plunder-frontend tsc -- --noEmit` before committing

### Development Workflow
1. Make changes
2. Verify TypeScript compilation passes
3. Run relevant test suites
4. Test with debug dashboard
5. Validate with integration tests

## 📚 Documentation

- **📋 [CLAUDE.md](./CLAUDE.md)**: Development guidance and testing workflows
- **🏗️ [Architecture](./docs/architecture.md)**: Technical system overview  
- **🎮 [Game Design](./docs/gdd.md)**: Complete game rules and mechanics
- **🔄 [State Machine](./docs/state_machine_diagram.md)**: Game phase flow diagrams

## 🎪 Recent Improvements

### v2.0 Features (Latest)
- ✅ **Enhanced AI System**: 4 distinct personality profiles with strategic decision making
- ✅ **Roll4 Phase**: Proper Lock → Roll → Bet flow for final round
- ✅ **Public/Private Dice**: Strategic dice visibility system with visual indicators
- ✅ **Showdown Ceremony**: Extended animated results with sequential role reveals
- ✅ **UI Improvements**: Better positioning, visual feedback, and responsive design
- ✅ **Game Logic Fixes**: Correct "most dice wins" role assignment with vacancy rules

### Architecture Highlights
- 🔄 **Real-time State Sync**: Instant game state updates across all clients
- 🎭 **Personality-Driven AI**: Each AI has unique risk tolerance, bluff patterns, and role priorities
- 🎯 **Strategic Depth**: Public/private dice mechanics add bluffing and information warfare
- 🎨 **Polished UX**: Smooth animations, clear visual feedback, and intuitive controls

---

**Ready to sail the high seas and plunder some treasure? Start your engines with `npm run dev`! ⚓🎲**
