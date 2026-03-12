@echo off
color 0A
echo.
echo ============================================================
echo    MATH LEARNING PLATFORM - COMPLETE STARTUP
echo ============================================================
echo.
echo This script will start both backend and frontend servers
echo.
echo IMPORTANT: Keep this window open while using the platform!
echo.
pause

echo.
echo [STEP 1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js is installed
node --version

echo.
echo [STEP 2/5] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Failed to install server dependencies!
    echo.
    pause
    exit /b 1
)
echo ✓ Server dependencies installed

echo.
echo [STEP 3/5] Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Failed to install client dependencies!
    echo.
    pause
    exit /b 1
)
echo ✓ Client dependencies installed

echo.
echo [STEP 4/5] Starting backend server...
cd ..\server
start "Backend Server - Port 5000" cmd /k "npm run dev"
echo ✓ Backend server starting in new window...
echo   Wait for: "Server running on port 5000"

timeout /t 5 /nobreak >nul

echo.
echo [STEP 5/5] Starting frontend client...
cd ..\client
start "Frontend Client - Port 3000" cmd /k "npm run dev"
echo ✓ Frontend client starting in new window...
echo   Wait for: "Ready on http://localhost:3000"

echo.
echo ============================================================
echo    STARTUP COMPLETE!
echo ============================================================
echo.
echo Two new windows have opened:
echo   1. Backend Server (Port 5000)
echo   2. Frontend Client (Port 3000)
echo.
echo Wait for both to show "ready" messages, then:
echo   Open your browser to: http://localhost:3000
echo.
echo IMPORTANT: Do NOT close those windows while using the app!
echo.
echo Press any key to open the browser...
pause >nul

start http://localhost:3000

echo.
echo Browser opened! If the page doesn't load:
echo   1. Wait a few more seconds for servers to start
echo   2. Refresh the page (F5)
echo   3. Check the server windows for errors
echo.
echo Press any key to exit this window...
pause >nul
