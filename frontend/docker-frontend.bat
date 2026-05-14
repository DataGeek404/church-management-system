@echo off
REM Church Management System - Frontend Docker Compose Helper
REM This script runs frontend service (Next.js)

setlocal enabledelayedexpansion

REM Docker path
set DOCKER_PATH=C:\Program Files\Docker\Docker\resources\bin\docker.exe

REM Check if docker exists
if not exist "%DOCKER_PATH%" (
    echo Error: Docker not found at %DOCKER_PATH%
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Display menu
echo.
echo ======================================
echo Church Management System - FRONTEND
echo ======================================
echo.
echo Available commands:
echo   1. Start service:       docker-frontend.bat up -d
echo   2. Stop service:        docker-frontend.bat down
echo   3. View logs:           docker-frontend.bat logs -f
echo   4. Check status:        docker-frontend.bat ps
echo.

REM Run docker compose with all arguments passed to this script
"%DOCKER_PATH%" compose -f docker.yaml %*

