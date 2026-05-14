@echo off
REM Church Management System - Complete Startup Script for Windows

echo.
echo ====================================================
echo  Church Management System - Startup
echo ====================================================
echo.

REM Colors (simulated)
setlocal enabledelayedexpansion

REM Kill any existing node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Install dependencies
echo.
echo Checking and installing dependencies...
cd backend\services\auth-service
call npm install >nul 2>&1
cd ..\..\..\backend\api-gateway
call npm install >nul 2>&1
cd ..\..\..\frontend
call npm install >nul 2>&1

REM Go back to root
cd ..\..

REM Start Auth Service
echo.
echo Starting Auth Service on port 3008...
start "Auth Service" cmd /k "cd backend\services\auth-service && npm run dev"
timeout /t 3 /nobreak >nul

REM Start API Gateway
echo Starting API Gateway on port 3001...
start "API Gateway" cmd /k "cd backend\api-gateway && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

REM Display information
echo.
echo ====================================================
echo  Services Started Successfully!
echo ====================================================
echo.
echo Access Points:
echo   - Frontend:     http://localhost:3000
echo   - API Gateway:  http://localhost:3001
echo   - Auth Service: http://localhost:3008
echo.
echo Login Credentials:
echo   - Email:    admin@church.local
echo   - Password: admin123
echo.
echo ====================================================
echo Close this window to stop startup monitoring.
echo Each service runs in its own command window.
echo ====================================================
echo.

timeout /t 10 /nobreak >nul

