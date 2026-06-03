# Stage 1: Build
# Build context harus folder Farmease-BE (bukan farmease saja)
FROM golang:1.25-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git

COPY framework/ ./framework/
COPY libraries/ ./libraries/
COPY farmease/ ./farmease/

WORKDIR /build/farmease

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags "-X github.com/farmease/farmease-be/farmease/version.Version=docker" \
    -o farmease .

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates postgresql-client tzdata wget

RUN addgroup -g 1000 farmease && adduser -D -u 1000 -G farmease farmease

COPY --from=builder /build/farmease/farmease .
COPY --from=builder /build/farmease/config ./config
COPY --from=builder /build/farmease/migrations ./migrations
COPY --from=builder /build/farmease/seeders ./seeders

RUN chown -R farmease:farmease /app && mkdir -p logs && chown -R farmease:farmease logs

USER farmease

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 -O /dev/null http://localhost:8080/health/livez || exit 1

ENTRYPOINT ["./farmease"]
CMD ["serve"]
