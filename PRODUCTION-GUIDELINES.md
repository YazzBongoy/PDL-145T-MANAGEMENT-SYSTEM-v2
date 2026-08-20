# PDL-145T Management System - Production Deployment Guide

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Nginx (SSL) │────▶│  Backend (Node) │
│  (React)    │     │  Port 443    │     │  Port 8002      │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                           ┌───────▼────────┐
                                           │  PostgreSQL +   │
                                           │  PostGIS        │
                                           │  Port 5432      │
                                           └────────────────┘
```

---

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone https://github.com/YazzBongoy/PDL-145T-MANAGEMENT-SYSTEM-v2.git
cd PDL-145T-MANAGEMENT-SYSTEM-v2
cp .env.example .env
```

### 2. Edit `.env` with production values

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -hex 64)

# Set a strong database password
POSTGRES_PASSWORD=$(openssl rand -hex 32)

# Edit .env with these values
nano .env
```

### 3. Start services

```bash
# Development (with hot reload)
docker compose -f infrastructure/docker-compose.dev.yml up --build

# Production
docker compose -f infrastructure/docker-compose.prod.yml up --build -d
```

### 4. Run database migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Verify deployment

```bash
# Check all services are healthy
docker compose ps

# Test the API
curl http://localhost:8002/api/health
```

---

## Deployment Options

### Option A: Docker (Recommended for VPS/Dedicated Server)

**Requirements:** Docker 20.10+, Docker Compose v2, 2GB+ RAM

```bash
# Production deployment
cp infrastructure/.env.example infrastructure/.env
# Edit infrastructure/.env with your values

cd infrastructure
docker compose -f docker-compose.prod.yml up --build -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

**SSL Setup with Let's Encrypt:**

```bash
# Install certbot on host
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certs to nginx ssl directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infrastructure/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infrastructure/nginx/ssl/key.pem
```

### Option B: Render.com (Free Tier / Managed)

The `render.yaml` blueprint is pre-configured:

1. Push to GitHub
2. Go to https://dashboard.render.com/new/blueprint
3. Connect your repo
4. Render will auto-deploy using `render.yaml`

**Limitations of free tier:**
- Backend spins down after 15min of inactivity (cold start ~30s)
- Database expires after 90 days
- 750 hours/month free

### Option C: PM2 (Bare Metal / VPS)

```bash
# On the server
npm install
npm run build --workspaces
cd backend && npx prisma migrate deploy && cd ..

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Follow the instructions to auto-start on boot

# Monitor
pm2 monit
pm2 logs
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT token signing |
| `PORT` | No | `8002` | Backend server port |
| `NODE_ENV` | No | `development` | `production` or `development` |
| `CORS_ORIGIN` | No | `http://localhost` | Allowed CORS origin |
| `VITE_API_URL` | No | `http://localhost:8002` | Frontend API URL (build-time) |
| `POSTGRES_USER` | No | `pdl145t` | Database username |
| `POSTGRES_PASSWORD` | No | `changeme` | Database password |
| `POSTGRES_DB` | No | `pdl145t` | Database name |

---

## Database Management

### Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Create a new migration (development)
npx prisma migrate dev --name migration_name

# Reset database (WARNING: destroys data)
npx prisma migrate reset
```

### Seed Data

```bash
# Run the seed script
npm run db:seed

# Or directly
cd backend && npx prisma db seed
```

### Backup

```bash
# Backup
docker compose exec db pg_dump -U pdl145t pdl145t > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T db psql -U pdl145t pdl145t
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push:

1. **Lint** - ESLint + Prettier checks
2. **Backend** - Build + test with PostgreSQL service
3. **Frontend** - TypeScript check + build + unit tests
4. **Docker** - Validates Dockerfiles build successfully
5. **Deploy** - Auto-deploys to Render on `main` branch push

### Required GitHub Secrets

For Render deployment, add these secrets in GitHub → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `RENDER_SERVICE_ID` | Your Render service ID |
| `RENDER_API_KEY` | Render API key |

---

## Monitoring & Troubleshooting

### Health Checks

```bash
# Backend health
curl http://localhost:8002/api/health

# Docker health status
docker inspect --format='{{.State.Health.Status}}' pdl145t-backend
```

### Logs

```bash
# Docker
docker compose logs -f backend
docker compose logs -f db

# PM2
pm2 logs pdl145-backend

# Nginx
tail -f /var/log/nginx/error.log
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `JWT_SECRET is required` | Set `JWT_SECRET` in `.env` file |
| `Database connection refused` | Ensure PostgreSQL is running: `docker compose ps` |
| `Prisma migration failed` | Run `npx prisma migrate deploy` in backend container |
| `CORS error` | Set `CORS_ORIGIN` to your frontend URL |
| Port 80/443 already in use | Stop other web servers: `sudo systemctl stop apache2 nginx` |

---

## Security Checklist

- [ ] `JWT_SECRET` is a strong random string (64+ chars)
- [ ] `POSTGRES_PASSWORD` is strong and unique
- [ ] `.env` files are NOT committed to git
- [ ] SSL/TLS certificates are valid and not expired
- [ ] Database port (5432) is NOT exposed to public internet
- [ ] Nginx rate limiting is active
- [ ] Security headers are present (check with browser dev tools)
- [ ] `NODE_ENV=production` is set

---

## Scaling

### Adding More Backend Instances

```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
```

### Database Connection Pooling

Adjust in `.env`:
```
DB_POOL_MIN=5
DB_POOL_MAX=20
```

---

## Project Structure

```
PDL-145T-MANAGEMENT-SYSTEM-v2/
├── .github/workflows/    # CI/CD pipelines
├── backend/              # Node.js + Express + Prisma API
│   ├── prisma/           # Database schema & migrations
│   ├── src/              # Source code
│   └── Dockerfile        # Multi-stage build
├── frontend/             # React 19 + Vite SPA
│   ├── src/              # Source code
│   ├── tests/            # Playwright E2E tests
│   └── Dockerfile        # Multi-stage build (Nginx)
├── infrastructure/       # Docker & deployment configs
│   ├── docker-compose.prod.yml
│   ├── docker-compose.dev.yml
│   ├── nginx/
│   └── sql/
├── ecosystem.config.cjs  # PM2 configuration
├── render.yaml           # Render.com blueprint
├── docker-compose.yml    # Root compose (simple dev)
└── .env.example          # Environment template
```
