package auth

import "time"

// AgentIdentity holds the identity of an authenticated agent extracted from the API key.
type AgentIdentity struct {
	AgentID        string    `json:"agent_id"`
	OrgID          string    `json:"org_id"`
	TeamID         string    `json:"team_id"`
	Name           string    `json:"name"`
	DailyBudgetUSD float64   `json:"daily_budget_usd"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

// AuthError represents authentication/authorization errors.
type AuthError struct {
	Code    string
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

// Common auth error codes
const (
	ErrCodeInvalidAPIKey  = "invalid_api_key"
	ErrCodeAgentSuspended = "agent_suspended"
	ErrCodeKeyExpired     = "key_expired"
)
