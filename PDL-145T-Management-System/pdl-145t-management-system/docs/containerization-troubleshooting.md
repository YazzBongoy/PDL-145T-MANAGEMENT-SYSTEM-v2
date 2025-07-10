# Docker Containerization Troubleshooting Guide

## Table of Contents
1. [Port Conflicts](#port-conflicts)
2. [Volume Permission Issues](#volume-permission-issues)
3. [Database Connectivity Issues](#database-connectivity-issues)
4. [Multi-Stage Build Issues](#multi-stage-build-issues)
5. [Environment-Specific Issues](#environment-specific-issues)
6. [Performance Issues](#performance-issues)
7. [Security Issues](#security-issues)
8. [General Docker Issues](#general-docker-issues)

---

## Port Conflicts

### Issue: Port Already in Use
**Symptoms:**
- `Error: bind: address already in use`
- Services fail to start
- Cannot access application on expected ports

**Common Causes:**
- Another service using the same port
- Previous container still running
- Port already bound by host system

**Solutions:**

1. **Check what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :5432
   netstat -ano | findstr :3010
   netstat -ano | findstr :5173
   
   # Linux/Mac
   lsof -i :5432
   lsof -i :3010
   lsof -i :5173
   ```

2. **Stop conflicting services:**
   ```bash
   # Stop all project containers
   docker-compose down
   
   # Remove all stopped containers
   docker container prune
   
   # Kill specific process by PID (if needed)
   taskkill /PID <PID> /F  # Windows
   kill -9 <PID>           # Linux/Mac
   ```

3. **Use different ports:**
   ```yaml
   # In docker-compose.yml
   services:
     db:
       ports:
         - "5433:5432"  # Changed from 5432 to 5433
     backend:
       ports:
         - "3011:3010"  # Changed from 3010 to 3011
   ```

4. **Environment-specific port configuration:**
   ```bash
   # In .env file
   DB_PORT=5433
   BACKEND_PORT=3011
   FRONTEND_PORT=5174
   ```

### Issue: Port Mapping Problems
**Symptoms:**
- Can't connect to services from host
- Services can connect internally but not externally

**Solutions:**
1. **Check port mapping syntax:**
   ```yaml
   ports:
     - "host_port:container_port"
     - "5432:5432"  # Correct
     # - "5432"     # Incorrect - only exposes port
   ```

2. **Use host networking (development only):**
   ```yaml
   services:
     backend:
       network_mode: host
   ```

---

## Volume Permission Issues

### Issue: Permission Denied Errors
**Symptoms:**
- `Permission denied` when accessing files
- Database fails to start with permission errors
- Application can't write to mounted volumes

**Common Causes:**
- User ID mismatch between host and container
- Incorrect volume mount permissions
- SELinux/AppArmor blocking access

**Solutions:**

1. **Fix PostgreSQL data directory permissions:**
   ```bash
   # Create directory with correct permissions
   mkdir -p ./data/postgres
   sudo chown -R 999:999 ./data/postgres
   chmod -R 750 ./data/postgres
   ```

2. **Use user mapping in Docker Compose:**
   ```yaml
   services:
     backend:
       user: "${UID}:${GID}"
       environment:
         - UID=${UID}
         - GID=${GID}
   ```

3. **Set user in Dockerfile:**
   ```dockerfile
   # Create user with specific UID/GID
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

4. **Use bind mount with proper permissions:**
   ```bash
   # Windows (if using WSL2)
   chmod -R 755 ./backend/src
   
   # Linux/Mac
   sudo chown -R $(id -u):$(id -g) ./backend/src
   chmod -R 755 ./backend/src
   ```

### Issue: Volume Not Mounting
**Symptoms:**
- Changes to source code not reflected in container
- Database data not persisting
- Files missing in container

**Solutions:**

1. **Check volume syntax:**
   ```yaml
   volumes:
     - ./backend/src:/app/src:ro          # Read-only bind mount
     - postgres_data:/var/lib/postgresql/data  # Named volume
     - /absolute/path:/container/path      # Absolute path
   ```

2. **Use absolute paths on Windows:**
   ```yaml
   volumes:
     - C:\Users\YourUser\project\src:/app/src
     # or use forward slashes
     - C:/Users/YourUser/project/src:/app/src
   ```

3. **Check Docker Desktop settings:**
   - Enable "Use WSL 2 based engine" on Windows
   - Add project directory to "File Sharing" in Docker Desktop settings

---

## Database Connectivity Issues

### Issue: Cannot Connect to Database
**Symptoms:**
- `Connection refused` errors
- Backend fails to start
- Database health check fails

**Common Causes:**
- Database not ready when backend starts
- Network connectivity issues
- Wrong connection string
- Database container not running

**Solutions:**

1. **Use proper service dependencies:**
   ```yaml
   services:
     backend:
       depends_on:
         db:
           condition: service_healthy
     
     db:
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres -d pdl_management"]
         interval: 10s
         timeout: 5s
         retries: 5
         start_period: 30s
   ```

2. **Check database connection string:**
   ```bash
   # Correct format for containers
   DATABASE_URL=postgresql://postgres:password@db:5432/pdl_management
   
   # Note: Use service name 'db', not 'localhost'
   ```

3. **Test database connectivity:**
   ```bash
   # From host
   docker exec -it pdl-db psql -U postgres -d pdl_management
   
   # From backend container
   docker exec -it pdl-backend npm run db:test
   ```

4. **Check database logs:**
   ```bash
   docker logs pdl-db
   docker logs pdl-backend
   ```

### Issue: Database Migrations Fail
**Symptoms:**
- Migration errors on startup
- Database schema not up to date
- Prisma client errors

**Solutions:**

1. **Run migrations manually:**
   ```bash
   # From backend container
   docker exec -it pdl-backend npx prisma migrate deploy
   
   # Or run migration script
   docker exec -it pdl-backend npm run db:migrate
   ```

2. **Add migration to startup script:**
   ```dockerfile
   # In Dockerfile
   CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
   ```

3. **Check migration status:**
   ```bash
   docker exec -it pdl-backend npx prisma migrate status
   ```

---

## Multi-Stage Build Issues

### Issue: Build Context Problems
**Symptoms:**
- `COPY` commands fail
- Files not found during build
- Build process very slow

**Solutions:**

1. **Optimize build context:**
   ```dockerfile
   # Copy only necessary files first
   COPY package*.json ./
   COPY tsconfig.json ./
   
   # Install dependencies
   RUN npm install
   
   # Copy source code last
   COPY src/ ./src/
   ```

2. **Use .dockerignore:**
   ```
   # .dockerignore
   node_modules
   npm-debug.log
   dist
   .git
   .gitignore
   README.md
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   ```

3. **Check build target:**
   ```bash
   # Build specific stage
   docker build --target production -t pdl-backend .
   
   # Build all stages
   docker build -t pdl-backend .
   ```

### Issue: Layer Caching Problems
**Symptoms:**
- Builds take too long
- Dependencies reinstalled every time
- Cache not being used

**Solutions:**

1. **Order Dockerfile commands by change frequency:**
   ```dockerfile
   # Least likely to change first
   FROM node:18-alpine AS builder
   
   # Copy package files (changes rarely)
   COPY package*.json ./
   RUN npm install
   
   # Copy source code (changes frequently)
   COPY src/ ./src/
   RUN npm run build
   ```

2. **Use multi-stage builds efficiently:**
   ```dockerfile
   # Builder stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   # Production stage
   FROM node:18-alpine AS production
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --only=production
   COPY --from=builder /app/dist ./dist
   CMD ["node", "dist/index.js"]
   ```

---

## Environment-Specific Issues

### Issue: Development vs Production Configuration
**Symptoms:**
- Different behavior between environments
- Environment variables not loading
- Services not starting in production

**Solutions:**

1. **Use environment-specific compose files:**
   ```bash
   # Development
   docker-compose -f docker-compose.dev.yml up
   
   # Production
   docker-compose -f docker-compose.prod.yml up
   ```

2. **Override configurations:**
   ```bash
   # Use multiple compose files
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

3. **Environment variable precedence:**
   ```bash
   # 1. Environment file (.env)
   # 2. Docker Compose environment section
   # 3. Command line environment variables
   POSTGRES_PASSWORD=secret docker-compose up
   ```

### Issue: Environment Variables Not Loading
**Symptoms:**
- Default values being used
- Services can't connect
- Configuration errors

**Solutions:**

1. **Check .env file location:**
   ```bash
   # Must be in same directory as docker-compose.yml
   infrastructure/.env
   infrastructure/docker-compose.yml
   ```

2. **Verify environment variable syntax:**
   ```bash
   # .env file
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   
   # No spaces around =
   # No quotes unless needed
   ```

3. **Test environment variables:**
   ```bash
   # Check if variables are loaded
   docker-compose config
   
   # Check inside container
   docker exec -it pdl-backend env
   ```

---

## Performance Issues

### Issue: Slow Build Times
**Solutions:**

1. **Use .dockerignore:**
   ```
   node_modules
   .git
   dist
   *.log
   ```

2. **Optimize layer caching:**
   ```dockerfile
   # Install dependencies before copying source
   COPY package*.json ./
   RUN npm install
   COPY . .
   ```

3. **Use multi-stage builds:**
   ```dockerfile
   FROM node:18-alpine AS builder
   # ... build steps
   
   FROM node:18-alpine AS production
   COPY --from=builder /app/dist ./dist
   ```

### Issue: Slow Container Startup
**Solutions:**

1. **Optimize health checks:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

2. **Use proper wait strategies:**
   ```yaml
   depends_on:
     db:
       condition: service_healthy
   ```

---

## Security Issues

### Issue: Running as Root
**Solutions:**

1. **Create non-root user:**
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

2. **Use security context:**
   ```yaml
   services:
     backend:
       user: "1001:1001"
       security_opt:
         - no-new-privileges:true
   ```

### Issue: Secrets in Environment Variables
**Solutions:**

1. **Use Docker secrets:**
   ```yaml
   services:
     backend:
       secrets:
         - jwt_secret
   
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

2. **Use external secret management:**
   ```bash
   # Load secrets from external source
   JWT_SECRET=$(vault kv get -field=jwt_secret secret/pdl)
   ```

---

## General Docker Issues

### Issue: Docker Desktop Problems
**Solutions:**

1. **Restart Docker Desktop:**
   ```bash
   # Windows
   # Right-click Docker Desktop tray icon -> Restart
   
   # Or restart Docker service
   net stop com.docker.service
   net start com.docker.service
   ```

2. **Clear Docker cache:**
   ```bash
   docker system prune -a --volumes
   ```

3. **Check Docker Desktop settings:**
   - Resources (CPU, Memory)
   - WSL 2 integration
   - File sharing paths

### Issue: Out of Disk Space
**Solutions:**

1. **Clean up Docker resources:**
   ```bash
   # Remove unused containers
   docker container prune
   
   # Remove unused images
   docker image prune -a
   
   # Remove unused volumes
   docker volume prune
   
   # Remove everything unused
   docker system prune -a --volumes
   ```

2. **Check disk usage:**
   ```bash
   docker system df
   ```

---

## Debugging Commands

### Container Inspection
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Inspect container
docker inspect <container_name>

# Check container logs
docker logs <container_name>

# Follow logs
docker logs -f <container_name>

# Execute command in container
docker exec -it <container_name> /bin/sh
```

### Network Debugging
```bash
# List networks
docker network ls

# Inspect network
docker network inspect <network_name>

# Test connectivity between containers
docker exec -it <container1> ping <container2>

# Check port connectivity
docker exec -it <container> nc -zv <host> <port>
```

### Volume Debugging
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume_name>

# Check volume contents
docker run --rm -v <volume_name>:/data alpine ls -la /data
```

---

## Quick Reference

### Common Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build

# Scale services
docker-compose up --scale backend=3

# Run one-off command
docker-compose run backend npm test
```

### Environment Files
```bash
# Development
docker-compose --env-file .env.dev up

# Production
docker-compose --env-file .env.prod up

# Override compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Manual health check
docker exec -it pdl-backend curl -f http://localhost:3010/health
```

---

## Support

For additional help:
1. Check Docker Desktop logs
2. Review container logs: `docker logs <container>`
3. Verify network connectivity: `docker exec -it <container> ping <target>`
4. Check resource usage: `docker stats`
5. Consult Docker documentation: https://docs.docker.com/
