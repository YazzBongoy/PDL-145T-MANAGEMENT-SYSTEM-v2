#!/usr/bin/env bash
# =============================================================================
# PDL-145T Management System - Deployment Script
# =============================================================================
# Usage:
#   ./deploy.sh dev      - Start development environment
#   ./deploy.sh prod     - Start production environment
#   ./deploy.sh stop     - Stop all services
#   ./deploy.sh logs     - View logs
#   ./deploy.sh db       - Run database migrations
#   ./deploy.sh backup   - Backup database
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[PDL-145T]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

check_env() {
  if [ ! -f .env ]; then
    warn ".env file not found. Creating from .env.example..."
    cp .env.example .env
    warn "Please edit .env with your production values before continuing."
    exit 1
  fi
}

case "${1:-help}" in
  dev)
    log "Starting development environment..."
    docker compose -f infrastructure/docker-compose.dev.yml up --build
    ;;
  prod)
    check_env
    log "Starting production environment..."
    docker compose -f infrastructure/docker-compose.prod.yml up --build -d
    log "Services started. Run './deploy.sh logs' to view logs."
    ;;
  stop)
    log "Stopping all services..."
    docker compose -f infrastructure/docker-compose.prod.yml down 2>/dev/null || true
    docker compose -f infrastructure/docker-compose.dev.yml down 2>/dev/null || true
    docker compose down 2>/dev/null || true
    log "All services stopped."
    ;;
  logs)
    docker compose -f infrastructure/docker-compose.prod.yml logs -f --tail=100
    ;;
  db)
    log "Running database migrations..."
    docker compose -f infrastructure/docker-compose.prod.yml exec backend npx prisma migrate deploy
    ;;
  backup)
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    log "Creating database backup: $BACKUP_FILE"
    docker compose -f infrastructure/docker-compose.prod.yml exec -T db pg_dump -U pdl145t pdl145t > "$BACKUP_FILE"
    log "Backup saved to $BACKUP_FILE"
    ;;
  status)
    docker compose -f infrastructure/docker-compose.prod.yml ps
    ;;
  help|*)
    echo "Usage: $0 {dev|prod|stop|logs|db|backup|status}"
    echo ""
    echo "Commands:"
    echo "  dev     Start development environment with hot reload"
    echo "  prod    Start production environment"
    echo "  stop    Stop all services"
    echo "  logs    View production logs"
    echo "  db      Run database migrations"
    echo "  backup  Backup the database"
    echo "  status  Show service status"
    ;;
esac
