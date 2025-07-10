# PDL-145T Management System

A comprehensive management system for PDL-145T operations built with Node.js, React, and PostgreSQL.

## Technology Stack Overview

### Frontend Technologies

- **React** (^18.2.0) - Component-based UI library for building interactive user interfaces with excellent developer experience and ecosystem
- **Vite** (^5.0.0) - Modern build tool providing fast development server and optimized production builds with ES modules support
- **React Testing Library** (^13.4.0) - Testing utilities focused on user behavior rather than implementation details, promoting maintainable tests

### Backend Technologies

- **Node.js** (>=18.0.0) - JavaScript runtime for server-side development with excellent package ecosystem and performance
- **Express** (^4.18.0) - Minimal and flexible web application framework for building REST APIs and web services
- **Prisma** (^5.0.0) - Modern database toolkit providing type-safe database access, migrations, and admin UI

### Database

- **PostgreSQL** (15.x) - Advanced open-source relational database with excellent JSON support, full-text search, and geospatial capabilities

### Development Tools

- **TypeScript** (^5.0.0) - Type-safe JavaScript superset improving code quality and developer productivity
- **ESLint** (^8.50.0) - Pluggable JavaScript linter for identifying and fixing code quality issues
- **Prettier** (^3.0.0) - Opinionated code formatter ensuring consistent code style across the project
- **Jest** (^29.0.0) - Comprehensive testing framework with built-in mocking, coverage reporting, and snapshot testing

### DevOps & Infrastructure

- **Docker** (^24.0.0) - Containerization platform for consistent development and deployment environments
- **Docker Compose** (^2.20.0) - Multi-container Docker application orchestration for local development
- **npm workspaces** - Monorepo management enabling shared dependencies and coordinated development workflows

## Getting Started

The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdl-145t-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp infrastructure/.env.example infrastructure/.env
   # Edit the .env file with your configuration
   ```

4. **Start the development environment**
   ```bash
   npm run dev
   ```

   This will start all services (database, backend, frontend) using Docker Compose.

## Contributor Guide

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Development Workflow

1. **Start development environment**:
   ```bash
   npm run dev
   ```

2. **Make changes to code**

3. **Run tests**:
   ```bash
   npm run test
   ```

4. **Lint and format**:
   ```bash
   npm run lint
   npm run format
   ```

5. **Run database migrations if needed**:
   ```bash
   npm run db:migrate
   ```

6. **Commit and push changes**

## Project Structure

```
pdl-145t-management-system/
├── backend/           # Express.js API server
├── frontend/          # React frontend application
├── infrastructure/    # Docker configuration
├── scripts/          # Development and deployment scripts
└── README.md
```

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Docker and Docker Compose

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdl-145t-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp infrastructure/.env.example infrastructure/.env
   # Edit the .env file with your configuration
   ```

4. **Start the development environment**
   ```bash
   npm run dev
   ```

   This will start all services (database, backend, frontend) using Docker Compose.

## Available Scripts

### Root Level Scripts

- **`npm run dev`** - Start the full development environment with Docker Compose
- **`npm run build`** - Build all workspace packages
- **`npm run test`** - Run tests across all workspaces
- **`npm run lint`** - Run linting across all workspaces
- **`npm run format`** - Format code across all workspaces
- **`npm run clean`** - Clean build artifacts across all workspaces

### Database Scripts

- **`npm run db:migrate`** - Run database migrations using Prisma
- **`npm run db:seed`** - Seed the database with initial data

### Backend Scripts

Navigate to the `backend/` directory and run:

- **`npm run dev`** - Start the backend server in development mode
- **`npm run build`** - Build the TypeScript code
- **`npm run start`** - Start the production server
- **`npm run test`** - Run backend tests
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run lint`** - Lint backend code
- **`npm run lint:fix`** - Fix linting issues automatically
- **`npm run format`** - Format backend code
- **`npm run format:check`** - Check code formatting

### Frontend Scripts

Navigate to the `frontend/` directory and run:

- **`npm run dev`** - Start the React development server
- **`npm run build`** - Build the React application for production
- **`npm run preview`** - Preview the production build
- **`npm run test`** - Run frontend tests
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run lint`** - Lint frontend code
- **`npm run lint:fix`** - Fix linting issues automatically
- **`npm run format`** - Format frontend code
- **`npm run format:check`** - Check code formatting

## Docker Development

The project uses Docker Compose for development. The configuration includes:

- **PostgreSQL with PostGIS** - Database server
- **Backend API** - Express.js server
- **Frontend** - React application

### Docker Commands

```bash
# Start all services
npm run dev

# Start specific services
docker compose -f infrastructure/docker-compose.yml up db
docker compose -f infrastructure/docker-compose.yml up backend
docker compose -f infrastructure/docker-compose.yml up frontend

# Stop all services
docker compose -f infrastructure/docker-compose.yml down

# View logs
docker compose -f infrastructure/docker-compose.yml logs -f

# Rebuild and start
docker compose -f infrastructure/docker-compose.yml up --build
```

## Database Management

### Migrations

Database migrations are handled by Prisma:

```bash
# Run migrations
npm run db:migrate

# Create a new migration
cd backend && npx prisma migrate dev --name your-migration-name

# Reset database
cd backend && npx prisma migrate reset
```

### Seeding

Seed the database with initial data:

```bash
npm run db:seed
```

## Code Quality

### Linting

The project uses ESLint for code linting:

```bash
# Lint all workspaces
npm run lint

# Lint specific workspace
npm run lint --workspace=backend
npm run lint --workspace=frontend

# Fix linting issues
npm run lint:fix --workspace=backend
npm run lint:fix --workspace=frontend
```

### Formatting

Prettier is used for code formatting:

```bash
# Format all workspaces
npm run format

# Format specific workspace
npm run format --workspace=backend
npm run format --workspace=frontend

# Check formatting
npm run format:check --workspace=backend
npm run format:check --workspace=frontend
```

### Testing

Jest is used for testing:

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=backend
npm run test --workspace=frontend

# Run tests in watch mode
npm run test:watch --workspace=backend
npm run test:watch --workspace=frontend
```

## Environment Variables

Create a `.env` file in the `infrastructure/` directory:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=pdl_management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Development Workflow

1. **Start development environment**:
   ```bash
   npm run dev
   ```

2. **Make changes to code**

3. **Run tests**:
   ```bash
   npm run test
   ```

4. **Lint and format**:
   ```bash
   npm run lint
   npm run format
   ```

5. **Run database migrations if needed**:
   ```bash
   npm run db:migrate
   ```

6. **Commit and push changes**

## Troubleshooting

### Common Issues

1. **Docker services not starting**: Check if ports 5432, 4000, and 5173 are available
2. **Database connection issues**: Verify environment variables in `.env` file
3. **Node modules issues**: Try deleting `node_modules` and running `npm install`
4. **Prisma client issues**: Run `npx prisma generate` in the backend directory

### Useful Commands

```bash
# Reset everything
docker compose -f infrastructure/docker-compose.yml down -v
npm run clean
npm install
npm run dev

# Check database
docker compose -f infrastructure/docker-compose.yml exec db psql -U postgres -d pdl_management

# View container logs
docker compose -f infrastructure/docker-compose.yml logs -f [service-name]
```
