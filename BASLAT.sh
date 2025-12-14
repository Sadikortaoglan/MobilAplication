#!/bin/bash

echo "🚀 FindSpot uygulamasını başlatıyor..."
echo ""

# Eski process'leri temizle
pkill -9 -f expo 2>/dev/null
sleep 2

# Proje dizinine git
cd "$(dirname "$0")"

# Expo'yu başlat
echo "📱 Expo sunucusu başlatılıyor..."
echo "   Terminal'de 'w' tuşuna basarak web'i açabilirsiniz"
echo "   Veya http://localhost:8081 adresine gidebilirsiniz"
echo ""

npx expo start --web

