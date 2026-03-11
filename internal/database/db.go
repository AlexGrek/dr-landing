package database

import (
	"log"
	"os"

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

	// Auto-migrate the Ticket model
	err = DB.AutoMigrate(&Ticket{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Seed initial data if table is empty
	var count int64
	DB.Model(&Ticket{}).Count(&count)
	if count == 0 {
		DB.Create(&Ticket{Available: 100, Sold: 0})
	}
}

type Ticket struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Available int    `json:"available"`
	Sold      int    `json:"sold"`
	Name      string `json:"name"`
	Email     string `json:"email"`
}
