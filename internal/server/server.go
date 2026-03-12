package server

import (
	"io/fs"

	"dr-landing/internal/handlers"
	appstatic "dr-landing/internal/static"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/static"
)

func New(version string) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "dr-landing",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// API Routes
	app.Get("/api/health", handlers.Health(version))
	app.Post("/api/register", handlers.Register)
	app.Get("/api/register/:code", handlers.GetRegistration)
	app.Get("/api/registrations", handlers.GetAllRegistrations)
	app.Delete("/api/registrations/:id", handlers.DeleteRegistration)
	app.Get("/api/qr-image/:code", handlers.ServeQRCode)

	// Serve frontend SPA (embedded at build time)
	distFS, _ := fs.Sub(appstatic.DistFS, "dist")
	app.Use(static.New("", static.Config{
		FS:     distFS,
		Browse: false,
		// SPA fallback: serve index.html for any unmatched route (react-router)
		NotFoundHandler: func(c fiber.Ctx) error {
			index, err := appstatic.DistFS.ReadFile("dist/index.html")
			if err != nil {
				return fiber.ErrNotFound
			}
			c.Set(fiber.HeaderContentType, fiber.MIMETextHTMLCharsetUTF8)
			c.Set(fiber.HeaderCacheControl, "no-cache")
			c.Set("Pragma", "no-cache")
			return c.Send(index)
		},
	}))

	return app
}
