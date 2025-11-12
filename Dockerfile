# Multi-stage build for md2doc
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create user for running the application
RUN addgroup -g 1001 -S md2doc && \
    adduser -S -u 1001 -G md2doc md2doc && \
    chown -R md2doc:md2doc /app

USER md2doc

# Set up volume for input/output files
VOLUME ["/workspace"]
WORKDIR /workspace

# Default command
ENTRYPOINT ["node", "/app/dist/cli/index.js"]
CMD ["--help"]
