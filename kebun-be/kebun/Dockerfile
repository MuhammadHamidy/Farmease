# Stage 1: Build
# Build context harus folder Farmease-BE (bukan farmease saja)
FROM golang:1.25-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git

COPY framework/ ./framework/
COPY libraries/ ./libraries/
COPY kebun/ ./kebun/

WORKDIR /build/kebun

RUN go mod download

RUN if [ ! -f /build/kebun/config/config.json ] && [ -f /build/kebun/config/config.example.json ]; then cp /build/kebun/config/config.example.json /build/kebun/config/config.json; fi

RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags "-X github.com/farmease/farmease-be/kebun/version.Version=docker" \
    -o kebun .

# Stage 2: Dev (for docker-compose)
FROM golang:1.25-alpine AS dev

WORKDIR /app

# Install air and pre-download dependencies so the volume cache is warm on first run
RUN go install github.com/air-verse/air@latest

# Copy module files first (better Docker layer caching)
COPY framework/go.mod framework/go.sum ./framework/
COPY libraries/go.mod libraries/go.sum ./libraries/
COPY kebun/go.mod kebun/go.sum ./kebun/
COPY go.work go.work.sum* ./

# Pre-download all dependencies into GOPATH/pkg/mod
RUN go work sync && \
    cd kebun && go mod download

WORKDIR /app/kebun
CMD ["air", "-c", ".air.toml"]


# Stage 3: Runtime
FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates postgresql-client tzdata wget

RUN addgroup -g 1000 farmease && adduser -D -u 1000 -G farmease farmease

COPY --from=builder /build/kebun/kebun .
COPY --from=builder /build/kebun/config ./config
COPY --from=builder /build/kebun/migrations ./migrations
COPY --from=builder /build/kebun/seeders ./seeders

RUN chown -R farmease:farmease /app && mkdir -p logs && chown -R farmease:farmease logs

USER farmease

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8082/health/livez || exit 1

ENTRYPOINT ["./kebun"]
CMD ["serve"]
