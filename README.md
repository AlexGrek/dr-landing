# Birthday Party Ticket Landing Page

A modern Go-based web application for selling tickets to your birthday party. Includes an HTTP API server and a beautiful static landing page.

## Project Structure

```
.
├── cmd/
│   └── main/
│       └── main.go          # Application entry point
├── internal/
│   └── server/
│       └── server.go        # Server configuration
├── static/
│   ├── html/
│   │   └── index.html       # Landing page
│   ├── css/
│   │   └── style.css        # Styling
│   └── js/
│       └── main.js          # Frontend logic
├── go.mod                   # Go module file
├── Makefile                 # Build commands
├── .air.toml               # Live reload config
└── README.md               # This file
```

## Requirements

- Go 1.21 or higher
- Make (optional, but recommended)

## Getting Started

### Development

1. **Run the application:**
   ```bash
   make run
   ```
   The server will start on `http://localhost:8080`

2. **With live reload:**
   First install air:
   ```bash
   go install github.com/cosmtrek/air@latest
   ```
   Then run:
   ```bash
   make dev
   ```

### Production

1. **Build the binary:**
   ```bash
   make build
   ```
   The binary will be available at `./bin/dr-landing`

2. **Run the binary:**
   ```bash
   ./bin/dr-landing
   ```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/tickets/available` - Get available ticket count
- `POST /api/tickets/book` - Book a ticket

## Customization

### Modify Landing Page
Edit `static/html/index.html` to customize event details and design.

### Update Styles
Edit `static/css/style.css` to change colors and layout.

### Implement API Logic
Update the handler functions in `cmd/main/main.go` to implement ticket booking logic.

## Common Commands

```bash
make run      # Run the application
make build    # Build binary
make clean    # Clean build artifacts
make test     # Run tests
make fmt      # Format code
make lint     # Run linter (requires golangci-lint)
make dev      # Run with live reload
make tidy     # Tidy go.mod
```

## Next Steps

1. Implement ticket booking logic in the API handlers
2. Add a database for storing bookings
3. Add email notifications for ticket confirmations
4. Customize the landing page with your event details
5. Add payment processing (Stripe, PayPal, etc.)

## License

MIT
