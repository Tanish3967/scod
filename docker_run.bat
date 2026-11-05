@echo off
title SignFlow Enterprise — Docker Launcher
cls

echo ===============================================================================
echo   SignFlow Enterprise Platform — Docker Container Launcher
echo ===============================================================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [*] Building and launching containers via Docker Compose...
docker compose up --build -d

if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose failed to start containers!
    echo Ensure Docker Desktop is running and try again.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   SUCCESS: SignFlow Docker Containers are Running!
echo ===============================================================================
echo   - Frontend Client:      http://localhost:5173/
echo   - Unified Backend:      http://localhost:8090/
echo   - Health Discovery:     http://localhost:8090/health
echo ===============================================================================
echo.
echo [*] Opening SignFlow in default web browser...
start http://localhost:5173/

echo.
echo To view live logs, run: docker compose logs -f
echo To stop containers, run: docker compose down
echo.
pause
