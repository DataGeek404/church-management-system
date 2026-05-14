#!/bin/bash
# Church Management System - Complete Startup Script

echo "🚀 Starting Church Management System Components..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to start service in background
start_service() {
  local service_name=$1
  local service_path=$2
  local port=$3

  echo -e "${BLUE}Starting ${service_name}...${NC}"
  cd "$service_path"
  npm run dev &
  sleep 2
  echo -e "${GREEN}✓ ${service_name} started on port ${port}${NC}"
}

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*auth-service" 2>/dev/null
pkill -f "node.*api-gateway" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

# Install dependencies if needed
echo "Checking dependencies..."
cd backend/services/auth-service && npm install > /dev/null 2>&1
cd ../../../backend/api-gateway && npm install > /dev/null 2>&1
cd ../../../frontend && npm install > /dev/null 2>&1

# Change to project root
cd ../../..

# Start services
start_service "Auth Service" "backend/services/auth-service" "3008"
start_service "API Gateway" "backend/api-gateway" "3001"
start_service "Frontend" "frontend" "3000"

echo ""
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo ""
echo "📍 Access Points:"
echo "  - Frontend: http://localhost:3000"
echo "  - API Gateway: http://localhost:3001"
echo "  - Auth Service: http://localhost:3008"
echo ""
echo "🔐 Login with:"
echo "  - Email: admin@church.local"
echo "  - Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep the script running
wait

