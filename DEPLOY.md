# AnteTown Platform Deployment Guide

## Current Deployment Method: Manual via Tailscale SSH

All deployments are done manually via Tailscale SSH. This is the only supported deployment method.

### Prerequisites
- Tailscale installed and authenticated
- Access to `deploy@vps-0b87e710.tail751d97.ts.net`
- Code committed and pushed to `main` branch on GitHub

---

## Deployment Steps

Run these commands from your local machine:

### 1. Pull Latest Code
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && git pull origin main"
```

### 2. Update Root Dependencies
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && npm install"
```

### 3. Build Frontend
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown/games/pirate-plunder/frontend && npm install && npm run build"
```

### 4. Copy Frontend to Backend Public Folder
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && rm -rf games/pirate-plunder/backend/dist/public/* && mkdir -p games/pirate-plunder/backend/dist/public && cp -r games/pirate-plunder/frontend/dist/* games/pirate-plunder/backend/dist/public/"
```

### 5. Build Backend
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown/games/pirate-plunder/backend && npm install && npx tsc -p ."
```

### 6. Restart Service
```bash
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "sudo systemctl restart AnteTown"
```

### 7. Verify Deployment
```bash
curl -s https://antetown.com/api/deploy-info | jq '.'
```

Check that:
- `uptime` is low (service just restarted)
- Service returns valid JSON
- No errors in the response

---

## Quick Copy-Paste (All Steps)

```bash
# Full deployment - copy all these lines at once
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && git pull origin main"
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && npm install"
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown/games/pirate-plunder/frontend && npm install && npm run build"
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown && rm -rf games/pirate-plunder/backend/dist/public/* && mkdir -p games/pirate-plunder/backend/dist/public && cp -r games/pirate-plunder/frontend/dist/* games/pirate-plunder/backend/dist/public/"
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown/games/pirate-plunder/backend && npm install && npx tsc -p ."
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "sudo systemctl restart AnteTown"
curl -s https://antetown.com/api/deploy-info | jq '.'
```

---

## Production URLs

- **Primary**: https://antetown.com
- **Internal (Tailscale)**: http://vps-0b87e710.tail751d97.ts.net:3001
- **Legacy**: https://vps-0b87e710.tail751d97.ts.net

---

## Troubleshooting

### Service Won't Start
```bash
# Check service logs
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "sudo journalctl -u AnteTown -n 50"

# Check service status
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "sudo systemctl status AnteTown"
```

### Disk Space Issues
```bash
# Check disk usage
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "df -h"

# Clean old journal logs (keeps last 7 days)
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "sudo journalctl --vacuum-time=7d"
```

### Frontend Not Updating
- Verify frontend build completed successfully in step 3
- Verify files were copied in step 4
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

### Backend Compilation Errors
```bash
# Check TypeScript compilation output
tailscale ssh deploy@vps-0b87e710.tail751d97.ts.net "cd /opt/AnteTown/games/pirate-plunder/backend && npx tsc -p . 2>&1 | head -50"
```

---

## Important Notes

### OAuth Credentials
**CRITICAL**: The production `.env` file contains OAuth credentials that must NOT be overwritten:
- `GOOGLE_CLIENT_ID=4580273885-irv1ae2vs7i00so08j7j5caa9mi3lb2o.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=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`
- **OAuth Callback URL**: https://antetown.com/auth/google/callback

The deployment process does NOT touch the `.env` file. If you need to update environment variables, do it manually via SSH.

### Table Configuration
- Production table configs are stored in `/opt/AnteTown/backend/config/table-config.json`
- This file is NOT tracked in git
- Deployment does NOT overwrite this file
- Changes made via ConfigManager UI persist across deployments

### Cache Busting
- Frontend builds include timestamps in filenames for cache busting
- Server serves `no-cache` headers during development
- Hard refresh if you don't see changes immediately

---

## Pre-Deployment Checklist

Before deploying, ensure:
- [ ] Code is committed and pushed to `main` branch
- [ ] TypeScript compiles locally: `npm exec --workspace @pirate/game-pirate-plunder-backend tsc -- --noEmit`
- [ ] Frontend compiles locally: `npm exec --workspace @pirate/game-pirate-plunder-frontend tsc -- --noEmit`
- [ ] Local testing completed: `npm run dev`
- [ ] Build test passes: `make build` (from project root)
