@echo off
REM Church Management System - Complete System Startup
REM This script starts all services: Frontend, API Gateway, and all Microservices

setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo  Church Management System - Complete Startup
echo ======================================================================
echo.

cd /d "%~dp0"

REM Verify we're in the correct directory
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Cleaning up existing processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ======================================================================
echo Starting all services... (This will open 9 new windows)
echo ======================================================================
echo.

REM Start Frontend (Port 3000)
echo [1/9] Starting Frontend on port 3000...
start "Church-Frontend-3000" cmd /k "cd /d "%cd%\frontend" && npm start"
timeout /t 5 /nobreak >nul

REM Start API Gateway (Port 3001)
echo [2/9] Starting API Gateway on port 3001...
start "Church-API-Gateway-3001" cmd /k "cd /d "%cd%\backend\api-gateway" && npm start"
timeout /t 4 /nobreak >nul

REM Start Auth Service (Port 3008)
echo [3/9] Starting Auth Service on port 3008...
start "Church-Auth-Service-3008" cmd /k "cd /d "%cd%\backend\services\auth-service" && npm start"
timeout /t 3 /nobreak >nul

REM Start Member Service (Port 3002)
echo [4/9] Starting Member Service on port 3002...
start "Church-Member-Service-3002" cmd /k "cd /d "%cd%\backend\services\member-service" && npm start"
timeout /t 2 /nobreak >nul

REM Start Attendance Service (Port 3003)
echo [5/9] Starting Attendance Service on port 3003...
start "Church-Attendance-Service-3003" cmd /k "cd /d "%cd%\backend\services\attendance-service" && npm start"
timeout /t 2 /nobreak >nul

REM Start Financial Service (Port 3004)
echo [6/9] Starting Financial Service on port 3004...
start "Church-Financial-Service-3004" cmd /k "cd /d "%cd%\backend\services\financial-service" && npm start"
timeout /t 2 /nobreak >nul

REM Start Event Service (Port 3005)
echo [7/9] Starting Event Service on port 3005...
start "Church-Event-Service-3005" cmd /k "cd /d "%cd%\backend\services\event-service" && npm start"
timeout /t 2 /nobreak >nul

REM Start Communication Service (Port 3006)
echo [8/9] Starting Communication Service on port 3006...
start "Church-Communication-Service-3006" cmd /k "cd /d "%cd%\backend\services\communication-service" && npm start"
timeout /t 2 /nobreak >nul

REM Start Reporting Service (Port 3007)
echo [9/9] Starting Reporting Service on port 3007...
start "Church-Reporting-Service-3007" cmd /k "cd /d "%cd%\backend\services\reporting-service" && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ======================================================================
echo  All Services Started Successfully!
echo ======================================================================
echo.
echo FRONTEND:
echo   ✓ Frontend:              http://localhost:3000
echo.
echo API GATEWAY:
echo   ✓ API Gateway:           http://localhost:3001
echo.
echo MICROSERVICES (Backend):
echo   ✓ Auth Service:          http://localhost:3008
echo   ✓ Member Service:        http://localhost:3002
echo   ✓ Attendance Service:    http://localhost:3003
echo   ✓ Financial Service:     http://localhost:3004
echo   ✓ Event Service:         http://localhost:3005
echo   ✓ Communication Service: http://localhost:3006
echo   ✓ Reporting Service:     http://localhost:3007
echo.
echo LOGIN CREDENTIALS:
echo   Email:    admin@church.local
echo   Password: admin123
echo.
echo NOTES:
echo   - A new window will open for each service
echo   - Keep all windows open - services run in background
echo   - Close any window to stop that service
echo   - Close all windows to stop the application
echo.
echo ======================================================================
echo Opening browser in 3 seconds...
echo ======================================================================
echo.

timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo ✓ Browser opened!
echo ✓ All services are now running
echo ✓ Wait 5-10 seconds for services to fully initialize
echo ✓ Login page should load automatically
echo.
echo ======================================================================

timeout /t 5 /nobreak >nul

endlocal


