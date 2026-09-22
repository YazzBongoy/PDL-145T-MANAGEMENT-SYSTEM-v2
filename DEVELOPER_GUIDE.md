# PDL-145T Management System - Developer Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [API Documentation](#api-documentation)
5. [Frontend Development](#frontend-development)
6. [Database](#database)
7. [Authentication & Authorization](#authentication--authorization)
8. [Docker & Containerization](#docker--containerization)
9. [Development Workflows](#development-workflows)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## Project Overview

The **PDL-145T Management System** is a construction project management platform for the PDL-145T infrastructure program in the Mai Ndombe province of the Democratic Republic of Congo. It manages 65 construction sites (health centers, schools, administrative buildings) across 4 territories.

### Key Features

- **Project Management**: Track projects, tasks, budgets, and expenses
- **Construction Sites**: Manage 65+ sites across 4 territories with PostGIS spatial data
- **Document Management**: Ontology-based document classification (JURIDIQUE, FINANCE, SUIVI, TECHNIQUE, ADMIN)
- **Measurements & Validations**: Record construction measurements and track validation workflows
- **Role-Based Dashboards**: Custom views for Admin, Supervisor, Finance, Construction, and User roles
- **Reports**: Generate billing and project reports

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| Infrastructure | Docker + Docker Compose |
| Package Manager | npm workspaces (monorepo) |

---

## Architecture

### Monorepo Structure

```
pdl-145t-management-system/
├── backend/          # Express API server (port 3010)
├── frontend/         # React SPA (port 5173 in dev)
├── infrastructure/   # Docker Compose configs
├── docs/             # Architecture docs, ADRs
└── package.json      # Root workspace config
```

### Backend Structure

```
backend/src/
├── config/env.ts         # Centralized environment config
├── controllers/          # Request handlers
├── middleware/            # Auth, validation, rate limiting
├── routes/               # Express route modules
├── schemas/              # Zod validation schemas
├── services/             # Business logic
├── types/                # TypeScript type definitions
├── index.ts              # Express app entry point
└── lib/prisma.ts         # Prisma singleton
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── auth/             # ProtectedRoute, PublicRoute
│   ├── Dashboard/        # Role-based dashboards + widgets
│   ├── Documents/        # DocumentList with filters
│   ├── Expenses/         # ExpenseList
│   ├── Measurements/     # MeasurementList
│   ├── Projects/         # ProjectList
│   ├── Reports/          # ReportList
│   ├── Resources/        # ResourceList
│   ├── ui/               # Shared UI components (Table, Card, Badge, AppBar)
│   └── Validations/      # ValidationList
├── contexts/             # AuthContext
├── hooks/                # useApi, useCrudForm
├── test/                 # Test utilities
├── types/                # TypeScript types
├── App.tsx               # Route definitions
└── main.tsx              # Entry point with providers
```

### Data Flow

```
Browser → React (Vite dev / nginx prod) → Express API → Prisma → PostgreSQL
```

---

## Development Setup

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 15 (or use Docker)

### Local Development (No Docker)

```bash
# Install all dependencies (root + backend + frontend)
npm install

# Start backend + frontend with hot reload
npm run dev
```

This uses embedded PGlite for the database — no external PostgreSQL needed.

- Backend: `http://localhost:3010`
- Frontend: `http://localhost:3010` (served by API in dev mode)

### Local Development (With Docker)

```bash
# Start all services
docker compose -f infrastructure/docker-compose.dev.yml up -d

# View logs
docker compose -f infrastructure/docker-compose.dev.yml logs -f
```

### Environment Variables

Backend (`backend/.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | (none) | PostgreSQL connection string |
| `JWT_SECRET` | `dev_secret` | JWT signing secret |
| `PORT` | `3010` | Server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | Environment mode |

---

## API Documentation

### Base URL

- Development: `http://localhost:3010/api`
- Production: `https://your-domain.com/api`

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Obtain a token via `POST /api/auth/login`.

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/health` | No | Health check |
| GET | `/api/dashboard/stats` | Yes | Aggregated dashboard stats |
| **Projects** | | | |
| GET | `/api/projects` | Yes | List all projects |
| POST | `/api/projects` | Admin/Supervisor | Create project |
| GET | `/api/projects/:id` | Yes | Get project details |
| PUT | `/api/projects/:id` | Admin/Supervisor | Update project |
| DELETE | `/api/projects/:id` | Admin/Supervisor | Delete project |
| **Tasks** | | | |
| GET | `/api/tasks/project/:projectId` | Yes | List tasks for project |
| POST | `/api/tasks/project/:projectId` | Admin/Supervisor | Create task |
| PUT | `/api/tasks/:id` | Admin/Supervisor | Update task |
| DELETE | `/api/tasks/:id` | Admin/Supervisor | Delete task |
| **Expenses** | | | |
| GET | `/api/expenses/task/:taskId` | Yes | List expenses for task |
| POST | `/api/expenses` | Admin/Supervisor | Create expense |
| PUT | `/api/expenses/:id` | Admin/Supervisor | Update expense |
| DELETE | `/api/expenses/:id` | Admin/Supervisor | Delete expense |
| **Resources** | | | |
| GET | `/api/resources` | Yes | List all resources |
| POST | `/api/resources` | Admin/Supervisor | Create resource |
| PUT | `/api/resources/:id` | Admin/Supervisor | Update resource |
| DELETE | `/api/resources/:id` | Admin/Supervisor | Delete resource |
| **Assignments** | | | |
| GET | `/api/assignments/project/:projectId` | Yes | List project resources |
| POST | `/api/assignments/project/:projectId` | Admin/Supervisor | Assign resource to project |
| DELETE | `/api/assignments/project/:pid/resource/:rid` | Admin/Supervisor | Unassign resource |
| GET | `/api/assignments/task/:taskId` | Yes | List task resources |
| POST | `/api/assignments/task/:taskId` | Admin/Supervisor | Assign resource to task |
| DELETE | `/api/assignments/task/:tid/resource/:rid` | Admin/Supervisor | Unassign resource |
| **Measurements** | | | |
| GET | `/api/measurements` | Yes | List measurements (paginated) |
| GET | `/api/measurements/task/:taskId` | Yes | List by task |
| POST | `/api/measurements/task/:taskId` | Construction | Create measurement |
| PUT | `/api/measurements/:id` | Admin/Supervisor | Update measurement |
| DELETE | `/api/measurements/:id` | Admin/Supervisor | Delete measurement |
| **Validations** | | | |
| GET | `/api/validations` | Yes | List validations (paginated) |
| GET | `/api/validations/task/:taskId` | Yes | List by task |
| POST | `/api/validations/task/:taskId` | Admin/Supervisor | Create validation |
| PUT | `/api/validations/:id` | Admin/Supervisor | Update validation |
| DELETE | `/api/validations/:id` | Admin/Supervisor | Delete validation |
| POST | `/api/validations/:id/approve` | Finance | Approve validation |
| POST | `/api/validations/:id/reject` | Finance | Reject validation |
| **Documents** | | | |
| GET | `/api/documents` | Yes | List documents (paginated, filterable) |
| GET | `/api/documents/stats` | Yes | Document statistics |
| POST | `/api/documents` | Admin/Supervisor | Create document |
| GET | `/api/documents/:id` | Yes | Get document details |
| PUT | `/api/documents/:id` | Admin/Supervisor | Update document |
| DELETE | `/api/documents/:id` | Admin/Supervisor | Delete document |
| GET | `/api/documents/:id/download` | Yes | Download document file |
| **Reports** | | | |
| GET | `/api/reports` | Yes | List reports (paginated) |
| POST | `/api/reports` | Finance | Create report |
| GET | `/api/reports/:id` | Yes | Get report details |
| DELETE | `/api/reports/:id` | Admin/Supervisor | Delete report |

### Error Responses

All errors return:

```json
{
  "error": "Error message"
}
```

HTTP status codes: `400` (validation), `401` (unauthorized), `403` (forbidden), `404` (not found), `409` (conflict), `500` (server error).

---

## Frontend Development

### Component Architecture

- **Pages**: Route-level components (`DashboardView`, `ProjectsView`, etc.)
- **List Components**: `ProjectList`, `ResourceList`, `ExpenseList`, `MeasurementList`, `ValidationList`, `ReportList`, `DocumentList`
- **Dashboard Widgets**: `DashboardSummary`, `TaskProgress`, `BudgetTracker`, `ValidationStatus`, `RecentActivity`, `SiteOverview`, `DocumentOverview`
- **Shared UI**: `Table`, `Card`, `CardHeader`, `Badge`, `AppBar`, `Logo`

### State Management

- **Auth state**: React Context (`AuthContext`) — `token`, `user`, `login()`, `logout()`
- **API data**: Local `useState` + `useCallback` in each component
- **Shared hooks**: `useApi` (generic fetch), `useCrudForm` (CRUD form state)

### Routing

React Router v7 with role-based guards:

- `/login` — Public (redirects to `/dashboard` if logged in)
- `/dashboard` — Protected (role-based dashboard)
- `/projects`, `/resources`, `/documents`, `/measurements`, `/validations`, `/reports` — Protected

### CSS

- Component-specific CSS files (`Dashboard.css`, `DocumentList.css`)
- Shared UI styles (`Table.css`, `List.css`, `Card.css`, `AppBar.css`)
- CSS custom properties for theming (see `index.css`)

---

## Database

### Schema

PostgreSQL with PostGIS extension. Managed via Prisma ORM.

**Core tables:**
- `Project` → `Task` → `Expense` (cascading deletes)
- `Resource` ↔ `Project` / `Task` (many-to-many via junction tables)
- `Measurement` → `Task`, `Site`
- `Validation` → `Task`, `Site`
- `Report` → `Validation`, `Project`
- `Document` → `Project`, `Territory`, `Site` (optional FKs)
- `Site` → `Territory`
- `User`

### Migrations

```bash
# Generate migration after schema change
npx prisma migrate dev --name <migration_name>

# Apply pending migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

---

## Authentication & Authorization

### Authentication Flow

1. User submits email + password to `POST /api/auth/login`
2. Backend verifies password via bcrypt
3. Backend returns JWT token + user object
4. Frontend stores in `localStorage` and React Context
5. All subsequent requests include `Authorization: Bearer <token>`

### Roles

| Role | Permissions |
|------|------------|
| `ADMIN` | Full access to all resources |
| `SUPERVISOR` | Create/edit projects, tasks, resources, expenses |
| `FINANCE` | View reports, approve/reject validations |
| `CONSTRUCTION` | Create measurements |
| `USER` | Read-only access |

### Middleware

- `authenticateJWT` — Verifies token, attaches `user` to request
- `requireAdminOrSupervisor` — Checks role is ADMIN or SUPERVISOR
- `requireFinance` — Checks role is FINANCE
- `requireConstruction` — Checks role is CONSTRUCTION
- `validateSchema` — Zod schema validation on request body/params

---

## Docker & Containerization

### Docker Files

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Multi-stage build: build TypeScript → production Node.js |
| `frontend/Dockerfile` | Multi-stage build: build React → nginx serving |
| `infrastructure/docker-compose.dev.yml` | Development services |
| `infrastructure/docker-compose.prod.yml` | Production deployment |
| `infrastructure/docker-compose.yml` | Default compose (CI/E2E) |

### Building Images

```bash
# Build backend
docker build -t pdl-backend ./backend

# Build frontend
docker build -t pdl-frontend ./frontend

# Build all via compose
docker compose -f infrastructure/docker-compose.prod.yml build
```

### Production Deployment

```bash
# Start production stack
docker compose -f infrastructure/docker-compose.prod.yml up -d

# View logs
docker compose -f infrastructure/docker-compose.prod.yml logs -f backend
```

---

## Development Workflows

### Git Workflow

- `main` — production-ready code
- `dev/*` — development branches
- `feature/*` — feature branches

### Commit Convention

```
<type>(<scope>): <description>

feat(backend): add document CRUD endpoints
fix(frontend): resolve dashboard loading state
docs: update developer guide
```

### CI/CD Pipeline

Defined in `.github/workflows/ci-cd.yml`:

1. **test-backend** — Lint + test backend
2. **test-frontend** — Lint + test + build frontend
3. **build-and-push** — Build and push Docker images to GHCR
4. **security-scan** — Trivy vulnerability scan
5. **e2e-tests** — Cypress E2E tests
6. **deploy** — Production deployment

---

## Testing

### Test Commands

```bash
# Run all tests (frontend + backend)
npm test

# Backend tests only
npm test --prefix backend

# Frontend tests only
npm test --prefix frontend

# Frontend with coverage
npm run test:coverage --prefix frontend
```

### Test Frameworks

- **Backend**: Jest + ts-jest + supertest
- **Frontend**: Vitest + @testing-library/react + @testing-library/user-event

### Current Test Coverage

- Backend: 24 tests (auth, projects, measurements)
- Frontend: 72 tests (App, Dashboard, Auth, Projects, ErrorBoundary)

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :3010  # Find process using port
kill <PID>     # Stop it
```

**Database connection refused:**
```bash
# If using Docker, ensure PostgreSQL is running
docker compose -f infrastructure/docker-compose.dev.yml up db

# Check logs
docker compose -f infrastructure/docker-compose.dev.yml logs db
```

**Prisma client not generated:**
```bash
npx prisma generate
```

**Frontend build fails:**
```bash
cd frontend && npm install && npm run build
```

**Stale dev server (tsx caching):**
```bash
# Kill all node processes and restart
pkill -f node && npm run dev
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run the full test suite: `npm test`
5. Submit a pull request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- No hardcoded secrets or credentials
- Company-scoped data (all entities belong to a project)
- Keep contracts synchronized across layers

---

*Last updated: September 18, 2026*
