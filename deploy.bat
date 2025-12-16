@echo off
echo ========================================
echo Ko Tao Night Boat - Deployment Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Navigate to project root
cd /d "%~dp0"
echo [INFO] Project root: %CD%
echo.

REM Install server dependencies
echo [INFO] Installing server dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)

REM Setup database
echo [INFO] Setting up database...
call npx prisma generate
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to setup database
    pause
    exit /b 1
)

REM Seed database
set /p SEED="Do you want to seed the database with sample data? (y/n): "
if /i "%SEED%"=="y" (
    echo [INFO] Seeding database...
    call npm run seed
)

REM Install client dependencies
echo [INFO] Installing client dependencies...
cd ..\client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

REM Build client
echo [INFO] Building client...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build client
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Deployment completed!
echo ========================================
echo.
echo Next steps:
echo 1. Start the server: cd server ^&^& npm start
echo 2. Serve client/dist with a web server
echo 3. Update client/.env with production API URL
echo.
echo Server will run on: http://localhost:3001
echo Client build is in: %CD%\dist
echo.
pause
