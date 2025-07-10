# PDL-145T Management System - Containerization Guide

## Table of Contents
1. [Image Hierarchy & Architecture](#image-hierarchy--architecture)
2. [Multi-Stage Builds](#multi-stage-builds)
3. [Development vs Production Compose Files](#development-vs-production-compose-files)
4. [Environment Strategy](#environment-strategy)
5. [Container Orchestration](#container-orchestration)
6. [Security Best Practices](#security-best-practices)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Logging](#monitoring--logging)

---

## Image Hierarchy & Architecture

### Base Image Strategy

Our containerization follows a hierarchical approach with carefully selected base images:

```
Docker Image Hierarchy:
├── node:18-alpine (Base)
│   ├── Backend Builder Stage
│   │   ├── TypeScript compilation
│   │   ├── Prisma client generation
│   │   └── Dependencies installation
│   └── Backend Production Stage
│       ├── Runtime dependencies only
│       ├── Non-root user setup
│       └── Security hardening
├── nginx:alpine (Base)
│   └── Frontend Production Stage
│       ├── Built React assets
│       ├── Optimized nginx config
│       └── Security headers
└── postgis/postgis:15-3.3 (Base)
    └── Database Layer
        ├── PostgreSQL 15.4
        ├── PostGIS 3.3 extensions
        └── Geospatial capabilities
```

### Layer Architecture

Each service is built with specific layer optimizations:

#### Backend Layers
```dockerfile
# Layer 1: Base OS and Node.js runtime
FROM node:18-alpine

# Layer 2: System dependencies and user setup
RUN apk add --no-cache curl ca-certificates
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Layer 3: Package metadata (cached when unchanged)
COPY package*.json tsconfig.json ./

# Layer 4: Dependencies (cached when package.json unchanged)
RUN npm install

# Layer 5: Application schema (cached when schema unchanged)
COPY prisma/ ./prisma/
RUN npx prisma generate

# Layer 6: Application code (changes frequently)
COPY src/ ./src/
RUN npm run build
```

#### Frontend Layers
```dockerfile
# Builder Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./               # Layer: Dependencies metadata
RUN npm install                     # Layer: Dependencies
COPY . .                           # Layer: Source code
RUN npm run build                  # Layer: Build artifacts

# Production Stage
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html  # Layer: Static assets
COPY nginx.conf /etc/nginx/conf.d/default.conf       # Layer: Configuration
```

### Image Size Optimization

Our multi-stage builds achieve significant size reductions:

| Service | Full Build | Optimized Build | Reduction |
|---------|------------|----------------|-----------|
| Backend | ~450MB | ~180MB | 60% |
| Frontend | ~380MB | ~25MB | 93% |
| Database | ~280MB | ~280MB | 0% (base image) |

---

## Multi-Stage Builds

### Backend Multi-Stage Build

```dockerfile
# Stage 1: Builder - Contains all development dependencies
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source code
COPY src/ ./src/

# Build TypeScript application
RUN npm run build

# Stage 2: Production - Minimal runtime environment
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production environment
RUN npx prisma generate

# Change ownership and switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/index.js"]
```

### Frontend Multi-Stage Build

```dockerfile
# Stage 1: Builder - Build React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create optimized nginx configuration
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Multi-Stage Benefits

1. **Size Reduction**: Production images contain only runtime dependencies
2. **Security**: No development tools in production images
3. **Build Optimization**: Separate build and runtime environments
4. **Layer Caching**: Efficient caching strategy for faster builds

---

## Development vs Production Compose Files

### Development Configuration (docker-compose.dev.yml)

**Focus**: Developer productivity and debugging capabilities

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3
    ports:
      - "5432:5432"  # Direct database access
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: dev_password_123  # Simple password
    
  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile.dev  # Development-specific Dockerfile
    volumes:
      # Hot reload - source code mounted as volume
      - ../backend/src:/app/src:ro
      - ../backend/package.json:/app/package.json:ro
      - backend_node_modules:/app/node_modules
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
    ports:
      - "3010:3010"  # Direct access for debugging
    
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile.dev
    volumes:
      # Hot reload - source code mounted as volume
      - ../frontend/src:/app/src:ro
      - ../frontend/public:/app/public:ro
      - frontend_node_modules:/app/node_modules
    environment:
      NODE_ENV: development
    ports:
      - "5173:5173"  # Vite dev server
    
  # Development tools
  adminer:
    image: adminer:4.8.1
    ports:
      - "8080:8080"  # Database admin interface
    depends_on:
      - db

volumes:
  postgres_data_dev:
  backend_node_modules:
  frontend_node_modules:
```

### Production Configuration (docker-compose.prod.yml)

**Focus**: Security, performance, and scalability

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3
    ports:
      - "127.0.0.1:5432:5432"  # Localhost only
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Secure password from env
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    
  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
      target: production
    ports:
      - "127.0.0.1:3010:3010"  # Localhost only, behind proxy
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
      target: production
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
    
  # Production reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
```

### Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Build Strategy** | Hot reload, dev tools | Optimized, minimal |
| **Port Binding** | All ports exposed | Localhost only |
| **Volumes** | Source code mounted | Data volumes only |
| **Environment** | Debug logging | Production logging |
| **Security** | Simple passwords | Secure secrets |
| **Resources** | Unlimited | Limited & monitored |
| **Restart Policy** | Manual | Automatic |
| **Proxy** | Direct access | Nginx reverse proxy |

---

## Environment Strategy

### Environment File Structure

```
infrastructure/
├── .env.example          # Template with all variables
├── .env.dev             # Development configuration
├── .env.prod            # Production configuration
├── .env.staging         # Staging configuration
└── .env.local           # Local overrides (gitignored)
```

### Development Environment (.env.dev)

```bash
# Development Environment Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=pdl_management

NODE_ENV=development
JWT_SECRET=dev_secret_key_do_not_use_in_production
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173

# Development tools
ADMINER_DEFAULT_SERVER=db
```

### Production Environment (.env.prod)

```bash
# Production Environment Configuration
POSTGRES_USER=pdl_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=pdl_management

NODE_ENV=production
JWT_SECRET=CHANGE_ME_STRONG_JWT_SECRET_WITH_256_BITS
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com

# Security settings
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Environment Variable Hierarchy

1. **Command Line**: `POSTGRES_PASSWORD=secret docker-compose up`
2. **Environment File**: `.env` file in compose directory
3. **Compose File**: `environment:` section in compose file
4. **Dockerfile**: `ENV` directive in Dockerfile
5. **Default Values**: `${VARIABLE:-default}` syntax

### Secret Management

#### Development
```bash
# Simple file-based secrets
echo "dev_secret_key" > secrets/jwt_secret.txt
```

#### Production
```bash
# External secret management
JWT_SECRET=$(vault kv get -field=jwt_secret secret/pdl)
POSTGRES_PASSWORD=$(aws secretsmanager get-secret-value --secret-id pdl/db --query SecretString --output text)
```

---

## Container Orchestration

### Service Dependencies

```yaml
services:
  backend:
    depends_on:
      db:
        condition: service_healthy
        
  frontend:
    depends_on:
      - backend
      
  nginx:
    depends_on:
      - frontend
      - backend
```

### Health Checks

```yaml
# Database health check
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d pdl_management"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s

# Backend health check
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3010/api/health"]
    interval: 30s
    timeout: 3s
    retries: 3
    start_period: 5s
```

### Network Configuration

```yaml
networks:
  pdl-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: pdl-bridge
```

### Volume Management

```yaml
volumes:
  # Database data persistence
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/pdl/data
      
  # Application logs
  app_logs:
    driver: local
```

---

## Security Best Practices

### Container Security

1. **Non-root User**:
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

2. **Minimal Attack Surface**:
   ```dockerfile
   FROM node:18-alpine  # Minimal base image
   # No unnecessary packages
   ```

3. **Security Context**:
   ```yaml
   services:
     backend:
       security_opt:
         - no-new-privileges:true
       cap_drop:
         - ALL
       cap_add:
         - NET_BIND_SERVICE
   ```

### Network Security

```yaml
# Production network isolation
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # No external access
```

### Secret Management

```yaml
# Docker Swarm secrets
secrets:
  jwt_secret:
    external: true
  db_password:
    external: true

services:
  backend:
    secrets:
      - jwt_secret
      - db_password
```

---

## Performance Optimization

### Build Optimization

1. **Layer Caching**:
   ```dockerfile
   # Copy package files first (cached layer)
   COPY package*.json ./
   RUN npm install
   
   # Copy source code last (changes frequently)
   COPY src/ ./src/
   ```

2. **Multi-stage Builds**:
   ```dockerfile
   # Build stage with all tools
   FROM node:18-alpine AS builder
   # ... build steps
   
   # Production stage with minimal runtime
   FROM node:18-alpine AS production
   COPY --from=builder /app/dist ./dist
   ```

3. **Build Context Optimization**:
   ```
   # .dockerignore
   node_modules
   .git
   dist
   *.log
   .env*
   ```

### Runtime Optimization

```yaml
# Resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Image Optimization

```dockerfile
# Multi-stage build for size reduction
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production
# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
RUN npm install --only=production && npm cache clean --force
```

---

## Monitoring & Logging

### Logging Configuration

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
    labels: "service,environment"
```

### Health Monitoring

```yaml
# Comprehensive health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3010/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Metrics Collection

```yaml
# Prometheus metrics
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

---

## Usage Examples

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Run tests
docker-compose -f docker-compose.dev.yml run backend npm test

# Database operations
docker-compose -f docker-compose.dev.yml run backend npm run db:migrate
```

### Production Deployment

```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up --scale backend=3

# Rolling updates
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

### Environment Management

```bash
# Use specific environment
docker-compose --env-file .env.dev -f docker-compose.dev.yml up

# Override with production settings
docker-compose --env-file .env.prod -f docker-compose.prod.yml up
```

---

## Best Practices Summary

1. **Image Hierarchy**: Use appropriate base images and multi-stage builds
2. **Environment Separation**: Maintain separate configurations for dev/prod
3. **Security First**: Non-root users, minimal attack surface, secret management
4. **Performance**: Optimize builds, use resource limits, implement health checks
5. **Monitoring**: Comprehensive logging, health checks, and metrics collection
6. **Maintainability**: Clear documentation, consistent naming, version control

---

## Troubleshooting

For detailed troubleshooting information, refer to the [Containerization Troubleshooting Guide](./containerization-troubleshooting.md).

Common issues and solutions:
- **Port conflicts**: Use different ports or check running services
- **Volume permissions**: Ensure proper user mapping and permissions
- **Database connectivity**: Check health checks and connection strings
- **Build failures**: Verify Dockerfile syntax and build context
- **Environment variables**: Check file locations and syntax
