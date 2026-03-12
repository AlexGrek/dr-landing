package handlers

import (
	"dr-landing/internal/database"
	"dr-landing/internal/services"
	"os"

	"github.com/gofiber/fiber/v3"
	qrcode "github.com/skip2/go-qrcode"
)

type RegisterRequest struct {
	Name           string `json:"name"`
	ArrivalTime    string `json:"arrival_time"`
	DrinkPrefs     string `json:"drink_prefs"`
	DressCodePrefs string `json:"dress_code_prefs"`
	ActivityPrefs  string `json:"activity_prefs"`
	Avatar         string `json:"avatar"`
	AdditionalInfo string `json:"additional_info"`
}

type RegisterResponse struct {
	*database.Registration
	QRCode string `json:"qr_code"` // base64-encoded PNG
}

func Register(c fiber.Ctx) error {
	var req RegisterRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}

	// Generate QR code and get the random invitation code
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	invitationCode, qrBase64, err := services.GenerateQRCodeBase64(baseURL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate QR code"})
	}

	reg := database.Registration{
		Name:           req.Name,
		ArrivalTime:    req.ArrivalTime,
		DrinkPrefs:     req.DrinkPrefs,
		DressCodePrefs: req.DressCodePrefs,
		ActivityPrefs:  req.ActivityPrefs,
		InvitationCode: invitationCode,
		Avatar:         req.Avatar,
		AdditionalInfo: req.AdditionalInfo,
	}
	if err := database.DB.Create(&reg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to register"})
	}
	return c.Status(201).JSON(RegisterResponse{
		Registration: &reg,
		QRCode:       qrBase64,
	})
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

func ServeQRCode(c fiber.Ctx) error {
	code := c.Params("code")
	var reg database.Registration

	// Verify the code exists
	if err := database.DB.Where("invitation_code = ?", code).First(&reg).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "QR code not found"})
	}

	// Generate QR code for verification page
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	verifyURL := baseURL + "/verify/" + code

	pngData, err := qrcode.Encode(verifyURL, qrcode.Medium, 256)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate QR code"})
	}

	c.Set(fiber.HeaderContentType, "image/png")
	return c.Send(pngData)
}

func GetAllRegistrations(c fiber.Ctx) error {
	var registrations []database.Registration
	if err := database.DB.Find(&registrations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch registrations"})
	}
	return c.JSON(fiber.Map{
		"total":          len(registrations),
		"registrations": registrations,
	})
}
