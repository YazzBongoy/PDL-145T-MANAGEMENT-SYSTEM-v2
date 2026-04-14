#!/bin/bash
# Comprehensive Playwright Test Execution Script
# Run this script to execute all Playwright tests

set -e

echo "=========================================="
echo "🎭 PDL-145T Playwright Test Execution"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend"
BACKEND_URL="http://localhost:8001"

# Check if backend is running
echo "🔍 Step 1: Checking Backend Health..."
if curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    curl -s "$BACKEND_URL/api/health" | python3 -m json.tool 2>/dev/null || curl -s "$BACKEND_URL/api/health"
    echo ""
else
    echo -e "${YELLOW}⚠️  Backend not responding at $BACKEND_URL${NC}"
    echo "   Starting Docker services..."
    cd /home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/infrastructure
    docker-compose up -d db backend
    sleep 10
    echo ""
fi

# Check dependencies
echo "🔍 Step 2: Checking Dependencies..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright not installed. Installing...${NC}"
    npm install
    npx playwright install chromium
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "🔍 Step 3: Installing Playwright Browsers..."
    npx playwright install chromium
    echo -e "${GREEN}✅ Browsers installed${NC}"
    echo ""
fi

# Run tests
echo "🧪 Step 4: Running Playwright Tests..."
echo "=========================================="
echo ""

# Create test-results directory
mkdir -p test-results

# Run API tests first (fastest)
echo "📋 Running API Tests..."
npx playwright test api.spec.ts --project=chromium --reporter=line 2>&1 | tee test-results/api-test.log
echo ""

# Run App and Auth tests
echo "📋 Running App & Auth Tests..."
npx playwright test app.spec.ts auth.spec.ts --project=chromium --reporter=line 2>&1 | tee test-results/app-auth-test.log
echo ""

# Run Dashboard and Projects tests
echo "📋 Running Dashboard & Projects Tests..."
npx playwright test dashboard.spec.ts projects.spec.ts --project=chromium --reporter=line 2>&1 | tee test-results/dashboard-projects-test.log
echo ""

# Run E2E and Performance tests
echo "📋 Running E2E & Performance Tests..."
npx playwright test e2e-workflow.spec.ts performance.spec.ts --project=chromium --reporter=line 2>&1 | tee test-results/e2e-performance-test.log
echo ""

# Generate summary
echo "=========================================="
echo "📊 Test Execution Summary"
echo "=========================================="

# Count passed/failed tests from logs
PASSED=$(grep -c "✓" test-results/*.log 2>/dev/null || echo "0")
FAILED=$(grep -c "✘\|failed\|Error" test-results/*.log 2>/dev/null || echo "0")

echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo ""

# Show report location
echo "📁 Test Results:"
echo "   Logs: $FRONTEND_DIR/test-results/"
echo "   HTML Report: $FRONTEND_DIR/playwright-report/index.html"
echo ""

# Open report if tests passed
if [ "$FAILED" -eq "0" ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "To view HTML report, run:"
    echo "   npx playwright show-report"
    echo ""
    echo "Or open: file://$FRONTEND_DIR/playwright-report/index.html"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo "Check the logs in test-results/ for details"
fi

echo ""
echo "=========================================="
echo "✨ Test Execution Complete"
echo "=========================================="
