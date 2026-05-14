#!/bin/bash

# Church Management System - Backend Setup and Run Script

echo ""
echo "========================================"
echo "Church Management System Backend Setup"
echo "========================================"
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js v18+"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"
echo ""

# Navigate to backend directory
cd backend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
fi

# Display startup options
echo ""
echo "========================================"
echo "Select startup mode:"
echo "========================================"
echo ""
echo "1. Development mode (with hot reload)"
echo "2. Production mode (build then start)"
echo "3. Build only"
echo "4. Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Starting NestJS backend in DEVELOPMENT mode..."
        echo "Backend will run on http://localhost:3001"
        echo "Swagger Docs: http://localhost:3001/api/docs"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "Building and starting backend in PRODUCTION mode..."
        npm run build
        if [ $? -ne 0 ]; then
            echo "ERROR: Build failed"
            exit 1
        fi
        echo ""
        echo "Starting production server..."
        npm run prod
        ;;
    3)
        echo ""
        echo "Building backend..."
        npm run build
        if [ $? -ne 0 ]; then
            echo "ERROR: Build failed"
            exit 1
        fi
        echo ""
        echo "✓ Build completed successfully!"
        echo "To run production server, execute: npm run prod"
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

