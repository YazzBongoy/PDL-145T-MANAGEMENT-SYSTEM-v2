# PDL-145T Management System - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Deployment](#local-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Software Requirements

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 18 (for local development)
- PostgreSQL >= 15 (or use Docker)

### Infrastructure Requirements

- **Backend**: 512MB RAM, 0.5 CPU
- **Frontend**: 256MB RAM, 0.25 CPU
- **Database**: 1GB RAM, 0.5 CPU
- **Total**: ~2GB RAM, 1.5 CPU minimum

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pdl_management

# Authentication
JWT_SECRET=your-secure-random-secret-here

# Server
PORT=3010
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com

# Document storage
DOCUMENTS_ROOT=/path/to/documents
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=https://your-domain.com/api
```

---

## Local Deployment

### Quick Start (No Docker)

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

This uses embedded PGlite — no external database needed.

### With External PostgreSQL

```bash
# Create database
createdb pdl_management

# Set DATABASE_URL in backend/.env
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/pdl_management" > backend/.env

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npx prisma db seed

# Start servers
npm run dev
```

---

## Docker Deployment

### Development

```bash
# Start all services
docker compose -f infrastructure/docker-compose.dev.yml up -d

# View logs
docker compose -f infrastructure/docker-compose.dev.yml logs -f

# Stop services
docker compose -f infrastructure/docker-compose.dev.yml down
```

Services:
- PostgreSQL: `localhost:5432`
- Backend: `http://localhost:3010`
- Frontend: `http://localhost:5173`
- Adminer (DB UI): `http://localhost:8080`

### Production

```bash
# Build and start
docker compose -f infrastructure/docker-compose.prod.yml up -d --build

# Verify health
curl http://localhost:3010/api/health

# View logs
docker compose -f infrastructure/docker-compose.prod.yml logs -f
```

Services:
- PostgreSQL: `localhost:5432` (localhost only)
- Backend: `localhost:3010` (localhost only)
- Nginx: `localhost:80/443` (public)

---

## Production Deployment

### 1. Server Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/your-org/pdl-145t-management-system.git
cd pdl-145t-management-system
```

### 2. Configure Environment

```bash
# Create production env file
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=pdl_management
JWT_SECRET=$(openssl rand -base64 32)
VITE_API_URL=https://your-domain.com
EOF
```

### 3. SSL Certificates

```bash
# Place certificates in infrastructure/nginx/ssl/
mkdir -p infrastructure/nginx/ssl
cp /path/to/cert.pem infrastructure/nginx/ssl/
cp /path/to/key.pem infrastructure/nginx/ssl/
```

### 4. Start Services

```bash
docker compose -f infrastructure/docker-compose.prod.yml up -d --build
```

### 5. Initialize Database

```bash
# Run migrations inside the backend container
docker compose -f infrastructure/docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3010/api/health

# Docker container health
docker compose -f infrastructure/docker-compose.prod.yml ps
```

### Logs

```bash
# All services
docker compose -f infrastructure/docker-compose.prod.yml logs -f

# Specific service
docker compose -f infrastructure/docker-compose.prod.yml logs -f backend
```

### Metrics

- Backend exposes uptime via `/api/health`
- Database connection count via `pg_stat_activity`
- Docker stats: `docker stats`

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose -f infrastructure/docker-compose.prod.yml logs backend

# Common causes:
# - DATABASE_URL unreachable → check db container health
# - Port already in use → check for conflicting services
# - Missing environment variables → verify .env file
```

### Database connection refused

```bash
# Verify PostgreSQL is running
docker compose -f infrastructure/docker-compose.prod.yml ps db

# Test connection
docker compose -f infrastructure/docker-compose.prod.yml exec db \
  psql -U postgres -d pdl_management -c "SELECT 1"
```

### Health check failing

```bash
# Backend health endpoint
curl -v http://localhost:3010/api/health

# Check if backend is running
docker compose -f infrastructure/docker-compose.prod.yml ps backend
```

### Reset everything

```bash
# Stop and remove all data
docker compose -f infrastructure/docker-compose.prod.yml down -v

# Remove built images
docker compose -f infrastructure/docker-compose.prod.yml down --rmi all

# Rebuild from scratch
docker compose -f infrastructure/docker-compose.prod.yml up -d --build
```

---

*Last updated: September 18, 2026*
