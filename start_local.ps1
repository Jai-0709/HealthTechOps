# HealthTechOps — Local Development Startup Script
# SYNTHETIC ENVIRONMENT — Not an official Optum product
# 
# Usage: .\start_local.ps1
# Opens 4 separate terminal windows for all services.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  HealthTechOps — Starting Local Development Environment" -ForegroundColor Cyan
Write-Host "  SYNTHETIC ENVIRONMENT — Not an official Optum product" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend (FastAPI)
Write-Host "Starting Backend (FastAPI) on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location E:\HealthTechOps\backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Synthetic Services (Flask — ports 8010-8015)
Write-Host "Starting Synthetic Services on ports 8010-8015..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location E:\HealthTechOps\synthetic-services; python simulator.py"

Start-Sleep -Seconds 2

# 3. Monitoring Agent (Prometheus metrics — port 9100)
Write-Host "Starting Monitoring Agent on port 9100..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location E:\HealthTechOps\monitoring; python agent.py"

Start-Sleep -Seconds 2

# 4. Frontend (Vite dev server — port 5173)
Write-Host "Starting Frontend (Vite) on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location E:\HealthTechOps\frontend; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:          http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API:       http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:          http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Monitoring:        http://localhost:9100/metrics" -ForegroundColor White
Write-Host "  Synthetic Svcs:   http://localhost:8010 - 8015" -ForegroundColor White
Write-Host ""
Write-Host "  Login:  admin@healthtechops.local / HealthTechOps2024!" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
