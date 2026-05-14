#!/bin/bash
# Docker setup script for Church Management System

echo "🐳 Church Management System - Docker Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

echo "✅ Docker found"

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1. Start services (docker-compose up)"
echo "2. Start services in background (docker-compose up -d)"
echo "3. Stop services (docker-compose down)"
echo "4. Stop and remove data (docker-compose down -v)"
echo "5. View logs"
echo "6. Restart all services"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "Starting services..."
        docker-compose up
        ;;
    2)
        echo "Starting services in background..."
        docker-compose up -d
        echo ""
        echo "✅ Services started in background"
        echo "Frontend: http://localhost:3000"
        echo "API Gateway: http://localhost:3001"
        ;;
    3)
        echo "Stopping services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    4)
        read -p "Are you sure you want to remove all data? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo "Stopping and removing all containers and volumes..."
            docker-compose down -v
            echo "✅ Services stopped and data removed"
        else
            echo "Cancelled"
        fi
        ;;
    5)
        echo ""
        echo "Select service to view logs:"
        echo "1. All services"
        echo "2. MySQL"
        echo "3. Redis"
        echo "4. API Gateway"
        echo "5. Frontend"
        read -p "Enter choice (1-5): " log_choice

        case $log_choice in
            1) docker-compose logs -f ;;
            2) docker-compose logs -f mysql ;;
            3) docker-compose logs -f redis ;;
            4) docker-compose logs -f api-gateway ;;
            5) docker-compose logs -f frontend ;;
            *) echo "Invalid choice" ;;
        esac
        ;;
    6)
        echo "Restarting all services..."
        docker-compose restart
        echo "✅ Services restarted"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

