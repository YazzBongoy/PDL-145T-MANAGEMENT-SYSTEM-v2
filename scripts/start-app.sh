#!/bin/bash
# Start PDL-145T Management System (production)
set -e

PROJECT_DIR="/home/ascatsarl/Documents/GitHub/CascadeProjects/pdl-145t-management-system"
COMPOSE_FILE="infrastructure/docker-compose.prod.yml"
LOG_FILE="/tmp/pdl-app.log"

echo "=== PDL-145T START ===" >> "$LOG_FILE"
echo "Started at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Build and start containers
docker compose -f "$COMPOSE_FILE" up -d --build 2>&1 | tee -a "$LOG_FILE"

# Wait for health check
echo "Waiting for services to be healthy..." | tee -a "$LOG_FILE"
sleep 10

# Verify
docker compose -f "$COMPOSE_FILE" ps 2>&1 | tee -a "$LOG_FILE"

echo "Start complete at: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"
echo "=== END START ===" >> "$LOG_FILE"
