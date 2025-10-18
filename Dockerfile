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

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 3011

# Start the backend (which serves both API and frontend)
CMD ["npm", "start"]
