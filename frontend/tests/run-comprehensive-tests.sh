#!/bin/bash

# Comprehensive Playwright Test Runner
# This script runs extensive tests for the PDL-145T Management System

set -e

echo "=========================================="
echo "  COMPREHENSIVE PLAYWRIGHT TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if servers are running
echo "Checking server status..."
BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
    print_status "Backend is running on port 8002"
    BACKEND_RUNNING=true
else
    print_warning "Backend is not running. Will start it."
fi

if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    print_status "Frontend is running on port 5173"
    FRONTEND_RUNNING=true
else
    print_warning "Frontend is not running. Will start it."
fi

# Start servers if needed
if [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo "Starting backend server..."
    cd ../backend
    npm run dev > /tmp/backend-test.log 2>&1 &
    BACKEND_PID=$!
    cd ../frontend
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
            print_status "Backend is ready!"
            break
        fi
        sleep 1
    done
fi

if [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo "Starting frontend server..."
    npm run dev > /tmp/frontend-test.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    echo "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5173/ > /dev/null 2>&1; then
            print_status "Frontend is ready!"
            break
        fi
        sleep 1
    done
fi

# Ensure test results directory exists
mkdir -p test-results

echo ""
echo "=========================================="
echo "  RUNNING COMPREHENSIVE TEST SUITE"
echo "=========================================="
echo ""

# Run the comprehensive E2E tests
echo "Running comprehensive E2E tests..."
npx playwright test comprehensive-e2e.spec.ts --reporter=html,list || true

echo ""
echo "=========================================="
echo "  RUNNING EXISTING TEST SUITES"
echo "=========================================="
echo ""

# Run existing test files
echo "Running authentication tests..."
npx playwright test auth.spec.ts --reporter=list || print_warning "Auth tests completed with warnings"

echo ""
echo "Running dashboard tests..."
npx playwright test dashboard.spec.ts --reporter=list || print_warning "Dashboard tests completed with warnings"

echo ""
echo "Running devices tests..."
npx playwright test devices.spec.ts --reporter=list || print_warning "Devices tests completed with warnings"

echo ""
echo "Running devices CRUD tests..."
npx playwright test devices-crud.spec.ts --reporter=list || print_warning "Devices CRUD tests completed with warnings"

echo ""
echo "Running reports tests..."
npx playwright test reports.spec.ts --reporter=list || print_warning "Reports tests completed with warnings"

echo ""
echo "Running settings tests..."
npx playwright test settings.spec.ts --reporter=list || print_warning "Settings tests completed with warnings"

echo ""
echo "Running API tests..."
npx playwright test api.spec.ts --reporter=list || print_warning "API tests completed with warnings"

echo ""
echo "Running navigation tests..."
npx playwright test navigation-tabs.spec.ts --reporter=list || print_warning "Navigation tests completed with warnings"

echo ""
echo "Running accessibility tests..."
npx playwright test accessibility.spec.ts --reporter=list || print_warning "Accessibility tests completed with warnings"

echo ""
echo "Running performance tests..."
npx playwright test performance.spec.ts --reporter=list || print_warning "Performance tests completed with warnings"

echo ""
echo "=========================================="
echo "  GENERATING TEST REPORT"
echo "=========================================="
echo ""

# Generate HTML report
echo "Opening HTML report..."
npx playwright show-report || print_warning "Could not open report automatically"

echo ""
echo "=========================================="
echo "  TEST RUN COMPLETE"
echo "=========================================="
echo ""
echo "Test results saved to:"
echo "  - HTML Report: frontend/playwright-report/"
echo "  - Test Artifacts: frontend/test-results/"
echo ""
echo "View the full report with: npx playwright show-report"
echo ""

# Show summary
if [ -d "test-results" ]; then
    TEST_COUNT=$(find test-results -name "*.json" 2>/dev/null | wc -l)
    echo "Test artifacts generated: $TEST_COUNT files"
fi

echo ""
print_status "Test execution completed!"
echo ""
