#!/bin/bash

echo "🤖 Сборка Android приложения..."

# Сборка и синхронизация
npm run build
npx cap sync android

# Открытие Android Studio
echo "📱 Открываем Android Studio..."
npx cap open android