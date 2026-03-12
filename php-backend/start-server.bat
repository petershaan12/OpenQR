@echo off
echo Starting PHP development server on port 8000...
cd /d "%~dp0"
php -S localhost:8000 -t .
pause