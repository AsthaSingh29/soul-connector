@echo off
title Push Soul Connector to GitHub
echo ========================================================
echo   Pushing Soul Connector to GitHub (AsthaSingh29)
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS! Pushed to https://github.com/AsthaSingh29/soul-connector
    echo ========================================================
) else (
    echo.
    echo If you see "Repository not found", please create the repo first at:
    echo https://github.com/new with the name: soul-connector
    echo (Do not check README, .gitignore or license)
)
pause
