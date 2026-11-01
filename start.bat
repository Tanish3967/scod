@echo off
setlocal enabledelayedexpansion
title SignFlow Enterprise Platform Launcher
cls

echo ===============================================================================
echo   SignFlow Enterprise Platform
echo   AI-Native Electronic Signatures, CLM and Remote Notarization
echo ===============================================================================
echo.

:: 1. Check Node.js and npm
echo [*] Verifying environment dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)

:: 2. Check root dependencies
if not exist "node_modules\" (
    echo [*] Installing frontend npm dependencies...
    call npm install
)

:: 3. Build unified backend service if needed
if not exist "services\unified-backend\dist\server.js" (
    echo [*] Compiling Unified Backend Service Engine...
    call npm run backend:build
)

echo.
echo ===============================================================================
echo [*] Launching Unified Backend Service Engine and Vite Frontend...
echo ===============================================================================

:: 4. Launch Unified Backend Engine (Port 8090)
echo   - Starting Unified Backend Engine on port 8090...
start "SignFlow [8090] - Unified Backend Engine" /min cmd /c "set PORT=8090&& node services\unified-backend\dist\server.js"

:: 5. Launch Frontend Dev Server (Port 5173)
echo   - Starting Vite Frontend Dev Server on port 5173...
start "SignFlow [5173] - Vite Frontend" /min cmd /c "npm run dev"

:: 6. Wait briefly and open browser
echo [*] Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo [*] Opening SignFlow application in default web browser...
start http://localhost:5173/

echo.
echo ===============================================================================
echo   SUCCESS: SignFlow Platform is Running!
echo ===============================================================================
echo   - Frontend Web App:        http://localhost:5173/
echo   - Unified Backend Engine:  http://localhost:8090/ (Health: /health)
echo     * Envelopes & Shards:    http://localhost:8090/api/v1/envelopes
echo     * Audit Merkle Ledger:   http://localhost:8090/api/v1/audit
echo     * Document Processor:    http://localhost:8090/api/v1/documents
echo     * AI Swarm Drafter:      http://localhost:8090/api/v1/ai
echo     * Email & Webhook Hub:   http://localhost:8090/api/v1/emails
echo ===============================================================================
echo.
echo   To stop all running services and free ports, run: stop.bat
echo.
pause
