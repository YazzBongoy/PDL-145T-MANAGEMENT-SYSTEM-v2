#!/bin/bash

# Comprehensive Playwright Test Runner Script
# Usage: ./scripts/run-playwright-tests.sh [test-pattern]

set -e

FRONTEND_DIR="/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/frontend"
BACKEND_URL="http://localhost:8001"
FRONTEND_URL="http://localhost:5173"

echo "=========================================="
echo "🎭 PDL-145T Playwright Test Suite"
echo "=========================================="

# Check if backend is running
echo ""
echo "🔍 Checking backend health..."
if curl -s "$BACKEND_URL/api/health" > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️ Backend is not responding at $BACKEND_URL"
    echo "   Starting tests anyway..."
fi

cd "$FRONTEND_DIR"

# Run specific test or all tests
TEST_PATTERN=${1:-"*.spec.ts"}

echo ""
echo "🧪 Running tests: $TEST_PATTERN"
echo "=========================================="

# Run Playwright tests with multiple reporters
npx playwright test "$TEST_PATTERN" \
    --project=chromium \
    --reporter=list,html \
    --output=test-results/ \
    2>&1 | tee test-run.log

TEST_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

echo ""
echo "📊 Test Report:"
echo "   HTML Report: file://$FRONTEND_DIR/playwright-report/index.html"
echo "   Log File: $FRONTEND_DIR/test-run.log"
echo ""
echo "💡 To view report: npx playwright show-report"
echo "=========================================="

exit $TEST_EXIT_CODE
