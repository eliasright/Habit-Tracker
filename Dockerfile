# ============================================
# BUILD STAGE - Build Frontend
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install ALL dependencies (needed for building frontend)
RUN npm ci

# Copy entire source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Build backend (compile TypeScript)
RUN cd backend && npm run build

# ============================================
# PRODUCTION STAGE - Runtime
# ============================================
FROM node:20-alpine
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install ONLY production dependencies for backend
RUN cd backend && npm install --production

# Copy backend compiled code
COPY --from=builder /app/backend/dist ./backend/dist

# Copy Prisma schema and generate client
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# Copy BUILT frontend from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3011

# Copy migration script
COPY --from=builder /app/backend/prisma/migrations ./backend/prisma/migrations

# Start script
WORKDIR /app/backend
COPY <<EOF /app/start.sh
#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting server..."
node dist/index.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
