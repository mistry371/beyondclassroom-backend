@echo off
echo.
echo ========================================================
echo   PUSHING TO GITHUB: mathplatform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/5] Adding all files...
git add .

echo.
echo [2/5] Creating commit...
git commit -m "feat: Initial commit - Elite Mathematics Learning Platform - Complete full-stack EdTech platform with 25+ courses, 20+ calculator tools, admin panel, user dashboard, email OTP authentication, and premium charcoal black and golden theme. Built with Next.js, Node.js, Express, MongoDB, Redux, and Tailwind CSS."

echo.
echo [3/5] Setting branch to main...
git branch -M main

echo.
echo [4/5] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/mistry371/mathplatform.git

echo.
echo [5/5] Pushing to GitHub...
echo.
echo You will be asked for credentials:
echo   Username: mistry371
echo   Password: [Your GitHub Password or Personal Access Token]
echo.
pause

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Code pushed to GitHub!
    echo ========================================================
    echo.
    echo Repository: https://github.com/mistry371/mathplatform
    echo.
    echo Next steps:
    echo 1. Visit your repository
    echo 2. Add description and topics
    echo 3. Star your repository
    echo.
) else (
    echo.
    echo ========================================================
    echo   PUSH FAILED
    echo ========================================================
    echo.
    echo Try using GitHub Desktop instead:
    echo 1. Open GitHub Desktop
    echo 2. File - Add Local Repository
    echo 3. Select this folder
    echo 4. Publish repository
    echo.
)

pause
