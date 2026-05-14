@echo off
REM Docker setup script for Church Management System (Windows)

echo.
echo ==================================================
echo Docker Setup - Church Management System
echo ==================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo √ Docker found

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo √ Docker daemon is running
echo.

echo What would you like to do?
echo.
echo 1. Start services (docker-compose up)
echo 2. Start services in background (docker-compose up -d)
echo 3. Stop services (docker-compose down)
echo 4. Stop and remove data (docker-compose down -v)
echo 5. View logs
echo 6. Restart all services
echo 7. Check service status
echo.
set /p choice=Enter your choice (1-7):

if "%choice%"=="1" (
    echo Starting services...
    docker-compose up
)

if "%choice%"=="2" (
    echo Starting services in background...
    docker-compose up -d
    echo.
    echo √ Services started in background
    echo.
    echo Frontend: http://localhost:3000
    echo API Gateway: http://localhost:3001
    echo MySQL: localhost:3306
    echo Redis: localhost:6379
    echo.
    pause
)

if "%choice%"=="3" (
    echo Stopping services...
    docker-compose down
    echo √ Services stopped
    pause
)

if "%choice%"=="4" (
    set /p confirm=Are you sure you want to remove all data? (y/n):
    if /i "%confirm%"=="y" (
        echo Stopping and removing all containers and volumes...
        docker-compose down -v
        echo √ Services stopped and data removed
    ) else (
        echo Cancelled
    )
    pause
)

if "%choice%"=="5" (
    echo.
    echo Select service to view logs:
    echo 1. All services
    echo 2. MySQL
    echo 3. Redis
    echo 4. API Gateway
    echo 5. All Microservices
    echo 6. Frontend
    echo.
    set /p log_choice=Enter choice (1-6):

    if "%log_choice%"=="1" docker-compose logs -f
    if "%log_choice%"=="2" docker-compose logs -f mysql
    if "%log_choice%"=="3" docker-compose logs -f redis
    if "%log_choice%"=="4" docker-compose logs -f api-gateway
    if "%log_choice%"=="5" docker-compose logs -f member-service
    if "%log_choice%"=="6" docker-compose logs -f frontend
)

if "%choice%"=="6" (
    echo Restarting all services...
    docker-compose restart
    echo √ Services restarted
    pause
)

if "%choice%"=="7" (
    echo.
    echo Service Status:
    echo ================
    docker-compose ps
    echo.
    pause
)

