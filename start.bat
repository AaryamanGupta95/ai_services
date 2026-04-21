@echo off
echo ===================================================
echo Starting Intelligent Service Marketplace...
echo ===================================================

:: Load environment variables from config.env
if exist config.env (
    for /f "tokens=*" %%a in (config.env) do (
        set line=%%a
        if not "!line:~0,1!"=="#" (
            set %%a
        )
    )
    echo [OK] Loaded configuration from config.env
) else (
    echo [WARN] config.env not found. Using defaults.
)

echo Starting AI Service (Port 5000)...
start "AI Service" cmd /c "cd ai-service && python app.py"

echo Starting Java Backend (Port 8080)...
start "Backend" cmd /c "cd backend && mvn spring-boot:run"

echo Starting React Frontend (Port 5173)...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo All services are starting up.
echo Backend API will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:5173
echo AI Service will be available at: http://localhost:5000
echo ===================================================
pause
