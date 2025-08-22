@echo off
echo 📚 claude_docs Update Checker
echo ===========================
echo.

REM Check if PowerShell execution policy allows scripts
powershell -Command "if ((Get-ExecutionPolicy) -eq 'Restricted') { Write-Host '❌ PowerShell execution policy is Restricted. Run this first:' -ForegroundColor Red; Write-Host '   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser' -ForegroundColor Yellow; exit 1 }"

if errorlevel 1 (
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "check-docs-updates.ps1"

echo.
echo Press any key to exit...
pause >nul