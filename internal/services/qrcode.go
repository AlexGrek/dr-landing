package services

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"

	qrcode "github.com/skip2/go-qrcode"
)

// GenerateQRCode creates a QR code pointing to the given base URL with a random code
// Returns the 16-character random code string and the PNG image bytes
func GenerateQRCode(baseURL string) (code string, pngData []byte, err error) {
	code = generateRandomCode(16)
	qrURL := fmt.Sprintf("%s/qr/%s", baseURL, code)

	pngData, err = qrcode.Encode(qrURL, qrcode.Medium, 256)
	if err != nil {
		return "", nil, err
	}

	return code, pngData, nil
}

// GenerateRandomCode creates a random alphanumeric string of 16 characters
func GenerateRandomCode() string {
	return generateRandomCode(16)
}

// generateRandomCode creates a random alphanumeric string of specified length
func generateRandomCode(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	bytes := make([]byte, length)
	for i := range bytes {
		idx := make([]byte, 1)
		if _, err := rand.Read(idx); err != nil {
			panic(err)
		}
		bytes[i] = charset[idx[0]%byte(len(charset))]
	}

	return string(bytes)
}

// GenerateQRCodeBase64 returns the QR code as base64-encoded PNG (useful for embedding in responses)
func GenerateQRCodeBase64(baseURL string) (code string, base64Data string, err error) {
	code, pngData, err := GenerateQRCode(baseURL)
	if err != nil {
		return "", "", err
	}

	base64Data = "data:image/png;base64," + base64.StdEncoding.EncodeToString(pngData)
	return code, base64Data, nil
}

// SaveQRCodeToDisk saves a QR code PNG to disk and returns the file path
func SaveQRCodeToDisk(invitationCode string, verifyURL string, qrDir string) (string, error) {
	// Ensure directory exists
	if err := os.MkdirAll(qrDir, 0755); err != nil {
		return "", err
	}

	// Generate QR code
	pngData, err := qrcode.Encode(verifyURL, qrcode.Medium, 256)
	if err != nil {
		return "", err
	}

	// Save to disk
	filePath := filepath.Join(qrDir, invitationCode+".png")
	if err := os.WriteFile(filePath, pngData, 0644); err != nil {
		return "", err
	}

	return filePath, nil
}
