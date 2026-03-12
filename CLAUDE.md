# Project Context for Claude Code

## Project Overview
Birthday Party 3.0 invitation & registration landing page. Go backend (Fiber v3 + GORM + SQLite) with a React 19 SPA frontend (Vite 7, Less, Framer Motion, HeroUI). Guests register via a 5-step wizard, receive a QR ticket, and can verify/view their ticket at `/verify/:code`.

## Project Structure
```
cmd/main/               - Entry point
internal/server/        - Fiber app setup with middleware and routes
internal/database/      - GORM models and auto-migrations
internal/handlers/      - API endpoint handlers
frontend/               - React SPA
  src/
    App.jsx             - All page sections + root App component
    index.less          - All styles (Less, BEM naming)
    components/
      MorphModal.jsx         - Morph-expand modal (3D spring animation)
      RegisterWizard.jsx     - 5-stage registration wizard
      TicketConfirmation.jsx - Post-registration QR ticket screen
      VerifyRegistration.jsx - /verify/:code public ticket page
      AdminPanel.jsx         - /birthday_is_for_me admin view
      ScrollReveal.jsx       - Scroll-triggered reveal wrapper
helm/                   - Helm chart for Kubernetes deploy
Makefile                - Dev/build/deploy commands
tickets.db              - SQLite database (auto-created on startup)
```

## Development Workflow

### Backend
```bash
make run       # Start Go server (http://localhost:8080)
make build     # Build binary to bin/dr-landing
make dev       # Live reload with air
make fmt       # Format Go code
```

### Frontend
```bash
cd frontend
npm run dev    # Vite dev server :5173, proxies /api → :8080
npm run build  # Build to frontend/dist/ (served by Go in prod)
```

## API Endpoints
1. `GET /api/health` — Health check, returns `{"status":"healthy"}`
2. `POST /api/register` — Create guest registration
3. `GET /api/register/:code` — Fetch registration by invitation code
4. `GET /api/qr-image/:code` — QR code PNG for a ticket

Registration model:
```go
type Registration struct {
  ID             uint      `gorm:"primaryKey"`
  CreatedAt      time.Time
  Name           string    `gorm:"not null"`
  // One of: "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"
  ArrivalTime    string
  // JSON arrays stored as raw text
  DrinkPrefs     string    `gorm:"type:text"`
  DressCodePrefs string    `gorm:"type:text"`
  ActivityPrefs  string    `gorm:"type:text"`
  InvitationCode string    `gorm:"uniqueIndex;not null"`
  Avatar         string
  AdditionalInfo string
}
```

## Tech Stack (Bleeding Edge 2026)
- **Web**: Fiber v3.1.0
- **Database**: GORM v1.25.5 + SQLite, auto-migrations on startup
- **Go**: 1.25.0
- **Frontend**: Vite 7, React 19, Less (no Tailwind), Framer Motion, HeroUI
- **Icons**: lucide-react

## Frontend Architecture

### Sections (App.jsx, top → bottom)
1. `HeroSection` — Parallax fade, scroll hint
2. `DateSection` — Animated calendar revealing March 22
3. `CountdownSection` — Live countdown to 15:00
4. `LocationSection` — 3-layer parallax, Japanese wabi-sabi theme, Google Maps button
5. `RegisterSection` — "Register Now" section (floating button fades when this is in view)
6. Footer — Shimmer tagline + contact bar

### Modal Flow
- `MorphModal` — Spring-based morph from button rect, 3D perspective (`rotateX`) on open/close
- Inside: `RegisterWizard` (5 stages) → on success → `TicketConfirmation`

### RegisterWizard Stages
1. Names (primary + up to 7 partners)
2. Food & Drinks (multi-select grid, flex-wrap, min-width 160px)
3. Activities (multi-select grid)
4. Arrival time + additional info (textarea placeholder changes to "Explain why you are late…" if time ≠ 15:00)
5. Review (staggered reveal) → submit

### TicketConfirmation
- QR code (click to download as PNG)
- Details: location, time, guest names
- Action buttons: Google Maps, Add to Calendar (.ics download)
- Notice footer: "Ticket is required…"

## Styling Conventions
- **All styles in** `frontend/src/index.less` (one file, BEM)
- Dark theme, warm tones (`@bg-primary`, `@accent`, `@text-primary`, `@text-secondary`, `@card-bg`, `@card-border`)
- Japanese section uses `@jp-red: #BC002D`, `@jp-white: #faf8f5`
- No Tailwind — pure Less/CSS
- Mobile-first, scroll-reactive, fluid type with `clamp()`
- Floating button pattern: `layoutId="register-btn"` concept via opacity toggle

## Development Patterns
- Use GORM for ALL database operations (no manual SQL)
- Handlers: `func(c fiber.Ctx) error` — return `c.JSON()` or `c.Status().JSON()`
- Auto-migrations handle schema — modify Registration struct and restart
- Fiber middleware stack: logger → recover → routes
- Frontend component changes: edit JSX + corresponding Less block

## Deployment

### Docker
Registry: `grekodocker/dr-landing` (DockerHub)
```bash
make docker-build
make docker-push
make docker-release IMAGE_TAG=1.0.0
```

### Kubernetes (Helm)
```bash
make helm-upgrade                          # deploy to dr-landing namespace
make helm-upgrade HELM_RELEASE=staging
make helm-template                         # preview manifests
```
- Namespace: `dr-landing` (auto-created)
- SQLite persisted via PVC at `/data/tickets.db`
- Admin: `/birthday_is_for_me`
- Verify ticket: `/verify/:code`

## Before Making Changes
- Run `make build` to verify Go compilation
- Frontend: `npm run build` in `frontend/` to catch JS errors
- Database schema changes: modify Registration struct → restart (auto-migration runs)
- Styles: all in `index.less`, find the relevant BEM block before adding new rules
