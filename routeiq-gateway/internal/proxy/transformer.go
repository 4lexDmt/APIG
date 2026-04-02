package proxy

import (
	"fmt"

	"github.com/routeiq/gateway/internal/models"
)

// ValidateRequest validates the chat completion request structure.
func ValidateRequest(req *models.ChatCompletionRequest) error {
	return req.Validate()
}

// EstimateInputTokens provides a rough token count estimate for the request.
// Uses the heuristic: total character count / 4.
func EstimateInputTokens(req *models.ChatCompletionRequest) int {
	total := 0
	for _, msg := range req.Messages {
		switch v := msg.Content.(type) {
		case string:
			total += len(v)
		case []interface{}:
			for _, part := range v {
				if m, ok := part.(map[string]interface{}); ok {
					if text, ok := m["text"].(string); ok {
						total += len(text)
					}
				}
			}
		case []models.ContentPart:
			for _, part := range v {
				total += len(part.Text)
			}
		}
		// Count role and name characters too
		total += len(msg.Role) + len(msg.Name)
	}
	if total == 0 {
		return 0
	}
	estimate := total / 4
	if estimate < 1 {
		estimate = 1
	}
	return estimate
}

// pricing holds cost per 1000 tokens for a model.
type pricing struct {
	inputPer1K  float64
	outputPer1K float64
}

// modelPricing maps provider+model combos to pricing.
var modelPricing = map[string]pricing{
	"openai/gpt-4o":           {inputPer1K: 0.005, outputPer1K: 0.015},
	"openai/gpt-3.5-turbo":    {inputPer1K: 0.0005, outputPer1K: 0.0015},
	// Aliases without provider prefix
	"gpt-4o":        {inputPer1K: 0.005, outputPer1K: 0.015},
	"gpt-3.5-turbo": {inputPer1K: 0.0005, outputPer1K: 0.0015},
}

// CalculateCostUSD computes the estimated USD cost for a request/response.
func CalculateCostUSD(provider, model string, inputTokens, outputTokens int) float64 {
	// Try provider-qualified lookup first
	key := fmt.Sprintf("%s/%s", provider, model)
	p, ok := modelPricing[key]
	if !ok {
		// Try model-only lookup
		p, ok = modelPricing[model]
	}

	if !ok {
		// Default fallback: $0.01 per 1K total tokens
		total := inputTokens + outputTokens
		return float64(total) / 1000.0 * 0.01
	}

	inputCost := float64(inputTokens) / 1000.0 * p.inputPer1K
	outputCost := float64(outputTokens) / 1000.0 * p.outputPer1K
	return inputCost + outputCost
}
