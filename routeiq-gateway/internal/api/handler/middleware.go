package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/rs/zerolog"

	"github.com/routeiq/gateway/internal/auth"
	"github.com/routeiq/gateway/internal/models"
)

// contextKey is a typed key to avoid collisions in context values.
type contextKey string

const (
	// ContextKeyTraceID is the context key for the trace/request ID.
	ContextKeyTraceID contextKey = "trace_id"
	// ContextKeyRequestID is the context key for the unique request ID.
	ContextKeyRequestID contextKey = "request_id"
	// ContextKeyAgentIdentity is the context key for the authenticated agent identity.
	ContextKeyAgentIdentity contextKey = "agent_identity"
)

// TraceIDFromContext retrieves the trace ID from the context.
func TraceIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ContextKeyTraceID).(string); ok {
		return v
	}
	return ""
}

// AgentIdentityFromContext retrieves the AgentIdentity from the context.
func AgentIdentityFromContext(ctx context.Context) *auth.AgentIdentity {
	if v, ok := ctx.Value(ContextKeyAgentIdentity).(*auth.AgentIdentity); ok {
		return v
	}
	return nil
}

// RequestIDFromContext retrieves the request ID from the context.
func RequestIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(ContextKeyRequestID).(string); ok {
		return v
	}
	return ""
}

// TraceMiddleware extracts or generates a trace ID from the incoming request headers.
// It injects the trace ID into the context and the response headers.
func TraceMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := r.Header.Get("X-Trace-ID")
		if traceID == "" {
			traceID = r.Header.Get("X-Request-ID")
		}
		if traceID == "" {
			traceID = generateID()
		}

		ctx := context.WithValue(r.Context(), ContextKeyTraceID, traceID)
		w.Header().Set("X-Trace-ID", traceID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequestIDMiddleware generates a unique request ID if not already present,
// and injects it into the context and response header.
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = generateID()
		}

		ctx := context.WithValue(r.Context(), ContextKeyRequestID, requestID)
		w.Header().Set("X-Request-ID", requestID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AuthMiddleware validates the "Authorization: Bearer {key}" header.
// On success it injects the AgentIdentity into the context.
// On failure it returns a 401 JSON error response.
func AuthMiddleware(keystore *auth.KeyStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeAuthError(w, "missing Authorization header", "missing_auth_header", http.StatusUnauthorized)
				return
			}

			const bearerPrefix = "Bearer "
			if !strings.HasPrefix(authHeader, bearerPrefix) {
				writeAuthError(w, "invalid Authorization header format, expected 'Bearer {key}'", "invalid_auth_format", http.StatusUnauthorized)
				return
			}

			rawKey := strings.TrimPrefix(authHeader, bearerPrefix)
			if rawKey == "" {
				writeAuthError(w, "missing API key", "missing_api_key", http.StatusUnauthorized)
				return
			}

			identity, err := keystore.ValidateKey(r.Context(), rawKey)
			if err != nil {
				if authErr, ok := err.(*auth.AuthError); ok {
					switch authErr.Code {
					case auth.ErrCodeAgentSuspended:
						writeAuthError(w, authErr.Message, authErr.Code, http.StatusForbidden)
					default:
						writeAuthError(w, authErr.Message, authErr.Code, http.StatusUnauthorized)
					}
					return
				}
				writeAuthError(w, "authentication failed", "auth_error", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyAgentIdentity, identity)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// LoggingMiddleware logs every request with key fields.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (sr *statusRecorder) WriteHeader(status int) {
	sr.status = status
	sr.ResponseWriter.WriteHeader(status)
}

// LoggingMiddleware returns a middleware that logs each HTTP request.
func LoggingMiddleware(logger zerolog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)

			latencyMs := time.Since(start).Milliseconds()
			traceID := TraceIDFromContext(r.Context())
			agentID := ""
			if identity := AgentIdentityFromContext(r.Context()); identity != nil {
				agentID = identity.AgentID
			}

			logger.Info().
				Str("trace_id", traceID).
				Str("agent_id", agentID).
				Str("method", r.Method).
				Str("path", r.URL.Path).
				Int("status", rec.status).
				Int64("latency_ms", latencyMs).
				Str("remote_addr", r.RemoteAddr).
				Msg("request completed")
		})
	}
}

// writeAuthError writes a JSON 401/403 error response.
func writeAuthError(w http.ResponseWriter, message, code string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.ErrorResponse{
		Error: models.APIError{
			Message: message,
			Type:    "authentication_error",
			Code:    code,
		},
	})
}

// generateID creates a cryptographically random 16-byte hex string (32 chars)
// suitable for use as a request or trace ID.
func generateID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// Extremely unlikely — fall back to timestamp-based ID
		return strings.ReplaceAll(time.Now().UTC().Format("20060102150405.000000000"), ".", "")
	}
	return hex.EncodeToString(b)
}
