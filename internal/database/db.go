package database

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	var err error
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "tickets.db"
	}
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(&Registration{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
}

// Registration holds all guest registration data for the birthday party.
type Registration struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	Name            string    `gorm:"not null" json:"name"`
	// ArrivalTime stores one of: "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"
	ArrivalTime     string    `json:"arrival_time"`
	// JSON arrays / objects stored as text
	DrinkPrefs      string    `gorm:"type:text" json:"drink_prefs"`
	DressCodePrefs  string    `gorm:"type:text" json:"dress_code_prefs"`
	ActivityPrefs   string    `gorm:"type:text" json:"activity_prefs"`
	InvitationCode  string    `gorm:"uniqueIndex;not null" json:"invitation_code"`
	Avatar          string    `json:"avatar"`
	AdditionalInfo  string    `json:"additional_info"`
}
