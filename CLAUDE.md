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
2. `GET /api/tickets/available` - Returns `{available, sold, total}` from GORM
3. `POST /api/tickets/book` - Books ticket (name, email) with auto-increment ID

Database auto-migrates on startup. Ticket model:
```go
type Ticket struct {
  ID        uint   `gorm:"primaryKey"`
  Available int
  Sold      int
  Name      string
  Email     string
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
- Auto-migrations handle schema - modify Ticket struct and restart
- Fiber middleware stack: logger → recover → routes
- Graceful shutdown via os.Signal

## Before Making Changes
- All endpoints use Fiber v3 and GORM patterns
- Database changes: modify Ticket struct, restart for auto-migration
- Run `make build` to verify compilation
- Use `make dev` for live reload during development
