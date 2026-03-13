package handlers

import (
	"dr-landing/internal/database"
	"dr-landing/internal/services"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v3"
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

func Register(c fiber.Ctx) error {
	var req RegisterRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}

	// Generate invitation code
	invitationCode := services.GenerateRandomCode()

	// Set up QR code directory
	qrDir := os.Getenv("QR_DIR")
	if qrDir == "" {
		qrDir = "./data/qrcodes"
	}

	// Generate and save QR code to disk
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	verifyURL := baseURL + "/verify/" + invitationCode

	if _, err := services.SaveQRCodeToDisk(invitationCode, verifyURL, qrDir); err != nil {
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
	return c.Status(201).JSON(&reg)
}

type UpdatePrefsRequest struct {
	DrinkPrefs     string `json:"drink_prefs"`
	DressCodePrefs string `json:"dress_code_prefs"`
	ActivityPrefs  string `json:"activity_prefs"`
	ArrivalTime    string `json:"arrival_time"`
	AdditionalInfo string `json:"additional_info"`
}

func UpdatePrefs(c fiber.Ctx) error {
	code := c.Params("code")
	var reg database.Registration
	if err := database.DB.Where("invitation_code = ?", code).First(&reg).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}
	var req UpdatePrefsRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	reg.DrinkPrefs = req.DrinkPrefs
	reg.DressCodePrefs = req.DressCodePrefs
	reg.ActivityPrefs = req.ActivityPrefs
	reg.ArrivalTime = req.ArrivalTime
	reg.AdditionalInfo = req.AdditionalInfo
	if err := database.DB.Save(&reg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update"})
	}
	return c.JSON(&reg)
}

func GetRegistration(c fiber.Ctx) error {
	code := c.Params("code")
	var reg database.Registration
	if err := database.DB.Where("invitation_code = ?", code).First(&reg).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}
	return c.JSON(reg)
}

// OGTagsForCode returns OG title and description for a /verify/:code page.
// Called server-side so Telegram's crawler sees the meta tags before JS runs.
func OGTagsForCode(code string) (title, description string) {
	var reg database.Registration
	if err := database.DB.Where("invitation_code = ?", code).First(&reg).Error; err != nil {
		return "Birthday Party 3.0 🎉", "You're invited to Birthday Party 3.0 — March 22, 2026 at Wabi Sabi Space, Kyiv."
	}
	title = "🎟 " + reg.Name + " — Birthday Party 3.0"
	description = "Arrival: " + reg.ArrivalTime + " · March 22, 2026 · Wabi Sabi Space, Kyiv"
	return title, description
}

func Health(version string) fiber.Handler {
	return func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "healthy", "version": version})
	}
}

func ServeQRCode(c fiber.Ctx) error {
	code := c.Params("code")

	// Set up QR code directory (must match where they're saved)
	qrDir := os.Getenv("QR_DIR")
	if qrDir == "" {
		qrDir = "./data/qrcodes"
	}

	// Read QR code from disk
	qrFile := filepath.Join(qrDir, code+".png")
	pngData, err := os.ReadFile(qrFile)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "QR code not found"})
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

func qrDir() string {
	if d := os.Getenv("QR_DIR"); d != "" {
		return d
	}
	return "./data/qrcodes"
}

func deleteQRFile(invitationCode string) {
	_ = os.Remove(filepath.Join(qrDir(), invitationCode+".png"))
}

func DeleteAllRegistrations(c fiber.Ctx) error {
	if err := database.DB.Where("1 = 1").Delete(&database.Registration{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete registrations"})
	}
	// Remove the entire QR directory (stalled files included), recreate it empty.
	dir := qrDir()
	_ = os.RemoveAll(dir)
	_ = os.MkdirAll(dir, 0755)
	return c.JSON(fiber.Map{"success": true})
}

func DeleteRegistration(c fiber.Ctx) error {
	id := c.Params("id")
	var reg database.Registration
	if err := database.DB.First(&reg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}
	if err := database.DB.Delete(&reg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete registration"})
	}
	deleteQRFile(reg.InvitationCode)
	return c.JSON(fiber.Map{"success": true})
}
