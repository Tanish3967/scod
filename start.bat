@echo off
setlocal enabledelayedexpansion
title SignFlow Enterprise Platform Launcher
cls

echo ===============================================================================
echo   SignFlow Enterprise Platform
echo   AI-Native Electronic Signatures, CLM, DocuSign Parity and Remote Notarization
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

:: 2. Terminate any stale processes on ports 5173 & 8090 to prevent EADDRINUSE
echo [*] Checking and freeing ports (5173, 8090)...
powershell -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(5173, 8090) } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul

:: 3. Check dependencies
if not exist "node_modules\" (
    echo [*] Installing frontend npm dependencies...
    call npm install
)

if not exist "services\unified-backend\node_modules\" (
    echo [*] Installing backend dependencies...
    call npm install --prefix services\unified-backend
)

:: 4. Build unified backend service
echo [*] Compiling Unified Backend Service Engine...
call npm run backend:build
if %errorlevel% neq 0 (
    echo [ERROR] Backend compilation failed!
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo [*] Launching Unified Backend Service Engine and Vite Frontend...
echo ===============================================================================

:: 5. Launch Unified Backend Engine (Port 8090)
echo   - Starting Unified Backend Engine on port 8090...
start "SignFlow [8090] - Unified Backend Engine" cmd /k "set PORT=8090&& npm run backend:start"

:: 6. Launch Frontend Dev Server (Port 5173)
echo   - Starting Vite Frontend Dev Server on port 5173...
start "SignFlow [5173] - Vite Frontend" cmd /k "npm run dev"

:: 7. Wait briefly and open browser
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
echo     * DocuSign v2.1 API:     http://localhost:8090/v2.1/accounts/demo-acc/envelopes
echo     * Envelopes & Shards:    http://localhost:8090/api/v1/envelopes
echo     * Storage & DB Telemetry:http://localhost:8090/api/v1/storage/metrics
echo     * Audit Merkle Ledger:   http://localhost:8090/api/v1/audit
echo     * Document Processor:    http://localhost:8090/api/v1/documents
echo     * AI Swarm Drafter:      http://localhost:8090/api/v1/ai
echo     * Email & Webhook Hub:   http://localhost:8090/api/v1/emails
echo ===============================================================================
echo.
echo   To stop all running services and free ports, run: stop.bat
echo.
pause
