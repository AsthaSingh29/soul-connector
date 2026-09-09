@echo off
title Soul Connector - WebXR Prototype Server
echo ========================================================
echo   SOUL CONNECTOR - WebXR Digital Legacy Prototype
echo ========================================================
echo.
echo Launching local server at http://localhost:8000 ...
start http://localhost:8000
python -m http.server 8000
pause
