@echo off
title SignFlow - Terminate All Services
cls

echo ===============================================================================
echo   Stopping all SignFlow frontend and backend services...
echo ===============================================================================

echo [*] Terminating background microservices and unified backend engine...
taskkill /F /IM envelope_service.exe 2>nul
taskkill /F /IM audit_service.exe 2>nul
taskkill /F /IM doc_processor.exe 2>nul

echo [*] Releasing open ports (5173, 8080, 8081, 8082, 8083, 8084, 8085, 8090)...
powershell -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(5173, 8080, 8081, 8082, 8083, 8084, 8085, 8090) } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo ===============================================================================
echo   [✓] All SignFlow services stopped and ports closed!
echo ===============================================================================
echo.
pause
