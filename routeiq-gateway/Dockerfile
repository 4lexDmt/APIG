# Stage 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o routeiq-gateway ./cmd/gateway

# Stage 2: Runtime
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/routeiq-gateway .
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
USER 1000:1000
ENTRYPOINT ["./routeiq-gateway"]
