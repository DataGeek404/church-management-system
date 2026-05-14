@echo off
REM Church Management System - Docker Compose Helper Script
REM This script runs docker compose with the correct paths

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Docker path
set DOCKER_PATH=C:\Program Files\Docker\Docker\resources\bin\docker.exe

REM Check if docker exists
if not exist "%DOCKER_PATH%" (
    echo Error: Docker not found at %DOCKER_PATH%
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Run docker compose with all arguments passed to this script
"%DOCKER_PATH%" compose %*

