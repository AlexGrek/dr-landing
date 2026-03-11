package main

import (
	"log"
	"os"
	"os/signal"

	"dr-landing/internal/database"
	"dr-landing/internal/server"
)

func main() {
	// Initialize database
	database.Init()

	// Create Fiber app
	app := server.New()

	// Start server
	go func() {
		log.Println("Starting server on :8080")
		if err := app.Listen(":8080"); err != nil {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)
	<-sigChan

	log.Println("Shutting down...")
	app.Shutdown()
}
