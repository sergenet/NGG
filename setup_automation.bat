@echo off
echo DISABLED: obsolete Amazon automation cannot be re-registered. Retired during Stage 0 on 2026-08-25.
exit /b 1
set "SCRIPT_PATH=c:\newgiftsandgadgets.com\engine\auto_affiliate_updater.py"
set "TASK_NAME=NewGiftsAndGadgets_MasterAutomation"

echo Setting up autonomous site maintenance and repair...

:: Check if script exists
if not exist "%SCRIPT_PATH%" (
    echo [ERROR] Could not find %SCRIPT_PATH%
    pause
    exit /b 1
)

:: Create scheduled task (Every 2 days)
schtasks /create /tn "%TASK_NAME%" /tr "C:\Python314\python.exe %SCRIPT_PATH%" /sc daily /mo 2 /st 04:00 /f

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Automation task registered. It will run every 48 hours at 04:00 AM.
    echo To run it manually now, use: schtasks /run /tn "%TASK_NAME%"
) else (
    echo [ERROR] Failed to register task. Ensure you are running as administrator.
)

pause
