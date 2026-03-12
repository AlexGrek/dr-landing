# Project Context for Claude Code

## Project Overview
Birthday party ticket-selling landing page built with Go. Bleeding-edge tech stack using Fiber v3, GORM, and SQLite with auto-migrations. Minimal manual code - leverage frameworks extensively.

## Project Structure
```
cmd/main/           - Entry point (22 lines total)
internal/server/    - Fiber app setup with middleware
internal/database/  - GORM models and auto-migrations
internal/handlers/  - API endpoint handlers
static/             - Frontend (added later)
go.mod              - Go 1.25.0 with Fiber v3.1.0, GORM v1.25.5
Makefile            - Development commands
tickets.db          - SQLite database (auto-created)
```

## Development Workflow

### Running the Project
```bash
make run       # Start server (http://localhost:8080)
make build     # Build binary to bin/dr-landing
make dev       # Run with live reload using air
```

### Code Style & Standards
- Use `make fmt` to format code
- Follow standard Go conventions
- Handlers in internal/handlers/ package
- Use Fiber for routing and middleware
- Leverage GORM for all database operations
- Use code generation tools where possible

## Key Files to Know
- **cmd/main/main.go** - Application entry point
- **internal/server/server.go** - Fiber server setup and routes
- **internal/database/db.go** - Database initialization and models
- **internal/handlers/** - API endpoint handlers

## API Implementation Notes
All endpoints implemented and working:
1. `GET /api/health` - Health check, returns `{"status":"healthy"}`
2. `POST /api/register` - Create guest registration (requires `name`, `invitation_code`)
3. `GET /api/register/:code` - Fetch registration by invitation code

Database auto-migrates on startup. Registration model:
```go
type Registration struct {
  ID             uint      `gorm:"primaryKey"`
  CreatedAt      time.Time
  Name           string    `gorm:"not null"`
  // One of: "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"
  ArrivalTime    string
  // JSON arrays/objects stored as raw text
  DrinkPrefs     string    `gorm:"type:text"`
  DressCodePrefs string    `gorm:"type:text"`
  ActivityPrefs  string    `gorm:"type:text"`
  InvitationCode string    `gorm:"uniqueIndex;not null"`
  Avatar         string
  AdditionalInfo string
}
```

## Tech Stack (Bleeding Edge 2026)
- **Web**: Fiber v3.1.0 (fastest Go HTTP framework)
- **Database**: GORM v1.25.5 + SQLite with auto-migrations
- **Go**: 1.25.0 (latest)
- **Logging**: Fiber built-in logger middleware
- **Error Handling**: Fiber error recovery middleware

## Development Patterns
- Use GORM for ALL database operations (no manual SQL)
- Handlers: `func(c fiber.Ctx) error` - return `c.JSON()` or `c.Status().JSON()`
- Auto-migrations handle schema - modify Registration struct and restart
- Fiber middleware stack: logger → recover → routes
- Graceful shutdown via os.Signal

## Deployment

### Docker
Registry: `grekodocker/dr-landing` (DockerHub)

```bash
make docker-build              # build grekodocker/dr-landing:latest
make docker-push               # push to dockerhub
make docker-release            # build + push
make docker-release IMAGE_TAG=1.0.0  # with specific tag
```

### Kubernetes (Helm)
Primary deploy command — works for both first install and upgrades:
```bash
make helm-upgrade                          # deploy to dr-landing namespace
make helm-upgrade HELM_RELEASE=staging     # override release name
```

- Namespace: `dr-landing` (created automatically via `--create-namespace`)
- SQLite DB persisted via PVC mounted at `/data` (`DB_PATH=/data/tickets.db`)
- Ingress disabled by default; enable via `--set ingress.enabled=true`
- `make helm-template` to preview rendered manifests

## Before Making Changes
- All endpoints use Fiber v3 and GORM patterns
- Database changes: modify Registration struct, restart for auto-migration
- Run `make build` to verify compilation
- Use `make dev` for live reload during development
