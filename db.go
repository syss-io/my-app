package myapp

import (
	"fmt"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the database connection
// It connects to Turso if TURSO_DATABASE_URL is set, otherwise uses local SQLite
func InitDB() error {
	var err error
	var dialector gorm.Dialector

	tursoURL := os.Getenv("TURSO_DATABASE_URL")
	tursoToken := os.Getenv("TURSO_AUTH_TOKEN")

	if tursoURL != "" {
		// Connect to Turso (libsql)
		// Turso uses libsql protocol which is SQLite-compatible
		// The URL format is typically: libsql://[host]
		// We need to construct a connection string with the auth token
		dsn := tursoURL
		if tursoToken != "" {
			// For libsql/Turso, the token is passed as a query parameter
			dsn = fmt.Sprintf("%s?authToken=%s", tursoURL, tursoToken)
		}

		dialector = sqlite.Open(dsn)
		fmt.Println("Connecting to Turso database:", tursoURL)
	} else {
		// Use local SQLite for development
		// The database file will be created in the current directory
		dsn := "local.db"
		dialector = sqlite.Open(dsn)
		fmt.Println("Connecting to local SQLite database:", dsn)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the models
	if err := DB.AutoMigrate(&Chat{}, &Message{}); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	fmt.Println("Database connected and migrated successfully")
	return nil
}
