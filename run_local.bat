@echo off
setlocal enabledelayedexpansion
title SignFlow Enterprise — Local Development Runner
cls

echo ===============================================================================
echo   SignFlow Enterprise Platform — Local Run Launcher
echo   AI-Native Electronic Signatures, CLM, DocuSign Parity & Remote Notarization
echo ===============================================================================
echo.

:: 1. Verify Node.js and npm installations
echo [*] Checking Node.js environment...
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

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo   [OK] Node.js %NODE_VERSION% and npm %NPM_VERSION% detected.
echo.

:: 2. Terminate any stale processes on ports 5173 & 8090 to prevent EADDRINUSE
echo [*] Checking and freeing ports (5173, 8090)...
powershell -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(5173, 8090) } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul

:: 3. Ensure npm packages are installed
if not exist "node_modules\" (
    echo [*] Installing root frontend dependencies...
    call npm install
)

if not exist "services\unified-backend\node_modules\" (
    echo [*] Installing backend dependencies...
    call npm install --prefix services\unified-backend
)

:: 4. Build Unified Backend Service Engine TypeScript
echo [*] Compiling Unified Backend Service Engine...
call npm run backend:build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed! Check TypeScript errors above.
    pause
    exit /b 1
)
echo   [OK] Backend build succeeded.
echo.

:: 5. Launch Unified Backend Service Engine (Port 8090) in dedicated window
echo [*] Starting Unified Backend Service Engine on port 8090...
start "SignFlow [8090] - Unified Backend Engine" cmd /k "set PORT=8090&& npm run backend:start"

:: 6. Launch Frontend Dev Server (Port 5173) in dedicated window
echo [*] Starting Vite Frontend Client on port 5173...
start "SignFlow [5173] - Vite Frontend Client" cmd /k "npm run dev"

:: 7. Wait briefly for backend and frontend to initialize
echo [*] Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

:: 8. Automatically open browser
echo [*] Opening SignFlow application in default web browser...
start http://localhost:5173/

echo.
echo ===============================================================================
echo   SUCCESS: SignFlow Local Environment is Running!
echo ===============================================================================
echo   - Frontend Web App:        http://localhost:5173/
echo   - Unified Backend Engine:  http://localhost:8090/
echo   - Health Discovery Probe:  http://localhost:8090/health
echo   - DocuSign v2.1 REST API:  http://localhost:8090/v2.1/accounts/demo-acc/envelopes
echo   - Storage & DB Telemetry:  http://localhost:8090/api/v1/storage/metrics
echo   - Merkle Audit Ledger:     http://localhost:8090/api/v1/audit
echo   - Swarm AI Drafter Hub:    http://localhost:8090/api/v1/ai
echo ===============================================================================
echo.
echo   To stop all running services and free all ports, run: stop.bat
echo.
pause
