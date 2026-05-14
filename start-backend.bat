@echo off
pause

)
    exit /b 1
    echo Invalid choice. Exiting...
) else (
    exit /b 0
    echo Exiting...
) else if "%choice%"=="4" (
    echo To run production server, execute: npm run prod
    echo Build completed successfully!
    echo.
    )
        exit /b 1
        pause
        echo ERROR: Build failed
    if errorlevel 1 (
    call npm run build
    echo Building backend...
    echo.
) else if "%choice%"=="3" (
    call npm run prod
    echo Starting production server...
    echo.
    )
        exit /b 1
        pause
        echo ERROR: Build failed
    if errorlevel 1 (
    call npm run build
    echo Building and starting backend in PRODUCTION mode...
    echo.
) else if "%choice%"=="2" (
    call npm run dev
    echo.
    echo Swagger Docs: http://localhost:3001/api/docs
    echo Backend will run on http://localhost:3001
    echo Starting NestJS backend in DEVELOPMENT mode...
    echo.
if "%choice%"=="1" (

set /p choice="Enter your choice (1-4): "

echo.
echo 4. Exit
echo 3. Build only
echo 2. Production mode (build then start)
echo 1. Development mode (with hot reload)
echo.
echo ========================================
echo Select startup mode:
echo ========================================
echo.
REM Display startup options

)
    echo.
    echo OK - .env file created
    copy .env.example .env
    echo Creating .env file from .env.example...
if not exist .env (
REM Check if .env exists

)
    echo.
    echo OK - Dependencies installed
    )
        exit /b 1
        pause
        echo ERROR: Failed to install dependencies
    if errorlevel 1 (
    call npm install
    echo Installing dependencies...
if not exist node_modules (
REM Check if node_modules exists

cd backend
REM Navigate to backend directory

echo.
echo OK - Node.js found
)
    exit /b 1
    pause
    echo ERROR: Node.js not found. Please install Node.js v18+
if errorlevel 1 (
node --version >nul 2>&1
echo Checking Node.js installation...
REM Check Node.js

echo.
echo ========================================
echo Church Management System Backend Setup
echo ========================================
echo.

title Church Management System - Backend Setup

REM Church Management System - Backend Setup and Run Script

