@echo off
echo DISABLED: obsolete product affiliate autoposter retired during Stage 0 on 2026-08-25.
exit /b 1
:: NGG Social Auto-Poster - Daily Runner
:: Runs the social_autopost.py script and logs output

set SCRIPT_DIR=c:\newgiftsandgadgets.com
set PYTHON=C:\Python314\python.exe

cd /d "%SCRIPT_DIR%"

echo [%DATE% %TIME%] Starting NGG Auto-Poster... >> social_autopost_runner.log
"%PYTHON%" social_autopost.py --platform pinterest --type product >> social_autopost_runner.log 2>&1
"%PYTHON%" social_autopost.py --platform twitter --type product >> social_autopost_runner.log 2>&1
echo [%DATE% %TIME%] Done. >> social_autopost_runner.log
