package server

import (
	"dr-landing/internal/handlers"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
)

func New() *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "dr-landing",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// API Routes
	app.Get("/api/health", handlers.Health)
	app.Get("/api/tickets/available", handlers.GetAvailableTickets)
	app.Post("/api/tickets/book", handlers.BookTicket)

	return app
}
