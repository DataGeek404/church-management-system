@echo off
REM Church Management System - Service Verification Script
REM This script verifies that all services are running and responding

setlocal enabledelayedexpansion

title Church Management System - Service Verification

echo.
echo ========================================
echo Church Management System - Health Check
echo ========================================
echo.

REM Array of services to check
set services=^
  "auth-service|3008"^
  "api-gateway|3001"^
  "member-service|3002"^
  "attendance-service|3003"^
  "financial-service|3004"^
  "event-service|3005"^
  "communication-service|3006"^
  "reporting-service|3007"

REM Check Docker status
echo Checking Docker status...
docker ps > nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    echo.
    pause
    exit /b 1
)
echo ✓ Docker is running
echo.

REM Display container status
echo ========================================
echo Container Status
echo ========================================
echo.
docker-compose ps
echo.

REM Check each service
echo ========================================
echo Service Health Checks
echo ========================================
echo.

setlocal enabledelayedexpansion

set /a healthy=0
set /a total=0

for %%s in (%services%) do (
    set "service_info=%%s"
    for /f "tokens=1,2 delims=|" %%a in ("!service_info!") do (
        set "service=%%a"
        set "port=%%b"

        set /a total+=1

        REM Get container name and status
        for /f %%x in ('docker-compose ps -q !service!') do (
            if "%%x" neq "" (
                echo Checking !service! on port !port!...

                REM Check if container is running
                for /f %%y in ('docker inspect -f {{.State.Running}} %%x 2^>nul') do (
                    if "%%y"=="true" (
                        echo   ✓ Container running
                        set /a healthy+=1
                    ) else (
                        echo   ✗ Container not running
                    )
                )
            ) else (
                echo Checking !service! on port !port!...
                echo   ✗ Container not found
            )
        )
        echo.
    )
)

echo ========================================
echo Summary
echo ========================================
echo Healthy Services: !healthy! / !total!
echo.

if !healthy! equ !total! (
    echo ✓ All services are running successfully!
    echo.
    echo You can now access:
    echo   - Frontend: http://localhost:3000
    echo   - API Gateway: http://localhost:3001
    echo   - Credentials: admin@church.local / admin123
) else (
    echo ✗ Some services are not running or not healthy.
    echo.
    echo To view detailed logs:
    echo   docker-compose logs [service-name]
    echo.
    echo To restart all services:
    echo   docker-compose restart
    echo.
)

echo ========================================
echo.
echo Press any key to exit...
pause > nul

exit /b 0

