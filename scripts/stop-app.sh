#!/bin/bash
# Stop PDL-145T Management System (production)
set -e

# Resolve the repository root from this script's location so the script works
# from any checkout path (the previous hard-coded path was machine-specific).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="infrastructure/docker-compose.prod.yml"
LOG_FILE="${PDL_APP_LOG:-/tmp/pdl-app.log}"

echo "=== PDL-145T STOP ===" >> "$LOG_FILE"
echo "Stopped at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Stop and remove containers
docker compose -f "$COMPOSE_FILE" down 2>&1 | tee -a "$LOG_FILE"

echo "Stop complete at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"
echo "=== END STOP ===" >> "$LOG_FILE"
