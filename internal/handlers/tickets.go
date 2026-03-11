package handlers

import (
	"dr-landing/internal/database"

	"github.com/gofiber/fiber/v3"
)

type BookTicketRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func GetAvailableTickets(c fiber.Ctx) error {
	var ticketStats struct {
		Available int
		Sold      int
	}

	database.DB.Model(&database.Ticket{}).Select("available, sold").First(&ticketStats)

	return c.JSON(fiber.Map{
		"available": ticketStats.Available,
		"sold":      ticketStats.Sold,
		"total":     ticketStats.Available + ticketStats.Sold,
	})
}

func BookTicket(c fiber.Ctx) error {
	var req BookTicketRequest

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Name == "" || req.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name and email are required"})
	}

	// Update ticket counts and create booking
	var ticket database.Ticket
	if err := database.DB.First(&ticket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	if ticket.Available <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No tickets available"})
	}

	// Create booking record
	booking := database.Ticket{
		Name:  req.Name,
		Email: req.Email,
	}
	if err := database.DB.Create(&booking).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to book ticket"})
	}

	// Update available count
	database.DB.Model(&ticket).Update("sold", ticket.Sold+1)

	return c.Status(201).JSON(fiber.Map{
		"message":   "Ticket booked successfully",
		"booking_id": booking.ID,
	})
}

func Health(version string) fiber.Handler {
	return func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "healthy", "version": version})
	}
}
