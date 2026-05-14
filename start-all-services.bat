@echo off
REM Church Management System - All Services Startup
REM This script starts all required backend services in separate windows

echo.
echo ====================================================
echo  Church Management System - Backend Services
echo ====================================================
echo.

cd /d "%~dp0"

echo Starting all backend services...
echo.

echo [1/7] Starting Auth Service on port 3008...
start "Auth Service" cmd /k "cd backend\services\auth-service && npm start"
timeout /t 3 /nobreak >nul

echo [2/7] Starting Member Service on port 3002...
start "Member Service" cmd /k "cd backend\services\member-service && npm start"
timeout /t 2 /nobreak >nul

echo [3/7] Starting Attendance Service on port 3003...
start "Attendance Service" cmd /k "cd backend\services\attendance-service && npm start"
timeout /t 2 /nobreak >nul

echo [4/7] Starting Financial Service on port 3004...
start "Financial Service" cmd /k "cd backend\services\financial-service && npm start"
timeout /t 2 /nobreak >nul

echo [5/7] Starting Event Service on port 3005...
start "Event Service" cmd /k "cd backend\services\event-service && npm start"
timeout /t 2 /nobreak >nul

echo [6/7] Starting Communication Service on port 3006...
start "Communication Service" cmd /k "cd backend\services\communication-service && npm start"
timeout /t 2 /nobreak >nul

echo [7/7] Starting Reporting Service on port 3007...
start "Reporting Service" cmd /k "cd backend\services\reporting-service && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ====================================================
echo  All Services Started!
echo ====================================================
echo.
echo Services running:
echo   ✓ Auth Service:          http://localhost:3008
echo   ✓ Member Service:        http://localhost:3002
echo   ✓ Attendance Service:    http://localhost:3003
echo   ✓ Financial Service:     http://localhost:3004
echo   ✓ Event Service:         http://localhost:3005
echo   ✓ Communication Service: http://localhost:3006
echo   ✓ Reporting Service:     http://localhost:3007
echo.
echo Note: The API Gateway (3001) and Frontend (3000)
echo       should be running separately.
echo.
echo Keep these windows open. Close any to stop that service.
echo ====================================================
echo.

pause

