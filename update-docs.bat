@echo off
echo 📚 XOS Documentation Updater
echo ============================
echo.

REM Check if PowerShell execution policy allows scripts
powershell -Command "if ((Get-ExecutionPolicy) -eq 'Restricted') { Write-Host '❌ PowerShell execution policy is Restricted. Run this first:' -ForegroundColor Red; Write-Host '   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser' -ForegroundColor Yellow; exit 1 }"

if errorlevel 1 (
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "update-html-docs.ps1" -Verbose

echo.
echo Press any key to exit...
pause >nul