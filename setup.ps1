# AI Dispute Resolver - Automated Setup Script
# Run this script to set up your development environment

Write-Host "🚀 AI Dispute Resolver - Setup Script" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "`nChecking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "`nChecking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>&1
    Write-Host "✅ $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found or not in PATH" -ForegroundColor Yellow
    Write-Host "   Please ensure PostgreSQL is installed and running" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to backend
Set-Location -Path "backend"

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create .env if it doesn't exist
Write-Host "`nSetting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit backend/.env with your configuration" -ForegroundColor Yellow
}

# Go back to root
Set-Location -Path ".."

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to frontend
Set-Location -Path "frontend"

# Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create .env if it doesn't exist
Write-Host "`nSetting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit frontend/.env with your configuration" -ForegroundColor Yellow
}

# Go back to root
Set-Location -Path ".."

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure backend/.env with your settings:" -ForegroundColor White
Write-Host "   - DATABASE_URL (PostgreSQL connection)" -ForegroundColor Gray
Write-Host "   - SECRET_KEY (generate with: python -c 'import secrets; print(secrets.token_hex(32))')" -ForegroundColor Gray
Write-Host "   - GOOGLE_CLIENT_ID (from Google Cloud Console)" -ForegroundColor Gray

Write-Host "`n2. Configure frontend/.env with your settings:" -ForegroundColor White
Write-Host "   - VITE_GOOGLE_CLIENT_ID (same as backend)" -ForegroundColor Gray

Write-Host "`n3. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   psql -U postgres -c 'CREATE DATABASE dispute_resolver;'" -ForegroundColor Gray

Write-Host "`n4. Start the backend (in backend directory):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate" -ForegroundColor Gray
Write-Host "   python main.py" -ForegroundColor Gray

Write-Host "`n5. Start the frontend (in new terminal, in frontend directory):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n6. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray

Write-Host "`n📚 For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "   - QUICKSTART.md" -ForegroundColor Cyan
Write-Host "   - README.md" -ForegroundColor Cyan
Write-Host "   - IMPLEMENTATION_SUMMARY.md" -ForegroundColor Cyan

Write-Host "`n✨ Happy coding! ✨`n" -ForegroundColor Green
