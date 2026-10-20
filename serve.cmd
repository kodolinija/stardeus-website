@echo off
rem Serves the site at http://localhost:4000 through WSL Ubuntu (one-time: setup-wsl.sh).
wsl -d Ubuntu --cd "%~dp0." -- bash ./serve.sh %*
