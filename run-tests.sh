#!/bin/bash

# 🧪 Script de lancement des tests PDL-145T Management System
# Usage: ./run-tests.sh [option]

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PDL-145T Management System - Test Runner${NC}"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check if servers are already running
check_servers() {
    echo -e "${BLUE}🔍 Checking if servers are running...${NC}"
    
    BACKEND_RUNNING=false
    FRONTEND_RUNNING=false
    
    if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running (port 8002)${NC}"
        BACKEND_RUNNING=true
    else
        echo -e "${YELLOW}⚠️ Backend not running${NC}"
    fi
    
    if curl -s http://localhost:5173/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running (port 5173)${NC}"
        FRONTEND_RUNNING=true
    else
        echo -e "${YELLOW}⚠️ Frontend not running${NC}"
    fi
}

# Start backend
start_backend() {
    if [ "$BACKEND_RUNNING" = false ]; then
        echo -e "${BLUE}🟢 Starting backend...${NC}"
        cd backend
        
        # Check if dependencies installed
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
            npm install
        fi
        
        # Check if database is set up
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️ .env file not found in backend${NC}"
            echo -e "${YELLOW}   Please create it with DATABASE_URL${NC}"
            exit 1
        fi
        
        # Seed database
        echo -e "${BLUE}🌱 Seeding database...${NC}"
        npx prisma db seed 2>/dev/null || true
        
        # Start backend in background
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # Wait for backend to start
        echo -e "${BLUE}⏳ Waiting for backend (max 30s)...${NC}"
        for i in {1..30}; do
            if curl -s http://localhost:8002/api/health > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Backend ready${NC}"
                BACKEND_RUNNING=true
                break
            fi
            sleep 1
            echo -n "."
        done
        echo ""
        
        if [ "$BACKEND_RUNNING" = false ]; then
            echo -e "${RED}❌ Backend failed to start${NC}"
            exit 1
        fi
    fi
}

# Start frontend
start_frontend() {
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo -e "${BLUE}🟡 Starting frontend...${NC}"
        cd frontend
        
        # Check if dependencies installed
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
            npm install
        fi
        
        # Check if Playwright browsers installed
        if [ ! -d "~/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
            echo -e "${YELLOW}🎭 Installing Playwright browsers...${NC}"
            npx playwright install chromium
        fi
        
        # Start frontend in background
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        # Wait for frontend to start
        echo -e "${BLUE}⏳ Waiting for frontend (max 30s)...${NC}"
        for i in {1..30}; do
            if curl -s http://localhost:5173/ > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend ready${NC}"
                FRONTEND_RUNNING=true
                break
            fi
            sleep 1
            echo -n "."
        done
        echo ""
        
        if [ "$FRONTEND_RUNNING" = false ]; then
            echo -e "${RED}❌ Frontend failed to start${NC}"
            exit 1
        fi
    fi
}

# Run tests
run_tests() {
    local test_filter="$1"
    
    echo ""
    echo -e "${BLUE}🧪 Running tests...${NC}"
    cd frontend
    
    if [ -n "$test_filter" ]; then
        echo -e "${BLUE}Filter: $test_filter${NC}"
        npx playwright test "$test_filter" --project=chromium --reporter=list 2>&1 || true
    else
        echo -e "${BLUE}Running all tests...${NC}"
        npx playwright test --project=chromium --reporter=list 2>&1 || true
    fi
    
    cd ..
}

# Show usage
show_usage() {
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  --smoke, -s        Quick smoke tests (navigation)"
    echo "  --regression, -r   Regression tests (devices, CRUD, API)"
    echo "  --core, -c         Core tests (critical functionality)"
    echo "  --full, -f         All tests (may be slow)"
    echo "  --api              API tests only"
    echo "  --e2e              E2E workflow tests"
    echo "  --perf             Performance tests"
    echo "  --a11y             Accessibility tests"
    echo "  --help, -h         Show this help"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh                    # Quick smoke tests"
    echo "  ./run-tests.sh --regression       # Regression tests"
    echo "  ./run-tests.sh tests/devices-crud.spec.ts  # Specific test file"
}

# Main
main() {
    local option="${1:---smoke}"
    
    case "$option" in
        --smoke|-s)
            echo -e "${YELLOW}🔥 Running SMOKE TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/navigation-tabs.spec.ts tests/devices.spec.ts"
            ;;
            
        --regression|-r)
            echo -e "${YELLOW}🔄 Running REGRESSION TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/devices*.spec.ts tests/reports-api.spec.ts"
            ;;
            
        --core|-c)
            echo -e "${YELLOW}💎 Running CORE TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/devices*.spec.ts tests/navigation*.spec.ts tests/app.spec.ts"
            ;;
            
        --full|-f)
            echo -e "${YELLOW}💯 Running ALL TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 3
            run_tests ""
            ;;
            
        --api)
            echo -e "${YELLOW}🔌 Running API TESTS...${NC}"
            check_servers
            start_backend
            sleep 2
            run_tests "tests/*api*.spec.ts"
            ;;
            
        --e2e)
            echo -e "${YELLOW}🎭 Running E2E TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/e2e*.spec.ts"
            ;;
            
        --perf)
            echo -e "${YELLOW}⚡ Running PERFORMANCE TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/performance.spec.ts tests/load-test.spec.ts"
            ;;
            
        --a11y)
            echo -e "${YELLOW}♿ Running ACCESSIBILITY TESTS...${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "tests/accessibility.spec.ts"
            ;;
            
        --help|-h)
            show_usage
            exit 0
            ;;
            
        *)
            # Assume it's a test file or pattern
            echo -e "${YELLOW}🎯 Running: $option${NC}"
            check_servers
            start_backend
            start_frontend
            sleep 2
            run_tests "$option"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Tests completed!${NC}"
}

# Run main
main "$@"
