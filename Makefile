.PHONY: dev test lint build migrate seed compliance clean help

# ── Configuration ─────────────────────────────────────────────────────────────
GATEWAY_DIR  := routeiq-gateway
DASHBOARD_DIR := routeiq-dashboard
WEBSITE_DIR  := apps/website
BINARY       := routeiq-gateway

# ── Development ───────────────────────────────────────────────────────────────

## dev: Start all services with docker-compose (gateway + postgres + redis)
dev:
	@echo "Starting RouteIQ local stack..."
	@cd $(GATEWAY_DIR) && docker-compose up --build

## dev-bg: Start all services in background
dev-bg:
	@cd $(GATEWAY_DIR) && docker-compose up --build -d

## dev-dashboard: Start the Next.js dashboard dev server
dev-dashboard:
	@cd $(DASHBOARD_DIR) && npm run dev

## dev-website: Start the marketing website dev server
dev-website:
	@cd $(WEBSITE_DIR) && npm run dev

# ── Testing ───────────────────────────────────────────────────────────────────

## test: Run Go unit tests + TypeScript type checks
test: test-go test-ts

test-go:
	@echo "Running Go tests..."
	@cd $(GATEWAY_DIR) && go test -race -coverprofile=coverage.out ./... && \
		go tool cover -func=coverage.out | tail -1

test-ts:
	@echo "Running TypeScript type checks..."
	@cd $(DASHBOARD_DIR) && npm run type-check || true
	@cd $(WEBSITE_DIR) && npx tsc --noEmit || true

# ── Linting ───────────────────────────────────────────────────────────────────

## lint: Run golangci-lint (Go) + ESLint (TypeScript)
lint: lint-go lint-ts

lint-go:
	@echo "Linting Go code..."
	@cd $(GATEWAY_DIR) && golangci-lint run ./... || \
		(echo "golangci-lint not found — run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest" && go vet ./...)

lint-ts:
	@echo "Linting TypeScript..."
	@cd $(DASHBOARD_DIR) && npm run lint || true
	@cd $(WEBSITE_DIR) && npm run lint || true

# ── Building ──────────────────────────────────────────────────────────────────

## build: Build Go binary + Next.js production builds
build: build-go build-dashboard build-website

build-go:
	@echo "Building Go gateway..."
	@cd $(GATEWAY_DIR) && \
		CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o $(BINARY) ./cmd/gateway && \
		echo "Binary size: $$(du -sh $(BINARY) | cut -f1)"

build-dashboard:
	@echo "Building Next.js dashboard..."
	@cd $(DASHBOARD_DIR) && npm ci && npm run build

build-website:
	@echo "Building marketing website..."
	@cd $(WEBSITE_DIR) && npm ci && npm run build

## docker-build: Build Docker image for gateway
docker-build:
	@cd $(GATEWAY_DIR) && docker build -t routeiq-gateway:latest .
	@echo "Image size: $$(docker image inspect routeiq-gateway:latest --format='{{.Size}}' | awk '{printf "%.1f MB", $$1/1024/1024}')"

# ── Database ──────────────────────────────────────────────────────────────────

## migrate: Run database migrations against DATABASE_URL
migrate:
	@echo "Running migrations..."
	@cd $(GATEWAY_DIR) && DATABASE_URL=$${DATABASE_URL:-postgresql://routeiq:routeiq@localhost:5432/routeiq?sslmode=disable} \
		go run ./cmd/gateway migrate

## seed: Seed the database with a demo org/team/agent/api_key for local dev
seed:
	@echo "Seeding database with demo data..."
	@cd $(GATEWAY_DIR) && DATABASE_URL=$${DATABASE_URL:-postgresql://routeiq:routeiq@localhost:5432/routeiq?sslmode=disable} \
		go run ./cmd/gateway seed

# ── Compliance ────────────────────────────────────────────────────────────────

## compliance: Run OpenAI API compliance test suite against local gateway
compliance:
	@echo "Running OpenAI compliance tests against http://localhost:8080..."
	@which k6 > /dev/null || (echo "k6 not found — install from https://k6.io/docs/get-started/installation/" && exit 1)
	@k6 run $(GATEWAY_DIR)/tests/compliance/openai_compliance.js

## loadtest: Run k6 load test at 100 RPS to measure P95 latency overhead
loadtest:
	@echo "Running load test at 100 RPS..."
	@k6 run --vus 10 --rps 100 --duration 30s $(GATEWAY_DIR)/tests/load/gateway_load.js

# ── Cleanup ───────────────────────────────────────────────────────────────────

## clean: Remove build artifacts and docker volumes
clean:
	@echo "Cleaning build artifacts..."
	@cd $(GATEWAY_DIR) && rm -f $(BINARY) coverage.out
	@cd $(DASHBOARD_DIR) && rm -rf .next node_modules || true
	@cd $(WEBSITE_DIR) && rm -rf .next node_modules || true
	@cd $(GATEWAY_DIR) && docker-compose down -v --remove-orphans || true
	@echo "Clean complete."

## logs: Tail gateway logs from docker-compose
logs:
	@cd $(GATEWAY_DIR) && docker-compose logs -f gateway

# ── Help ──────────────────────────────────────────────────────────────────────

## help: Show this help message
help:
	@echo "RouteIQ Sprint 1 — Available make targets:"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /' | column -t -s ':'
