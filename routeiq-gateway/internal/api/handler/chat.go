package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"

	"github.com/routeiq/gateway/internal/models"
	"github.com/routeiq/gateway/internal/proxy"
	"github.com/routeiq/gateway/internal/ratelimit"
)

// ChatHandler handles POST /v1/chat/completions.
type ChatHandler struct {
	provider *proxy.Provider
	limiter  *ratelimit.Limiter
	db       *pgxpool.Pool
	logger   zerolog.Logger
}

// NewChatHandler creates a new ChatHandler.
func NewChatHandler(provider *proxy.Provider, limiter *ratelimit.Limiter, db *pgxpool.Pool, logger zerolog.Logger) *ChatHandler {
	return &ChatHandler{
		provider: provider,
		limiter:  limiter,
		db:       db,
		logger:   logger.With().Str("component", "chat-handler").Logger(),
	}
}

// Handle processes POST /v1/chat/completions requests.
func (h *ChatHandler) Handle(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// Step 1: Extract trace context
	traceID := TraceIDFromContext(r.Context())

	// Step 2: Parse and validate request body
	var req models.ChatCompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Failed to parse request body: "+err.Error())
		return
	}
	if err := proxy.ValidateRequest(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	// Step 3: Extract AgentIdentity from context
	identity := AgentIdentityFromContext(r.Context())
	if identity == nil {
		h.writeError(w, http.StatusUnauthorized, "missing_identity", "Agent identity not found in context")
		return
	}

	// Step 4: Log request start
	estimatedInputTokens := proxy.EstimateInputTokens(&req)
	h.logger.Info().
		Str("trace_id", traceID).
		Str("agent_id", identity.AgentID).
		Str("model_requested", req.Model).
		Int("estimated_input_tokens", estimatedInputTokens).
		Bool("stream", req.IsStream()).
		Msg("chat completion request started")

	// Step 5: Check rate limit
	if err := h.limiter.Check(r.Context(), identity.AgentID); err != nil {
		if rlErr, ok := err.(*ratelimit.ErrRateLimitExceeded); ok {
			retryAfterSecs := int(rlErr.RetryAfter.Seconds())
			w.Header().Set("Retry-After", fmt.Sprintf("%d", retryAfterSecs))
			h.writeError(w, http.StatusTooManyRequests, "rate_limit_exceeded",
				fmt.Sprintf("Rate limit exceeded. Retry after %d seconds.", retryAfterSecs))
			return
		}
		h.logger.Error().Err(err).Str("agent_id", identity.AgentID).Msg("rate limit check error")
		h.writeError(w, http.StatusInternalServerError, "internal_error", "Rate limit check failed")
		return
	}

	// Step 6: Forward to OpenAI provider
	result, err := h.provider.Forward(r.Context(), &req, w, traceID)

	latencyMs := int(time.Since(start).Milliseconds())

	if err != nil {
		// Handle provider-specific errors
		if _, ok := err.(*proxy.ProviderRateLimitError); ok {
			h.writeError(w, http.StatusTooManyRequests, "provider_rate_limit",
				"Upstream provider rate limit exceeded. Please retry later.")
			return
		}
		h.logger.Error().
			Err(err).
			Str("trace_id", traceID).
			Str("agent_id", identity.AgentID).
			Msg("provider forward failed")
		h.writeError(w, http.StatusBadGateway, "provider_error", "Failed to communicate with AI provider")
		return
	}

	// Step 7: Calculate cost and log completion
	costUSD := proxy.CalculateCostUSD("openai", result.Model, result.InputTokens, result.OutputTokens)
	w.Header().Set("X-RouteIQ-Cost-USD", fmt.Sprintf("%.8f", costUSD))

	h.logger.Info().
		Str("trace_id", traceID).
		Str("agent_id", identity.AgentID).
		Str("provider", "openai").
		Str("model", result.Model).
		Int("input_tokens", result.InputTokens).
		Int("output_tokens", result.OutputTokens).
		Float64("cost_usd", costUSD).
		Int("latency_ms", latencyMs).
		Int("status_code", result.StatusCode).
		Msg("chat completion finished")

	// Step 8: Async write to PostgreSQL (non-blocking)
	apiReq := &models.APIRequest{
		AgentID:      identity.AgentID,
		Provider:     "openai",
		Model:        result.Model,
		InputTokens:  result.InputTokens,
		OutputTokens: result.OutputTokens,
		CostUSD:      costUSD,
		LatencyMs:    latencyMs,
		Cached:       result.Cached,
		Stream:       req.IsStream(),
		StatusCode:   result.StatusCode,
		TraceID:      traceID,
		RoutedAt:     start,
	}

	go h.persistRequest(apiReq, costUSD)
}

// persistRequest writes the API request and cost log to PostgreSQL asynchronously.
func (h *ChatHandler) persistRequest(apiReq *models.APIRequest, costUSD float64) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var requestID string
	err := h.db.QueryRow(ctx, `
		INSERT INTO api_requests (agent_id, provider, model, input_tokens, output_tokens, cost_usd,
			latency_ms, cached, stream, status_code, error_code, trace_id, routed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id
	`,
		apiReq.AgentID, apiReq.Provider, apiReq.Model,
		apiReq.InputTokens, apiReq.OutputTokens, apiReq.CostUSD,
		apiReq.LatencyMs, apiReq.Cached, apiReq.Stream,
		apiReq.StatusCode, nullIfEmpty(apiReq.ErrorCode),
		nullIfEmpty(apiReq.TraceID), apiReq.RoutedAt,
	).Scan(&requestID)

	if err != nil {
		h.logger.Error().Err(err).Str("agent_id", apiReq.AgentID).Msg("failed to persist api_request")
		return
	}

	// Write cost log entry
	if costUSD > 0 {
		_, err = h.db.Exec(ctx, `
			INSERT INTO cost_logs (agent_id, request_id, amount_usd, provider)
			VALUES ($1, $2, $3, $4)
		`, apiReq.AgentID, requestID, costUSD, apiReq.Provider)

		if err != nil {
			h.logger.Error().Err(err).Str("request_id", requestID).Msg("failed to persist cost_log")
		}
	}
}

// writeError writes a JSON error response in OpenAI error format.
func (h *ChatHandler) writeError(w http.ResponseWriter, statusCode int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.ErrorResponse{
		Error: models.APIError{
			Message: message,
			Type:    "routeiq_error",
			Code:    code,
		},
	})
}

// nullIfEmpty returns nil for empty strings, used when inserting optional fields.
func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
