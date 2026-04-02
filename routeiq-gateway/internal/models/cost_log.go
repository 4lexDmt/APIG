package models

import "time"

// APIRequest is a persisted record of a proxied LLM API call.
type APIRequest struct {
	ID           string    `json:"id"`
	AgentID      string    `json:"agent_id"`
	Provider     string    `json:"provider"`
	Model        string    `json:"model"`
	InputTokens  int       `json:"input_tokens"`
	OutputTokens int       `json:"output_tokens"`
	CostUSD      float64   `json:"cost_usd"`
	LatencyMs    int       `json:"latency_ms"`
	Cached       bool      `json:"cached"`
	Stream       bool      `json:"stream"`
	StatusCode   int       `json:"status_code"`
	ErrorCode    string    `json:"error_code,omitempty"`
	TraceID      string    `json:"trace_id,omitempty"`
	RoutedAt     time.Time `json:"routed_at"`
}

// CostLog records a per-request cost entry.
type CostLog struct {
	ID        string    `json:"id"`
	AgentID   string    `json:"agent_id"`
	RequestID string    `json:"request_id"`
	AmountUSD float64   `json:"amount_usd"`
	Provider  string    `json:"provider"`
	LoggedAt  time.Time `json:"logged_at"`
}
