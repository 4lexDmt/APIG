package proxy

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/rs/zerolog"

	"github.com/routeiq/gateway/internal/models"
)

const (
	providerName    = "openai"
	defaultTimeout  = 120 * time.Second
)

// ProviderRateLimitError is returned when the upstream provider returns 429.
type ProviderRateLimitError struct {
	RetryAfter string
}

func (e *ProviderRateLimitError) Error() string {
	return fmt.Sprintf("upstream provider rate limit exceeded, retry-after: %s", e.RetryAfter)
}

// ForwardResult holds metadata extracted after forwarding a request to OpenAI.
type ForwardResult struct {
	InputTokens  int
	OutputTokens int
	Model        string
	Cached       bool
	StatusCode   int
}

// Provider wraps the OpenAI HTTP API.
type Provider struct {
	httpClient *http.Client
	apiKey     string
	baseURL    string
	logger     zerolog.Logger
}

// NewProvider creates a new OpenAI provider.
func NewProvider(apiKey, baseURL string, logger zerolog.Logger) *Provider {
	return &Provider{
		httpClient: &http.Client{
			Timeout: defaultTimeout,
		},
		apiKey:  apiKey,
		baseURL: strings.TrimRight(baseURL, "/"),
		logger:  logger.With().Str("component", "openai-provider").Logger(),
	}
}

// Forward proxies the chat completion request to OpenAI and streams/copies the response.
func (p *Provider) Forward(ctx context.Context, req *models.ChatCompletionRequest, w http.ResponseWriter, traceID string) (*ForwardResult, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	endpoint := p.baseURL + "/chat/completions"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	if traceID != "" {
		httpReq.Header.Set("X-Request-ID", traceID)
	}

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("HTTP request to OpenAI failed: %w", err)
	}
	defer resp.Body.Close()

	// Handle provider rate limiting
	if resp.StatusCode == http.StatusTooManyRequests {
		retryAfter := resp.Header.Get("Retry-After")
		return nil, &ProviderRateLimitError{RetryAfter: retryAfter}
	}

	result := &ForwardResult{
		Model:      req.Model,
		StatusCode: resp.StatusCode,
	}

	// Copy relevant headers from upstream to client
	copyHeaders(w, resp.Header)

	// Set RouteIQ custom headers
	w.Header().Set("X-RouteIQ-Provider", providerName)
	w.Header().Set("X-RouteIQ-Model", req.Model)
	if traceID != "" {
		w.Header().Set("X-RouteIQ-Trace-ID", traceID)
	}

	if req.IsStream() {
		return p.handleStream(resp, w, result)
	}
	return p.handleNonStream(resp, w, result)
}

// handleNonStream reads the full response body, writes it to the client, and extracts usage.
func (p *Provider) handleNonStream(resp *http.Response, w http.ResponseWriter, result *ForwardResult) (*ForwardResult, error) {
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	w.WriteHeader(resp.StatusCode)
	if _, err := w.Write(respBody); err != nil {
		p.logger.Warn().Err(err).Msg("failed to write response body to client")
	}

	// Parse usage from the response JSON
	if resp.StatusCode == http.StatusOK {
		var completionResp models.ChatCompletionResponse
		if err := json.Unmarshal(respBody, &completionResp); err == nil {
			if completionResp.Usage != nil {
				result.InputTokens = completionResp.Usage.PromptTokens
				result.OutputTokens = completionResp.Usage.CompletionTokens
			}
			if completionResp.Model != "" {
				result.Model = completionResp.Model
			}
		}
	}

	return result, nil
}

// handleStream handles SSE streaming responses by piping chunks to the client.
func (p *Provider) handleStream(resp *http.Response, w http.ResponseWriter, result *ForwardResult) (*ForwardResult, error) {
	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(resp.StatusCode)

	flusher, canFlush := w.(http.Flusher)

	scanner := bufio.NewScanner(resp.Body)
	// Increase buffer for large chunks
	buf := make([]byte, 64*1024)
	scanner.Buffer(buf, 64*1024)

	for scanner.Scan() {
		line := scanner.Text()

		// Write raw SSE line to client
		if _, err := fmt.Fprintf(w, "%s\n", line); err != nil {
			p.logger.Warn().Err(err).Msg("stream write error")
			break
		}

		if canFlush {
			flusher.Flush()
		}

		// Parse data lines for usage extraction
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				continue
			}
			// Try to extract usage from stream chunk
			p.extractStreamUsage(data, result)
		}
	}

	if err := scanner.Err(); err != nil {
		p.logger.Warn().Err(err).Msg("stream scan error")
	}

	return result, nil
}

// extractStreamUsage attempts to extract token usage from a stream data chunk.
// OpenAI sends usage in the last chunk before [DONE] when stream_options.include_usage=true.
func (p *Provider) extractStreamUsage(data string, result *ForwardResult) {
	// Use a minimal struct to avoid full parse overhead
	var chunk struct {
		Model  string `json:"model"`
		Usage  *struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}

	if err := json.Unmarshal([]byte(data), &chunk); err != nil {
		return
	}

	if chunk.Model != "" {
		result.Model = chunk.Model
	}
	if chunk.Usage != nil {
		result.InputTokens = chunk.Usage.PromptTokens
		result.OutputTokens = chunk.Usage.CompletionTokens
	}
}

// copyHeaders copies safe response headers from upstream to the client writer.
func copyHeaders(w http.ResponseWriter, src http.Header) {
	// Headers to copy from upstream
	allowedHeaders := []string{
		"Content-Type",
		"Content-Length",
		"Openai-Model",
		"Openai-Processing-Ms",
		"Openai-Version",
		"X-Request-Id",
		"Retry-After",
	}

	for _, h := range allowedHeaders {
		if v := src.Get(h); v != "" {
			w.Header().Set(h, v)
		}
	}
}
