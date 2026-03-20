# Stage 1: Build the React client
FROM node:20-alpine AS builder
WORKDIR /app

COPY client/package*.json ./client/
RUN npm ci --prefix client

COPY client/ ./client/
RUN npm run build --prefix client

# Stage 2: Production server
FROM node:20-alpine AS runner
WORKDIR /app

# Install server dependencies (prod only — tsx is a prod dep)
COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

COPY server/ ./server/

# Copy built client from builder stage
COPY --from=builder /app/client/dist ./client/dist

# Ensure data directory exists for SQLite volume mount
RUN mkdir -p ./server/data

EXPOSE 3001

CMD ["node", "server/node_modules/.bin/tsx", "server/src/index.ts"]
