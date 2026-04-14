#!/bin/bash

# Script to run Playwright tests for new features (Devices, Reports, Settings)

echo "=========================================="
echo "Running Playwright Tests for New Features"
echo "=========================================="
echo ""

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  Frontend not running on http://localhost:5173"
    echo "Please start the frontend first: npm run dev"
    exit 1
fi

# Check if backend is running
if ! curl -s http://localhost:8002/api/health > /dev/null; then
    echo "⚠️  Backend not running on http://localhost:8002"
    echo "Please start the backend first"
    exit 1
fi

echo "✅ Frontend and Backend are running"
echo ""

# Run specific test files
echo "Running Devices tests..."
npx playwright test tests/devices.spec.ts --project=chromium

echo ""
echo "Running Reports tests..."
npx playwright test tests/reports.spec.ts --project=chromium

echo ""
echo "Running Settings tests..."
npx playwright test tests/settings.spec.ts --project=chromium

echo ""
echo "Running Navigation Tabs tests..."
npx playwright test tests/navigation-tabs.spec.ts --project=chromium

echo ""
echo "=========================================="
echo "All new features tests completed!"
echo "View report: npx playwright show-report"
echo "=========================================="
