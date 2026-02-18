# Grief Weather Feature - Installatie Script
# Run dit in PowerShell

Write-Host ""
Write-Host "🌦️  GRIEF WEATHER INSTALLATIE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

cd "C:\dev\stilte ruimte"

# Stap 1: Maak directories
Write-Host "📂 Stap 1: Directories aanmaken..." -ForegroundColor Yellow
mkdir app\weather -Force | Out-Null
mkdir components -Force | Out-Null
Write-Host "   ✅ Directories aangemaakt" -ForegroundColor Green
Write-Host ""

# Stap 2: Kopieer files
Write-Host "📋 Stap 2: Files installeren..." -ForegroundColor Yellow

# Je moet deze files eerst downloaden:
# - grief-weather-migration.sql
# - weather-page.tsx
# - weather-widget.tsx

# Dan run:
$downloadsPath = "C:\Users\nieka\Downloads"

if (Test-Path "$downloadsPath\weather-page.tsx") {
    Copy-Item "$downloadsPath\weather-page.tsx" "app\weather\page.tsx" -Force
    Write-Host "   ✅ Weather page geïnstalleerd" -ForegroundColor Green
} else {
    Write-Host "   ❌ weather-page.tsx niet gevonden in Downloads" -ForegroundColor Red
}

if (Test-Path "$downloadsPath\weather-widget.tsx") {
    Copy-Item "$downloadsPath\weather-widget.tsx" "components\WeatherWidget.tsx" -Force
    Write-Host "   ✅ Weather widget geïnstalleerd" -ForegroundColor Green
} else {
    Write-Host "   ❌ weather-widget.tsx niet gevonden in Downloads" -ForegroundColor Red
}

Write-Host ""

# Stap 3: Installeer date-fns
Write-Host "📦 Stap 3: Dependencies installeren..." -ForegroundColor Yellow
npm install date-fns
Write-Host "   ✅ date-fns geïnstalleerd" -ForegroundColor Green
Write-Host ""

# Stap 4: Database setup
Write-Host "🗄️  Stap 4: Database setup..." -ForegroundColor Yellow
Write-Host "   ⚠️  BELANGRIJK: Ga naar Supabase SQL Editor" -ForegroundColor Yellow
Write-Host "   ⚠️  Run de SQL uit: grief-weather-migration.sql" -ForegroundColor Yellow
Write-Host "   ⚠️  Dit creëert de grief_weather table" -ForegroundColor Yellow
Write-Host ""

# Stap 5: Update dashboard
Write-Host "📝 Stap 5: Dashboard updaten..." -ForegroundColor Yellow
Write-Host "   ⚠️  Voeg WeatherWidget toe aan dashboard" -ForegroundColor Yellow
Write-Host "   ⚠️  Zie instructies hieronder" -ForegroundColor Yellow
Write-Host ""

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ FILES GEÏNSTALLEERD!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 VOLGENDE STAPPEN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. DATABASE SETUP:" -ForegroundColor Cyan
Write-Host "   - Ga naar: https://supabase.com → Je project → SQL Editor"
Write-Host "   - Open: grief-weather-migration.sql"
Write-Host "   - Kopieer en run de SQL"
Write-Host "   - Check dat 'grief_weather' table bestaat"
Write-Host ""
Write-Host "2. UPDATE DASHBOARD:" -ForegroundColor Cyan
Write-Host "   Open: app\dashboard\page.tsx"
Write-Host "   Voeg toe bovenaan:"
Write-Host "   import WeatherWidget from '@/components/WeatherWidget'" -ForegroundColor Gray
Write-Host ""
Write-Host "   Voeg toe in de grid (bijvoorbeeld na 'Schrijf een entry'):"
Write-Host "   <WeatherWidget userId={user.id} />" -ForegroundColor Gray
Write-Host ""
Write-Host "3. TEST:" -ForegroundColor Cyan
Write-Host "   npm run dev"
Write-Host "   Open http://localhost:3000/dashboard"
Write-Host "   Zie je de Weather widget? ✅"
Write-Host "   Klik erop → Ga naar /weather page"
Write-Host "   Check-in je eerste weer! 🌦️"
Write-Host ""
Write-Host "4. DEPLOY:" -ForegroundColor Cyan
Write-Host "   git add ."
Write-Host "   git commit -m 'Add Grief Weather feature'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "🎉 KLAAR!" -ForegroundColor Green
Write-Host ""
