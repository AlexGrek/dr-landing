package handlers

import (
	"dr-landing/internal/database"

	"github.com/gofiber/fiber/v3"
)

type RegisterRequest struct {
	Name           string `json:"name"`
	ArrivalTime    string `json:"arrival_time"`
	DrinkPrefs     string `json:"drink_prefs"`
	DressCodePrefs string `json:"dress_code_prefs"`
	ActivityPrefs  string `json:"activity_prefs"`
	InvitationCode string `json:"invitation_code"`
	Avatar         string `json:"avatar"`
	AdditionalInfo string `json:"additional_info"`
}

func Register(c fiber.Ctx) error {
	var req RegisterRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Name == "" || req.InvitationCode == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name and invitation_code are required"})
	}

	reg := database.Registration{
		Name:           req.Name,
		ArrivalTime:    req.ArrivalTime,
		DrinkPrefs:     req.DrinkPrefs,
		DressCodePrefs: req.DressCodePrefs,
		ActivityPrefs:  req.ActivityPrefs,
		InvitationCode: req.InvitationCode,
		Avatar:         req.Avatar,
		AdditionalInfo: req.AdditionalInfo,
	}
	if err := database.DB.Create(&reg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to register"})
	}
	return c.Status(201).JSON(reg)
}

func GetRegistration(c fiber.Ctx) error {
	code := c.Params("code")
	var reg database.Registration
	if err := database.DB.Where("invitation_code = ?", code).First(&reg).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}
	return c.JSON(reg)
}

func Health(version string) fiber.Handler {
	return func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "healthy", "version": version})
	}
}
