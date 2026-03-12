# Stage 1: Build frontend
FROM node:22-alpine AS frontend
ARG FRONTEND_CACHE_BUST=default
WORKDIR /app
RUN echo "Cache buster: ${FRONTEND_CACHE_BUST}"
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go binary
FROM golang:1.25-alpine AS builder
WORKDIR /app

# CGO required for sqlite3
RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Embed the built frontend
COPY --from=frontend /app/dist ./internal/static/dist

RUN CGO_ENABLED=1 GOOS=linux CGO_CFLAGS="-D_LARGEFILE64_SOURCE" go build \
    -ldflags="-s -w" \
    -o bin/dr-landing \
    ./cmd/main/

# Stage 3: Minimal runtime image
FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/bin/dr-landing .

EXPOSE 8080
ENV DB_PATH=/data/tickets.db

CMD ["./dr-landing"]
