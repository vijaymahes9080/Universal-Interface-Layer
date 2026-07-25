# Universal Interface Layer (UIL) Windows Setup Script

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Setting up Universal Interface Layer (UIL)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."

# 1. Setup Python Backend Virtual Environment
Write-Host "`n[1/3] Creating Python Virtual Environment..." -ForegroundColor Green
cd "$ProjectRoot\apps\backend"

if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Virtual environment 'venv' created." -ForegroundColor Yellow
} else {
    Write-Host "Virtual environment 'venv' already exists." -ForegroundColor Yellow
}

# Activate virtual environment
Write-Host "Activating venv and installing packages..." -ForegroundColor Green
& "venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
pip install -r requirements.txt

# 2. Setup Node packages in frontend
Write-Host "`n[2/3] Installing Node packages in React frontend..." -ForegroundColor Green
cd "$ProjectRoot\apps\frontend"
npm install

# 3. Setup Complete
Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "Setup Completed Successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "`nTo start UIL backend core server:" -ForegroundColor Yellow
Write-Host "  cd apps/backend"
Write-Host "  venv\Scripts\activate"
Write-Host "  python -m apps.backend.main"

Write-Host "`nTo start UIL frontend dashboard client:" -ForegroundColor Yellow
Write-Host "  cd apps/frontend"
Write-Host "  npm run dev"
Write-Host "`nAccess the browser dashboard at http://localhost:3000" -ForegroundColor Cyan
