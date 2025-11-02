package myapp

import (
	"time"

	"gorm.io/gorm"
)

// Chat represents a chat session
type Chat struct {
	ID        string         `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID    string         `gorm:"type:varchar(255);not null;index" json:"user_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Messages  []Message      `gorm:"foreignKey:ChatID" json:"messages,omitempty"`
}

// Message represents a single message in a chat
type Message struct {
	ID        string         `gorm:"type:varchar(36);primaryKey" json:"id"`
	ChatID    string         `gorm:"type:varchar(36);not null;index" json:"chat_id"`
	Role      string         `gorm:"type:varchar(50);not null" json:"role"` // user, assistant, system
	Content   string         `gorm:"type:text;not null" json:"content"`     // JSON string
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Chat      *Chat          `gorm:"foreignKey:ChatID" json:"-"`
}
