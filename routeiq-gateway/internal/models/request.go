package models

import (
	"errors"
	"fmt"
)

// ChatCompletionRequest represents the full OpenAI /v1/chat/completions request body.
type ChatCompletionRequest struct {
	Model            string      `json:"model"`
	Messages         []ChatMessage `json:"messages"`
	Temperature      *float64    `json:"temperature,omitempty"`
	MaxTokens        *int        `json:"max_tokens,omitempty"`
	Stream           *bool       `json:"stream,omitempty"`
	TopP             *float64    `json:"top_p,omitempty"`
	FrequencyPenalty *float64    `json:"frequency_penalty,omitempty"`
	PresencePenalty  *float64    `json:"presence_penalty,omitempty"`
	Stop             interface{} `json:"stop,omitempty"`
	User             string      `json:"user,omitempty"`
	ResponseFormat   *ResponseFormat `json:"response_format,omitempty"`
	Tools            []Tool      `json:"tools,omitempty"`
	ToolChoice       interface{} `json:"tool_choice,omitempty"`
}

// Validate checks the request for required fields and valid values.
func (r *ChatCompletionRequest) Validate() error {
	if r.Model == "" {
		return errors.New("model is required")
	}
	if len(r.Messages) == 0 {
		return errors.New("messages must not be empty")
	}
	for i, msg := range r.Messages {
		if msg.Role == "" {
			return fmt.Errorf("messages[%d].role is required", i)
		}
		switch msg.Role {
		case "system", "user", "assistant", "tool", "function":
			// valid roles
		default:
			return fmt.Errorf("messages[%d].role '%s' is invalid", i, msg.Role)
		}
	}
	if r.Temperature != nil {
		if *r.Temperature < 0 || *r.Temperature > 2 {
			return errors.New("temperature must be between 0 and 2")
		}
	}
	if r.TopP != nil {
		if *r.TopP < 0 || *r.TopP > 1 {
			return errors.New("top_p must be between 0 and 1")
		}
	}
	if r.FrequencyPenalty != nil {
		if *r.FrequencyPenalty < -2 || *r.FrequencyPenalty > 2 {
			return errors.New("frequency_penalty must be between -2 and 2")
		}
	}
	if r.PresencePenalty != nil {
		if *r.PresencePenalty < -2 || *r.PresencePenalty > 2 {
			return errors.New("presence_penalty must be between -2 and 2")
		}
	}
	return nil
}

// IsStream returns true if streaming is requested.
func (r *ChatCompletionRequest) IsStream() bool {
	return r.Stream != nil && *r.Stream
}

// ChatMessage represents a single message in the conversation.
type ChatMessage struct {
	Role       string      `json:"role"`
	Content    interface{} `json:"content,omitempty"` // string or []ContentPart
	Name       string      `json:"name,omitempty"`
	ToolCallID string      `json:"tool_call_id,omitempty"`
	ToolCalls  []ToolCall  `json:"tool_calls,omitempty"`
}

// ContentPart is a part of a multi-modal message content array.
type ContentPart struct {
	Type     string    `json:"type"`
	Text     string    `json:"text,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

// ImageURL holds an image URL reference in a content part.
type ImageURL struct {
	URL    string `json:"url"`
	Detail string `json:"detail,omitempty"`
}

// ResponseFormat specifies the format of the model response.
type ResponseFormat struct {
	Type string `json:"type"` // "text" or "json_object"
}

// Tool represents a function tool the model can call.
type Tool struct {
	Type     string   `json:"type"` // always "function"
	Function Function `json:"function"`
}

// Function describes a callable function exposed to the model.
type Function struct {
	Name        string      `json:"name"`
	Description string      `json:"description,omitempty"`
	Parameters  interface{} `json:"parameters,omitempty"` // JSON Schema object
}

// ToolCall represents a tool invocation requested by the model.
type ToolCall struct {
	ID       string           `json:"id"`
	Type     string           `json:"type"` // always "function"
	Function FunctionCallArgs `json:"function"`
}

// FunctionCallArgs holds the function name and arguments for a tool call.
type FunctionCallArgs struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"` // JSON string
}

// ToolChoiceObject represents an explicit tool choice.
type ToolChoiceObject struct {
	Type     string           `json:"type"` // "function"
	Function ToolChoiceFunction `json:"function"`
}

// ToolChoiceFunction specifies which function to call.
type ToolChoiceFunction struct {
	Name string `json:"name"`
}

// ChatCompletionResponse is the full OpenAI chat completion response.
type ChatCompletionResponse struct {
	ID                string   `json:"id"`
	Object            string   `json:"object"`
	Created           int64    `json:"created"`
	Model             string   `json:"model"`
	Choices           []Choice `json:"choices"`
	Usage             *Usage   `json:"usage,omitempty"`
	SystemFingerprint string   `json:"system_fingerprint,omitempty"`
}

// Choice is a single completion choice in the response.
type Choice struct {
	Index        int          `json:"index"`
	Message      *ChatMessage `json:"message,omitempty"`
	Delta        *ChatMessage `json:"delta,omitempty"` // used in streaming
	FinishReason string       `json:"finish_reason,omitempty"`
	Logprobs     interface{}  `json:"logprobs,omitempty"`
}

// Usage holds token usage statistics for a completion request.
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// ErrorResponse is the JSON wrapper for API errors.
type ErrorResponse struct {
	Error APIError `json:"error"`
}

// APIError contains details about an API error.
type APIError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Param   string `json:"param,omitempty"`
	Code    string `json:"code,omitempty"`
}
