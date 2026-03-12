@echo off
echo ========================================
echo   Math Platform - Server Startup
echo ========================================
echo.

echo [1/3] Navigating to server directory...
cd server

echo [2/3] Installing dependencies (if needed)...
call npm install

echo [3/3] Starting server...
echo.
echo Server will start on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
