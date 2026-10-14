# Multi-stage Dockerfile for Node.js backend
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for building).
# NOTE: this build context has no package-lock.json (the lockfile is at the
# repo root for the npm workspace), so `npm ci` cannot be used here.
RUN npm install

# Copy Prisma schema
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (no lockfile in this context; see above)
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Container entrypoint (applies Prisma migrations before starting the server)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3010/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Apply migrations, then start the application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
