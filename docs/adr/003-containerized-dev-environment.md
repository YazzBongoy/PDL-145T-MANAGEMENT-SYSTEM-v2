# ADR-003: Containerized dev environment with Docker Compose

## Status

Accepted

## Context

The PDL-145T Management System requires a consistent development environment across different
developer machines and deployment environments. The system includes multiple components (web
frontend, API backend, database) that need to work together seamlessly. We need to address:

- Environment consistency across development, testing, and production
- Simplified onboarding for new developers
- Dependency management for external services (database, caching, etc.)
- Isolation of development environment from host system
- Easy setup and teardown of complete development stack

## Decision

We will use **Docker Compose** to create a containerized development environment that
orchestrates all application components and their dependencies.

## Rationale

**Pros:**

- **Environment Consistency**: Same environment across all developer machines and CI/CD
- **Easy Onboarding**: New developers can start with a single `docker-compose up` command
- **Service Orchestration**: Manages dependencies between services (database, API, web)
- **Isolation**: Development environment isolated from host system
- **Production Parity**: Development environment closely mirrors production
- **Version Control**: Environment configuration stored in code repository
- **Resource Management**: Easy to control resource allocation and service scaling

**Cons:**

- **Learning Curve**: Developers need Docker knowledge
- **Resource Overhead**: Containers consume more resources than native development
- **Debugging Complexity**: Additional layer of abstraction for debugging
- **File System Performance**: Potential performance impact with volume mounts (especially on macOS/Windows)

**Alternatives considered:**

- **Native Development**: Requires manual setup, prone to environment drift
- **Vagrant**: Heavier than Docker, less integration with modern deployment practices
- **Dev Containers**: Good for individual development but less suited for multi-service orchestration
- **Kubernetes (minikube/k3s)**: Overkill for development, adds unnecessary complexity

## Implementation

### Docker Compose Structure

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pdl_management
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U developer -d pdl_management']
      interval: 30s
      timeout: 10s
      retries: 5

  # API Backend
  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://developer:dev_password@db:5432/pdl_management
    volumes:
      - ./packages/api:/app
      - /app/node_modules
    ports:
      - '3001:3001'
    depends_on:
      db:
        condition: service_healthy
    command: npm run dev

  # Web Frontend
  web:
    build:
      context: ./packages/web
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3001
    volumes:
      - ./packages/web:/app
      - /app/node_modules
    ports:
      - '3000:3000'
    depends_on:
      - api
    command: npm run dev

  # Redis (for caching/sessions)
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Development Dockerfiles

Each package will have a `Dockerfile.dev` optimized for development:

```dockerfile
# packages/api/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
```

### npm Scripts Integration

```json
{
  "scripts": {
    "dev": "docker-compose up",
    "dev:build": "docker-compose up --build",
    "dev:down": "docker-compose down",
    "dev:reset": "docker-compose down -v && docker-compose up --build",
    "dev:logs": "docker-compose logs -f",
    "dev:db": "docker-compose exec db psql -U developer -d pdl_management"
  }
}
```

## Consequences

**Positive:**

- **Consistent Environment**: All developers work in identical environments
- **Fast Onboarding**: New developers can start contributing immediately
- **Service Dependencies**: Automatic management of database, caching, and other services
- **Production Parity**: Development environment mirrors production architecture
- **Easy Testing**: Can spin up clean environments for integration testing
- **Documentation**: Environment configuration is self-documenting

**Negative:**

- **Resource Usage**: Higher CPU and memory consumption
- **Startup Time**: Initial container startup can be slow
- **File Sync**: Potential performance issues with file watching/syncing
- **Debugging**: Additional complexity when debugging containerized applications
- **Docker Dependency**: All developers must have Docker installed and configured

## Migration Strategy

1. **Phase 1**: Create Docker Compose configuration for existing services
2. **Phase 2**: Update development documentation and onboarding guides
3. **Phase 3**: Gradual migration of development workflows
4. **Phase 4**: Integration with CI/CD pipeline using same containers

## Monitoring and Maintenance

- Regular updates to base images for security patches
- Monitor container resource usage and optimize as needed
- Maintain separate configurations for different environments (dev, test, prod)
- Document common troubleshooting scenarios

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Development Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Official Image](https://hub.docker.com/_/node)
- [12 Factor App - Dev/prod parity](https://12factor.net/dev-prod-parity)

---

**Date:** 2025-01-07  
**Author:** Development Team  
**Template:** Based on [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md)
