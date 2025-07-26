# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# 1. Build stage – compile the Go binary
# ─────────────────────────────────────────────
FROM golang:1.24.5-alpine3.21 AS builder

WORKDIR /workspace

# Copy the module files first to take advantage of Docker layer caching
COPY go.mod go.sum ./backend/

WORKDIR /workspace/backend
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary (static, no CGO)
RUN CGO_ENABLED=0 GOOS=linux go build -o /workspace/bin/app ./cmd

# ─────────────────────────────────────────────
# 2. Runtime stage – minimal, secure image
# ─────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12

WORKDIR /app
COPY --from=builder /workspace/bin/app /app/main

# Default port used by main.go
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/main"]
