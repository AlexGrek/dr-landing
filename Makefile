HELM_RELEASE ?= dr-landing
HELM_NAMESPACE ?= dr-landing
HELM_CHART := ./helm/dr-landing

IMAGE_REPO ?= grekodocker/dr-landing
IMAGE_TAG ?= $(shell git describe --always --dirty --abbrev=8)
IMAGE := $(IMAGE_REPO):$(IMAGE_TAG)

.PHONY: run build clean test help dev dev-go dev-fe docker-build docker-push docker-release helm-install helm-upgrade helm-uninstall helm-template

help:
	@echo "Available commands:"
	@echo "  make run       - Run the application"
	@echo "  make build     - Build the application binary"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make test      - Run tests"
	@echo "  make fmt       - Format code"
	@echo "  make lint      - Run linter (requires golangci-lint)"
	@echo "  make dev           - Run frontend + backend together (primary dev command)"
	@echo "  make dev-go        - Run Go server only (air live reload)"
	@echo "  make dev-fe        - Run Vite dev server only"
	@echo "  make docker-build  - Build docker image ($(IMAGE))"
	@echo "  make docker-push   - Push image to dockerhub"
	@echo "  make docker-release - Build + push"
	@echo "  make helm-upgrade  - Deploy/upgrade helm chart (primary deploy action)"
	@echo "  make helm-install  - Install helm chart (namespace: $(HELM_NAMESPACE))"
	@echo "  make helm-uninstall - Uninstall helm chart"
	@echo "  make helm-template - Render helm templates to stdout"

run:
	@cd cmd/main && go run main.go

build:
	@mkdir -p bin
	@go build -ldflags="-X main.version=$(IMAGE_TAG)" -o bin/dr-landing ./cmd/main

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
	@which air > /dev/null 2>&1 || go install github.com/air-verse/air@latest
	@trap 'kill 0' SIGINT; \
		(cd frontend && npm run dev) & \
		air -c .air.toml & \
		wait

dev-go:
	@which air > /dev/null 2>&1 || go install github.com/air-verse/air@latest
	@air -c .air.toml

dev-fe:
	@cd frontend && npm run dev

tidy:
	@go mod tidy

vendor:
	@go mod vendor

docker-build:
	docker buildx build --platform linux/amd64 -t $(IMAGE) --load .

docker-push:
	docker push $(IMAGE)

docker-release:
	docker buildx build --platform linux/amd64 -t $(IMAGE) --load .
	docker push $(IMAGE)

helm-install:
	helm install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(HELM_NAMESPACE) \
		--create-namespace

helm-upgrade:
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(HELM_NAMESPACE) \
		--create-namespace \
		--set image.repository=$(IMAGE_REPO) \
		--set image.tag=$(IMAGE_TAG)

helm-uninstall:
	helm uninstall $(HELM_RELEASE) --namespace $(HELM_NAMESPACE)

helm-template:
	helm template $(HELM_RELEASE) $(HELM_CHART) --namespace $(HELM_NAMESPACE)
