@echo off
title Ko Tao Night Boat - Development Server

echo ========================================
echo Ko Tao Night Boat - Quick Start
echo ========================================
echo.

REM Check if database exists
if not exist "server\dev.db" (
    echo [INFO] First time setup detected...
    echo [INFO] Setting up database...
    cd server
    call npx prisma generate
    call npx prisma db push
    
    echo.
    set /p SEED="Do you want to create sample admin/staff users? (y/n): "
    if /i "%SEED%"=="y" (
        echo [INFO] Creating sample users...
        call npm run seed
        echo.
        echo [SUCCESS] Sample users created!
        echo Admin - username: admin, password: admin123
        echo Staff - username: staff, password: staff123
    )
    cd ..
    echo.
)

echo [INFO] Starting servers...
echo.

REM Start server in new window
start "Ko Tao Server" cmd /k "cd server && npm start"

REM Wait a bit for server to start
timeout /t 3 /nobreak >nul

REM Start client in new window
start "Ko Tao Client" cmd /k "cd client && npm run dev"

echo.
echo [SUCCESS] Servers are starting...
echo.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill the servers
taskkill /FI "WindowTitle eq Ko Tao Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Ko Tao Client*" /T /F >nul 2>&1

echo.
echo [INFO] Servers stopped.
pause
