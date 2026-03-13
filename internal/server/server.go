package server

import (
	"bytes"
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
	app.Post("/api/register/:code/prefs", handlers.UpdatePrefs)
	app.Get("/api/registrations", handlers.GetAllRegistrations)
	app.Delete("/api/registrations", handlers.DeleteAllRegistrations)
	app.Delete("/api/registrations/:id", handlers.DeleteRegistration)
	app.Get("/api/qr-image/:code", handlers.ServeQRCode)

	// Serve frontend SPA (embedded at build time)
	distFS, _ := fs.Sub(appstatic.DistFS, "dist")

	// index.html must never be cached — after a deploy, new Vite asset hashes
	// are only referenced in the new index.html. A stale cached copy causes a
	// blank screen until the user hard-refreshes.
	serveIndex := func(c fiber.Ctx) error {
		index, err := appstatic.DistFS.ReadFile("dist/index.html")
		if err != nil {
			return fiber.ErrNotFound
		}
		c.Set(fiber.HeaderContentType, fiber.MIMETextHTMLCharsetUTF8)
		c.Set(fiber.HeaderCacheControl, "no-cache, no-store, must-revalidate")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.Send(index)
	}
	app.Get("/", serveIndex)
	app.Get("/index.html", serveIndex)

	// /verify/:code — inject dynamic OG meta tags so Telegram previews show
	// guest-specific info. Telegram's crawler doesn't run JS, so we must
	// server-render the meta tags into the HTML before returning it.
	app.Get("/verify/:code", func(c fiber.Ctx) error {
		code := c.Params("code")
		title, description := handlers.OGTagsForCode(code)

		index, err := appstatic.DistFS.ReadFile("dist/index.html")
		if err != nil {
			return fiber.ErrNotFound
		}

		ogTags := `<meta property="og:title" content="` + title + `" />` +
			`<meta property="og:description" content="` + description + `" />` +
			`<meta property="og:type" content="website" />` +
			`<meta property="og:image" content="https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/512.png" />` +
			`<meta property="og:image:width" content="512" />` +
			`<meta property="og:image:height" content="512" />` +
			`<meta name="twitter:card" content="summary" />` +
			`<meta name="twitter:title" content="` + title + `" />` +
			`<meta name="twitter:description" content="` + description + `" />` +
			`<meta name="twitter:image" content="https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/512.png" />`

		patched := bytes.Replace(index, []byte(`</head>`), []byte(ogTags+`</head>`), 1)

		c.Set(fiber.HeaderContentType, fiber.MIMETextHTMLCharsetUTF8)
		c.Set(fiber.HeaderCacheControl, "no-cache, no-store, must-revalidate")
		c.Set("Pragma", "no-cache")
		c.Set("Expires", "0")
		return c.Send(patched)
	})

	// Vite content-hashes all filenames under /assets/, so they are safe to
	// cache indefinitely — the hash changes whenever the content changes.
	app.Use("/assets", func(c fiber.Ctx) error {
		c.Set(fiber.HeaderCacheControl, "public, max-age=31536000, immutable")
		return c.Next()
	})

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
			c.Set(fiber.HeaderCacheControl, "no-cache, no-store, must-revalidate")
			c.Set("Pragma", "no-cache")
			c.Set("Expires", "0")
			return c.Send(index)
		},
	}))

	return app
}
