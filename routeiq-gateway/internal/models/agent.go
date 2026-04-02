package models

import "time"

// Agent represents an AI agent registered in RouteIQ.
type Agent struct {
	ID           string    `json:"id" db:"id"`
	TeamID       string    `json:"team_id" db:"team_id"`
	Name         string    `json:"name" db:"name"`
	APIKeyHash   string    `json:"-" db:"api_key_hash"`
	APIKeyPrefix string    `json:"api_key_prefix" db:"api_key_prefix"`
	DailyBudgetUSD *float64 `json:"daily_budget_usd,omitempty" db:"daily_budget_usd"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}
