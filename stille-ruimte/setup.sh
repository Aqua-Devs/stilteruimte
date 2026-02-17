#!/bin/bash

echo "🚀 StilleRuimte Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geïnstalleerd. Installeer Node.js eerst: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js versie: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installeren van dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies geïnstalleerd"
else
    echo "❌ Fout bij installeren dependencies"
    exit 1
fi

echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local niet gevonden"
    echo "📝 Kopiëren van .env.example naar .env.local..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  BELANGRIJK: Vul je Supabase credentials in .env.local in!"
    echo ""
    echo "Volg deze stappen:"
    echo "1. Ga naar https://supabase.com"
    echo "2. Maak een nieuw project aan"
    echo "3. Kopieer je Project URL en anon key"
    echo "4. Vul deze in .env.local"
    echo ""
    read -p "Druk op Enter als je dit hebt gedaan..."
fi

echo ""
echo "✅ Setup compleet!"
echo ""
echo "Volgende stappen:"
echo "1. Zorg dat je .env.local correct is ingevuld"
echo "2. Run de SQL schema in Supabase (zie README.md)"
echo "3. Start de development server: npm run dev"
echo ""
echo "🎉 Succes met bouwen!"
