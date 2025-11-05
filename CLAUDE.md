# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Development Commands

### Quick Start
```bash
npm run dev          # Start both servers (Mac/Linux)
npm run dev:win      # Start both servers (Windows)
npm run kill-ports   # Kill processes on ports 3001 and 5173
```

### Testing Commands (Run in this order)
```bash
# 1. TypeScript compilation check (MANDATORY before any commit)
npm exec --workspace @pirate/game-pirate-plunder-backend tsc -- --noEmit
npm exec --workspace @pirate/game-pirate-plunder-frontend tsc -- --noEmit

# 2. Unit tests
npm run test:backend    # Backend unit tests (Jest)
npm run test:frontend   # Frontend component tests (Vitest)

# Single test file (backend)
(cd games/pirate-plunder/backend && npx jest path/to/test.test.ts)

# Single test file (frontend)  
(cd games/pirate-plunder/frontend && npx vitest run path/to/test.test.tsx)

# Watch mode for development
(cd games/pirate-plunder/backend && npm run test:watch)  # Jest watch mode
(cd games/pirate-plunder/frontend && npm run test)       # Vitest watch mode

# 3. Integration tests
npm run test:integration # Full game flow testing (requires backend running)

# 4. Full test suite
npm run test:all        # Runs all tests sequentially with auto server management

# 5. Debug tools
open debug-client.html  # Real-time game state monitoring dashboard
```

### Build & Validation
```bash
# Frontend
(cd games/pirate-plunder/frontend && npm run build)  # Production build with TypeScript check
(cd games/pirate-plunder/frontend && npm run lint)   # ESLint validation

# Backend  
(cd games/pirate-plunder/backend && npm run build)   # Compile TypeScript to JavaScript

# CRITICAL: Full build test (MANDATORY before deployment)
make build                    # Test complete build process including asset copying
```

## Architecture & Key Patterns

### Real-time Game State Management
- **Server**: `backend/src/server.ts` manages all game state in-memory
- **Client-Server Protocol**: Socket.io events for state synchronization
- **State Machine**: Strict phase transitions (Lobby → PreHand → Ante → Roll1-3 → Lock1-3 → Bet1-3 → Roll4 → Showdown → Payout → HandEnd)
- **Player Types**: Human (Socket.io) and AI (with personality profiles)
- **Durable Player Identity**: Persistent player IDs across reconnections (googleId or guest_Name)
- **Disconnection Timeouts**: Configurable grace periods (30s action, 30s fold, 3min kick)

### TypeScript Configuration
**CRITICAL**: Both directories use strict TypeScript with `exactOptionalPropertyTypes: true`
- Always check for null/undefined before accessing optional properties
- Never assign `undefined` to non-optional properties  
- Run `npx tsc --noEmit` in both directories before committing

### AI System Architecture
- **Profiles**: Located in `backend/src/ai-profiles.json` (4 distinct personalities)
- **Decision Pipeline**: `evaluateHandStrength()` → `makeAIBettingDecision()` → `makeAILockingDecision()`
- **Behavioral Variance**: ±10% randomization on profile parameters per game
- **Hand Evaluation**: 0-6 scale based on achievable roles and game phase

### Socket.io Event Flow
**Lobby Events**:
- `join` → `lobby_state` (broadcast)
- `add_ai` / `fill_ai_to_min` → `lobby_state`
- `start_hand` → `game_state`

**Game Events**:
- `lock_select` → `game_state` (dice locking)
- `player_action` → `game_state` (betting actions)
- `next_phase` → `game_state` (phase transitions)

### Testing Architecture
1. **Unit Tests**: `games/pirate-plunder/backend/tests/game-logic.test.ts`, `games/pirate-plunder/frontend/src/test/App.test.tsx`
2. **Integration Tests**: `games/pirate-plunder/backend/scripts/test-game-flow.js` (automated Socket.io client)
3. **Debug Middleware**: `games/pirate-plunder/backend/src/debug-middleware.ts` + `debug-client.html` dashboard

## Critical Implementation Details

### Game Rules Implementation
- **Role Assignment**: Most dice wins (Ship=6s, Captain=5s, Crew=4s), ties create vacancies
- **Cargo System**: Non-role players use 1s/2s/3s via plurality voting
- **Public/Private Dice**: Lock3 allows locking more dice than shown to opponents
- **Roll4 Phase**: Final roll after Lock3, before Bet3 (Yahtzee-style viewing)

### Port Configuration
- Backend: Port 3001 (auto-selects next available if busy)
- Frontend: Port 5173 (Vite dev server)
- Environment: `VITE_BACKEND_URL` in `games/pirate-plunder/frontend/.env.local`

### Key File Locations
- Game phase logic: `games/pirate-plunder/backend/src/server.ts:262-327`
- Socket connection: `games/pirate-plunder/frontend/src/App.tsx:29`
- AI profiles: `games/pirate-plunder/backend/src/ai-profiles.json`
- Game rules: `docs/gdd.md`
- Architecture: `docs/architecture.md`

### Progressive Jackpot System
- **Cargo Chest**: Progressive pot managed in `games/pirate-plunder/backend/src/cargo-chest-config.ts`
- **Drip Rate**: 5% of wagers flow into cargo chest
- **Payout Conditions**: Triggered by specific cargo combinations

### Development Workflow
- Always run `npm exec --workspace @pirate/game-pirate-plunder-backend tsc -- --noEmit` and `npm exec --workspace @pirate/game-pirate-plunder-frontend tsc -- --noEmit` before committing code
- Use `npm run kill-ports` if ports are stuck
- Check `debug-client.html` for real-time game state debugging
- Git workflow: commit locally, then push to remote

### Deployment

**See [DEPLOY.md](DEPLOY.md) for complete deployment instructions.**

All deployments are done manually via Tailscale SSH. The DEPLOY.md file contains:
- Step-by-step deployment commands
- Quick copy-paste deployment script
- Troubleshooting guides
- Pre-deployment checklist

**Production URLs:**
- Primary: https://antetown.com
- Internal (Tailscale): http://vps-0b87e710.tail751d97.ts.net:3001
- Legacy: https://vps-0b87e710.tail751d97.ts.net

## Deployment History & Lessons Learned

### Critical Deployment Notes
```bash
# CURRENT WORKING METHOD: Direct server deployment via Tailscale SSH
# This method works reliably and includes cache-busting fixes

# 🚨 CRITICAL: BACKUP PRODUCTION .ENV FIRST TO PREVENT OAUTH BREAKAGE
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cp /opt/AnteTown/.env /opt/AnteTown/.env.backup"

# 1. Sync source code to server (EXCLUDING .env and table-config.json to preserve OAuth credentials and table settings)
# Note: backend/config/table-config.json is NOT in git (only .default.json is tracked)
# The --exclude='backend/config/table-config.json' prevents overwriting production table configs
tar --exclude='.git' --exclude='node_modules' --exclude='frontend/node_modules' --exclude='backend/node_modules' --exclude='frontend/dist' --exclude='backend/dist' --exclude='.env' --exclude='.env.local' --exclude='backend/config/table-config.json' -czf - . | tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && tar -xzf -"

# 2. RESTORE PRODUCTION .ENV (contains OAuth credentials)
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cp /opt/AnteTown/.env.backup /opt/AnteTown/.env"

# 3. Build and restart on server
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && sudo systemctl stop AnteTown && make build && sudo systemctl start AnteTown"
```

**Table Configuration Persistence**:
- Production table configs are stored in `/opt/AnteTown/backend/config/table-config.json`
- This file is **NOT** tracked in git (only `.default.json` template is tracked)
- Deploy script excludes `backend/config/table-config.json` file to preserve production settings
- Changes made via ConfigManager UI persist across deployments
- **IMPORTANT**: Must exclude the specific file, not the whole directory (so .default.json still gets deployed)
- **CRITICAL**: Delete `backend/config/table-config.json` locally before deploying if it exists (created by running backend locally)

#### Alternative: Infra-Workflows Method (HAS CACHING ISSUES)
```bash
# This method exists but may have caching problems - use as fallback only
./deploy.sh                    # From repo root - uses infra-workflows helper
# OR
cd ../infra-workflows && ./deploy-helper.sh antetown

# ⚠️ TODO: Fix infra-workflows deployment to include cache-busting headers
# The automated method may serve cached frontend assets that don't reflect recent changes
# Manual method above includes server code changes that disable caching during development
```

#### 🔍 MANDATORY POST-DEPLOYMENT VERIFICATION
```bash
# 1. CRITICAL: Verify deployment actually updated
curl -s https://antetown.com/api/deploy-info | jq '{commitHash, buildVersion, timestamp}'
# ⚠️  buildVersion should be TODAY'S DATE
# ⚠️  timestamp should be within last few minutes
# ⚠️  commitHash should match your latest git commit (run: git rev-parse --short HEAD)

# 2. CRITICAL: Verify frontend assets are fresh
curl -I https://antetown.com/assets/index-*.js | grep -E "(Content-Type|Last-Modified)"
# ⚠️  Content-Type should be "application/javascript"
# ⚠️  Last-Modified should be within last 10 minutes

# 3. CRITICAL: Verify your specific code changes are deployed
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "grep -n 'RECENT_CHANGE_STRING' /opt/AnteTown/frontend/src/components/GameApp.tsx"
# Replace RECENT_CHANGE_STRING with something unique from your recent commits

# 4. CRITICAL: Test functionality on production server
# Open https://antetown.com and test your changes
# ⚠️  NEVER assume local testing equals production testing
```

#### Deployment Troubleshooting
```bash
# SSH access for troubleshooting
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net
cd /opt/PiratePlunder
sudo journalctl -u PiratePlunder -f  # Monitor logs
sudo systemctl restart PiratePlunder # Manual restart if needed

# Monitor deployment
gh run list --repo drybrushgames/PiratePlunder --limit 5
```

### Critical Deployment Notes
- **Manual deployment via Tailscale SSH** - Direct server sync + build (current working method)
- **Infra-workflows has caching issues** - Automated deployment may serve stale frontend assets
- **Cache-busting implemented** - Server serves no-cache headers to prevent stale assets
- **Express 5 breaks the app** - stay on Express 4.x
- **Makefile handles everything** - builds frontend + backend automatically
- **Service name is `PiratePlunder`** (capital P) on server
- **Game is live**: http://vps-0b87e710.tail751d97.ts.net:3001 ✅
- **Public access**: http://tail751d97.ts.net:3001 ✅

## 🔥 CRITICAL: DEPLOYMENT PIPELINE FAILURE LESSONS (Aug 2025)

### ⚠️ NEVER AGAIN: How to Avoid Silent Deployment Failures

**The Problem**: GitHub Actions reported "success" for days while completely failing to deploy new code. All debugging was useless because the fixes never reached production. **Solution**: We now use direct Tailscale SSH deployment for reliability.

### 🚨 MANDATORY VERIFICATION AFTER EVERY DEPLOYMENT

**Before you declare a deployment successful:**

1. **Commit Hash Check**: 
   ```bash
   curl -s http://vps-0b87e710.tail751d97.ts.net:3001/api/deploy-info | jq '.commitHash'
   ```
   - ❌ If shows old commit → deployment failed
   - ❌ If shows "unknown" → investigate why

2. **Build Version Check**:
   ```bash  
   curl -s http://vps-0b87e710.tail751d97.ts.net:3001/api/deploy-info | jq '.buildVersion'
   ```
   - ❌ If not today's date → old build being used

3. **Asset Freshness Check**:
   ```bash
   curl -I http://vps-0b87e710.tail751d97.ts.net:3001/assets/index-*.js | grep Last-Modified
   ```
   - ❌ If timestamp > 10 minutes old → frontend not rebuilt

4. **Source Code Verification**:
   ```bash
   tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "grep -n 'YOUR_RECENT_CHANGE' /opt/PiratePlunder/frontend/src/components/GameApp.tsx"
   ```
   - ❌ If your change not found → source not deployed

5. **Functional Testing via Tailscale**:
   - ❌ If you test locally instead of production → INVALID
   - ✅ ALWAYS test on http://vps-0b87e710.tail751d97.ts.net:3001

### 🚫 RED FLAGS THAT INDICATE BROKEN DEPLOYMENT

🚩 **"Preserving pre-built frontend assets"** in logs  
🚩 **TypeScript errors during build** but deployment "succeeds"  
🚩 **Old commit hash** for multiple deployments  
🚩 **Frontend assets days/hours old** after deployment  
🚩 **Build version not today's date** after deployment  
🚩 **Your code changes work locally but not in production**  

### 📝 HISTORICAL NOTE: GitHub Actions Issues

The above lessons were learned during August 2025 when GitHub Actions deployments were silently failing. We have since switched to direct Tailscale SSH deployment (documented above) for reliability. The verification steps above are still critical for any deployment method.

---

## 🚨 ORIGINAL DEPLOYMENT POSTMORTEM (Aug 2025)

### What Went Wrong
Between commits 685c827 and de3e7f8, we experienced a **critical deployment pipeline failure** where:
1. **Changes weren't deploying** - Code committed locally but not reaching production
2. **No deployment verification** - No way to confirm fixes actually deployed  
3. **Silent failures** - Workflow reported "success" but old code remained
4. **MIME type issues** - Static files served with wrong Content-Type headers
5. **Route ordering bugs** - Catch-all SPA route intercepting asset requests

### Root Causes Identified
1. **Deployment Pipeline Issue**: Unknown issue in reusable workflow
2. **Missing Verification**: No deployment confirmation mechanism
3. **Express Route Order**: API routes → Static files → Catch-all (wrong order)
4. **MIME Type Configuration**: Express not setting correct Content-Type for .js files
5. **Insufficient Logging**: Poor visibility into production state

### Fixes Implemented
1. **✅ Working Deployment Pipeline** - Using `deploy-helper.sh pirateplunder`
2. **✅ Version Verification System** - `/api/deploy-info` endpoint + UI display  
3. **✅ Enhanced Logging** - `logBankrollOperation()` with structured output
4. **✅ Proper Route Order** - API → Static files → SPA catch-all
5. **✅ Correct MIME Types** - Explicit `application/javascript` for .js files
6. **✅ Deployment Verification** - Commands to confirm successful deployment

### Prevention Measures  
- **ALWAYS** run TypeScript compilation check before deploying
- **ALWAYS** verify deployment with `/api/deploy-info` endpoint
- **ALWAYS** check MIME types with `curl -I` after deployment
- **Version numbers** visible in UI for immediate deployment confirmation
- **Structured logging** for all critical operations (bankroll, game state)

### Common Deployment Issues & Solutions

**Issue**: JavaScript module loading errors (`Failed to load module script`)
- **Cause**: Wrong MIME type or missing static files
- **Fix**: Check `curl -I http://vps-0b87e710.tail751d97.ts.net:3001/assets/index-*.js`
- **Should show**: `Content-Type: application/javascript`

**Issue**: Changes not appearing after deployment
- **Cause**: Deployment pipeline not actually deploying
- **Fix**: Verify with `curl -s http://vps-0b87e710.tail751d97.ts.net:3001/api/deploy-info`
- **Check**: Backend version matches your local version

**Issue**: Frontend shows old version number  
- **Cause**: Browser caching or deployment didn't include frontend changes
- **Fix**: Hard refresh (Ctrl+Shift+R) or check network tab in DevTools

**Issue**: API endpoints returning HTML instead of JSON
- **Cause**: Express route order - catch-all before static/API routes  
- **Fix**: Ensure route order is API → Static → Catch-all

**Issue**: Database connection errors
- **Cause**: PostgreSQL not running or wrong connection string
- **Fix**: Check `sudo systemctl status postgresql` on server

**Issue**: Table config getting reset to defaults after deployment
- **Cause**: `backend/config/table-config.json` was tracked in Git before being added to `.gitignore`
- **Fix**: File has been removed from Git tracking (commit 67708d1). Now only `.default.json` is tracked.
- **Prevention**: Deployment command uses `--exclude='backend/config'` to skip the entire config directory

## 🚨 CRITICAL: Prisma Client Generation Issue (Aug 2025 Postmortem)

### The Problem
After adding the `isAdmin` field to the database, the field was returning `undefined` in the application despite being `true` in the database. Root cause: The compiled backend code couldn't find the generated Prisma client.

### What Went Wrong
1. **No Prisma generation in build**: The Makefile and npm scripts didn't run `prisma generate`
2. **Path mismatch**: Prisma generates to `src/generated/` but compiled TypeScript expects `dist/generated/`
3. **Schema inconsistency**: Development and production both use PostgreSQL
4. **Silent failure**: App continued running with stale/cached Prisma client missing new fields

### The Fix
1. Added `prebuild` and `postbuild` scripts to package.json to generate Prisma client and copy it to dist
2. Added explicit `prisma generate` step to Makefile
3. Ensured schema.prisma always uses `provider = "postgresql"`
4. Created diagnostic script for systematic debugging

### Prevention
- **ALWAYS** run `npx prisma generate` after schema changes
- **ALWAYS** ensure schema.prisma has `provider = "postgresql"`
- **ALWAYS** use PostgreSQL for this project
- Use the diagnostic script (`diagnose-isadmin.js`) for debugging auth/database issues

### Authentication System (Google OAuth)
**Configuration Requirements**:
- PostgreSQL database with sessions table
- Google OAuth credentials in environment variables
- Correct callback URL configuration

**Environment Variables** (`/opt/PiratePlunder/.env`):
```bash
DATABASE_URL=postgres://svc:svcpassword123@localhost:5432/PiratePlunder?sslmode=disable
GOOGLE_CLIENT_ID=4580273885-irv1ae2vs7i00so08j7j5caa9mi3lb2o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=test-secret-key-for-deployment-testing
FRONTEND_URL=http://vps-0b87e710.tail751d97.ts.net:3001
NODE_ENV=production
PORT=3001
```

**Sessions Table** (PostgreSQL):
```sql
CREATE TABLE sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE UNIQUE INDEX sessions_pkey ON sessions(sid);
CREATE INDEX sessions_expire_idx ON sessions(expire);
```

**OAuth Configuration**:
- Callback URL: `http://vps-0b87e710.tail751d97.ts.net:3001/auth/google/callback`
- Sessions persist for 7 days
- PostgreSQL session store for persistence across restarts

## 🔍 DEBUGGING METHODOLOGY

**CRITICAL**: See `docs/debugging-guide.md` for comprehensive debugging rules learned from extensive debugging sessions.

### Core Debugging Principles
1. **Currency Confusion**: Always check units first (DB: dollars, Backend: pennies, Frontend: mixed)
2. **State Synchronization**: Identify ALL state sources (auth context vs game state vs seat state)
3. **Validate Before Confirming**: Don't say "you're right" until you've investigated
4. **Display vs Data**: Find exact render point, trace backward from display
5. **Use Browser Tools**: ALWAYS test changes in running app, not just code review
6. **Socket Verification**: Log both send (backend) and receive (frontend)

### Pre-Debug Checklist
- [ ] Can I reproduce the issue myself?
- [ ] Is this display, data, or synchronization?
- [ ] What are the units/types involved?
- [ ] Are there multiple state sources?
- [ ] Have I checked browser DevTools?

### Common PiratePlunder Debugging Patterns

**"Bankroll not updating"** 
1. Check which bankroll (header uses `user.bankroll`, game uses `me.bankroll`)
2. Verify auth context vs game state sync
3. Check unit conversions (dollars ↔ pennies)

**"Button state wrong"**
1. Find state that controls button
2. Check state updates and re-renders
3. Look for multiple state sources

**"Config changes not working"**  
1. Check backend validation constraints (Math.min/max)
2. Verify data format sent from frontend
3. Look for competing defaults

### Systematic Approach
1. **Reproduce** → 2. **Locate** → 3. **Trace** → 4. **Log** → 5. **Test** → 6. **Fix** → 7. **Verify**

### Anti-Patterns to Avoid
- Shotgun debugging (multiple random changes)
- Code-only analysis (not testing actual behavior)  
- Assuming propagation (one fix cascading)
- Over-confirmation (saying fixed without testing)

## 🚨 CRITICAL: React Error #310 Debugging Guide (Sep 2025 Postmortem)

### What React Error #310 Means
"Minified React error #310" = **Hook consistency violation**. React detected mismatched hook calls between renders.

### IMMEDIATE Response Protocol
When you see "Minified React error #310":

1. **DO NOT debug the minified code** - it's a waste of time
2. **IMMEDIATELY build unminified version**:
   ```bash
   # In vite.config.ts, add:
   build: { minify: false }
   # Then deploy to get readable error
   ```
3. **Get the actual error message** with component name and line number
4. **Fix the real issue**, not symptoms

### Root Cause: useMemo/useCallback During Auth Flows
**The Problem**: Store component useMemo with unstable dependencies during authentication:
```typescript
// PROBLEMATIC - dependency array changes during auth flow
const storeItems = useMemo(() => {
  // ...complex logic
}, [Boolean(user), user?.unlockedCosmetics]); // ❌ Array reference changes
```

**The Solution**: Remove unnecessary optimization:
```typescript
// WORKING - simple calculation, no hooks
const storeItems: StoreItem[] = [];
if (user) {
  // ...same logic, runs each render
}
```

### Why Auth Flows Break useMemo
During login, objects transition through states:
- `user`: `null` → `{id: "123", unlockedCosmetics: undefined}` → `{id: "123", unlockedCosmetics: []}`
- Array references change even with same length
- React's dependency comparison fails
- Hook call order becomes inconsistent

### Debugging Time Comparison
**Wrong approach** (production debugging): 35+ minutes
- Multiple failed dependency fixes
- Deploy-test-fail cycles
- Symptom chasing

**Right approach** (unminified debugging): ~10 minutes
- Build unminified immediately
- Get readable error
- Fix actual root cause

### Prevention Strategies

**Code Review Checklist for useMemo/useCallback**:
- [ ] Are dependencies stable during auth transitions?
- [ ] Is this optimization actually needed?
- [ ] Can this be simplified to avoid hooks entirely?
- [ ] Does this handle null/undefined user states?

**Development Practices**:
- Test components with different auth states (null, partial, complete)
- Prefer simple calculations over complex memoization
- Use unminified builds for any production-only errors
- Build production bundles locally before deploying

### Related Error Patterns
- "Cannot read property of undefined" during auth
- Infinite re-renders during login
- Component state reset after authentication
- Socket connection spam (removed useMemo from socket creation)

### Quick Fix Guidelines
1. **For Store/cosmetics**: Remove useMemo, use simple calculation
2. **For socket connection**: Keep useMemo with `[Boolean(user)]` dependency
3. **For auth-dependent data**: Prefer loading states over complex dependencies

## 🔧 TODO: Local Development Environment Setup

### PostgreSQL Local Setup (Needed for Full Local Testing)
**Current Status**: Local PostgreSQL installed but schema setup incomplete

**What's Missing**:
- Run Prisma migrations to create tables: `npx prisma migrate dev`
- Set up sessions table for authentication testing
- Test OAuth flow locally (requires proper Google OAuth setup)

**Production Setup (Reference)**:
- Database: PiratePlunder
- User: svc (password: svcpassword123)
- Tables: users, sessions, table_bankrolls
- Connection: postgres://svc:svcpassword123@localhost:5432/PiratePlunder?sslmode=disable

**For Now**: Test on production via Tailscale SSH for database-dependent features
