@echo off
echo ========================================
echo   Firebase Deployment Script
echo   Node.js 20 Required
echo ========================================
echo.

echo [1/4] Building client...
cd client
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Client build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Checking Firebase login...
firebase projects:list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo You need to login to Firebase first.
    firebase login
)

echo.
echo [3/4] Setting Firebase project...
firebase use kohtao-nightboat
if %ERRORLEVEL% NEQ 0 (
    echo Error: Could not set Firebase project!
    echo Please run: firebase use --add
    pause
    exit /b 1
)

echo.
echo [4/4] Deploying to Firebase...
firebase deploy

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is live at:
echo https://kohtao-nightboat.web.app
echo.
pause
