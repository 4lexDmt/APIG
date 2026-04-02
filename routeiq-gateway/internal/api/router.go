package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"

	"github.com/routeiq/gateway/internal/api/handler"
	"github.com/routeiq/gateway/internal/auth"
)

// NewRouter creates and configures the chi router with all routes and middleware.
func NewRouter(
	chatHandler *handler.ChatHandler,
	healthHandler *handler.HealthHandler,
	keystore *auth.KeyStore,
	logger zerolog.Logger,
) http.Handler {
	r := chi.NewRouter()

	// Global middleware stack
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)
	r.Use(handler.RequestIDMiddleware)
	r.Use(handler.TraceMiddleware)
	r.Use(handler.LoggingMiddleware(logger))

	// Public health endpoints (no auth required)
	r.Get("/health", healthHandler.Health)
	r.Get("/ready", healthHandler.Ready)

	// Protected API endpoints
	r.Group(func(r chi.Router) {
		r.Use(handler.AuthMiddleware(keystore))
		r.Post("/v1/chat/completions", chatHandler.Handle)
	})

	return r
}

// corsMiddleware adds permissive CORS headers for the MVP.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID, X-Trace-ID")
		w.Header().Set("Access-Control-Expose-Headers", "X-RouteIQ-Provider, X-RouteIQ-Model, X-RouteIQ-Cost-USD, X-RouteIQ-Trace-ID, X-Request-ID, X-Trace-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
