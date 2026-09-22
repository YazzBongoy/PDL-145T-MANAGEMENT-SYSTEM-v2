#!/bin/bash
# Stop PDL-145T Management System (production)
set -e

PROJECT_DIR="/home/ascatsarl/Documents/GitHub/CascadeProjects/pdl-145t-management-system"
COMPOSE_FILE="infrastructure/docker-compose.prod.yml"
LOG_FILE="/tmp/pdl-app.log"

echo "=== PDL-145T STOP ===" >> "$LOG_FILE"
echo "Stopped at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Stop and remove containers
docker compose -f "$COMPOSE_FILE" down 2>&1 | tee -a "$LOG_FILE"

echo "Stop complete at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"
echo "=== END STOP ===" >> "$LOG_FILE"
