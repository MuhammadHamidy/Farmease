# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# API URL dibakar saat build (browser memanggil host ini, bukan nama service Docker)
ARG VITE_API_BASE_URL=https://api-ternak.netrash.id
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_SSO_API_URL=https://api-sso.netrash.id
ENV VITE_SSO_API_URL=$VITE_SSO_API_URL
ARG VITE_PETERNAKAN_API_URL=https://api-ternak.netrash.id
ENV VITE_PETERNAKAN_API_URL=$VITE_PETERNAKAN_API_URL
ARG VITE_KEBUN_API_URL=https://api-kebun.netrash.id
ENV VITE_KEBUN_API_URL=$VITE_KEBUN_API_URL

# Build application
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install a simple HTTP server for serving static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3001"]
