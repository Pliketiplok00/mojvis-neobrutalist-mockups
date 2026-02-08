# MOJ VIS Backend Dockerfile
# Multi-stage build with Node 20 Alpine + pnpm

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies (prefer pnpm, fallback to npm)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install production dependencies only
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --prod; \
    elif [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev; fi

# Copy built files
COPY --from=builder /app/dist ./dist

# Copy static data files (holidays, etc.)
COPY --from=builder /app/src/data ./dist/data

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]
