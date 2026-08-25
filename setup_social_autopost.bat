@echo off
echo DISABLED: obsolete affiliate social automation cannot be re-registered. Retired during Stage 0 on 2026-08-25.
exit /b 1
:: Setup scheduled task for NGG social autopost (Pinterest-first)

set "SCRIPT_DIR=c:\newgiftsandgadgets.com"
set "TASK_NAME=NewGiftsAndGadgets_SocialAutopost"
set "RUNNER=%SCRIPT_DIR%\run_autopost.bat"

echo Setting up NGG social autopost schedule...

if not exist "%RUNNER%" (
    echo [ERROR] Missing runner script: %RUNNER%
    pause
    exit /b 1
)

:: Runs every day at 08:30 AM local time
schtasks /create /tn "%TASK_NAME%" /tr "cmd /c \"%RUNNER%\"" /sc daily /st 08:30 /f

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Social autopost scheduled daily at 08:30 AM.
    echo Run once now: schtasks /run /tn "%TASK_NAME%"
) else (
    echo [ERROR] Failed to register task. Try running this as administrator.
)

pause
