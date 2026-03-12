@echo off
echo ========================================
echo   Math Platform - Client Startup
echo ========================================
echo.

echo [1/3] Navigating to client directory...
cd client

echo [2/3] Installing dependencies (if needed)...
call npm install

echo [3/3] Starting client...
echo.
echo Client will start on http://localhost:3000
echo Press Ctrl+C to stop the client
echo.
call npm run dev

pause
