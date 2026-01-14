@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Port 3000 is in use by PID %%a. Killing process...
    taskkill /PID %%a /F
)
echo Starting Rentapp dev server...
npm run dev
