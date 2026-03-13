# Birthday Party 3.0 — Landing Page

Invitation & registration landing page for Birthday Party 3.0 (22 March 2026, Wabi Sabi Space, Kyiv).

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.25.0 · Fiber v3.1.0 · GORM v1.25.5 · SQLite |
| Frontend | Vite 7 · React 19 · Less · Framer Motion · HeroUI |
| Deploy | Docker · Kubernetes (Helm) |

## Project Structure

```
cmd/main/               - Entry point
internal/server/        - Fiber app, middleware, routes
internal/database/      - GORM models & auto-migrations
internal/handlers/      - API handlers
frontend/               - React SPA (Vite)
  src/
    App.jsx             - Page sections & layout
    index.less          - All styles (Less, BEM)
    components/
      MorphModal.jsx    - Morph-expand modal with 3D animation
      RegisterWizard.jsx- 5-step registration wizard
      TicketConfirmation.jsx - QR ticket + download
      VerifyRegistration.jsx - /verify/:code page
      AdminPanel.jsx    - /birthday_is_for_me admin view
      ScrollReveal.jsx  - Scroll-triggered reveal wrapper
helm/                   - Helm chart for Kubernetes
Makefile                - All dev/build/deploy commands
tickets.db              - SQLite (auto-created)
```

## Development

```bash
# Backend
make run          # Go server on :8080
make dev          # Live reload with air
make build        # Build to bin/dr-landing
make fmt          # Format Go code

# Frontend
cd frontend
npm install
npm run dev       # Vite dev server on :5173 (proxies /api → :8080)
npm run build     # Build to frontend/dist/
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/register` | Create registration |
| GET | `/api/register/:code` | Fetch registration by invite code |
| GET | `/api/qr-image/:code` | QR code PNG for ticket |

Registration payload:
```json
{
  "name": "Alex + Maria",
  "arrival_time": "15:00",
  "drink_prefs": "[\"wine\",\"cocktails\"]",
  "activity_prefs": "[\"dancing\",\"karaoke\"]",
  "additional_info": "..."
}
```

## Frontend Features

- Scroll-reactive hero with parallax fade
- Animated calendar (date reveal animation)
- Live countdown timer
- Wabi-sabi location section with 3-layer parallax
- Morph modal (button → full modal with 3D perspective spring)
- 5-stage registration wizard: names → food/drinks → activities → arrival time → review
- Ticket confirmation with QR code (click to download), Google Maps & Add to Calendar
- Floating "Register Now" button that fades when the register section is in view
- Footer tagline with per-letter shimmer animation

## Deployment

```bash
# Docker
make docker-build                        # build grekodocker/dr-landing:latest
make docker-push                         # push to DockerHub
make docker-release IMAGE_TAG=1.0.0      # build + push with tag

# Kubernetes (Helm)
make helm-upgrade                        # install/upgrade in dr-landing namespace
make helm-upgrade HELM_RELEASE=staging   # override release name
make helm-template                       # preview rendered manifests
```

- SQLite persisted via PVC at `/data/tickets.db`
- Ticket verify: `/verify/:code`

## License

WTFPL
