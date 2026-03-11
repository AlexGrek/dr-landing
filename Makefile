.PHONY: run build clean test help

help:
	@echo "Available commands:"
	@echo "  make run       - Run the application"
	@echo "  make build     - Build the application binary"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make test      - Run tests"
	@echo "  make fmt       - Format code"
	@echo "  make lint      - Run linter (requires golangci-lint)"
	@echo "  make dev       - Run with live reload (requires air)"

run:
	@cd cmd/main && go run main.go

build:
	@mkdir -p bin
	@go build -o bin/dr-landing ./cmd/main

clean:
	@rm -rf bin/
	@go clean

test:
	@go test -v ./...

fmt:
	@go fmt ./...

lint:
	@golangci-lint run

dev:
	@which air > /dev/null || go install github.com/cosmtrek/air@latest
	@air -c .air.toml

tidy:
	@go mod tidy

vendor:
	@go mod vendor
