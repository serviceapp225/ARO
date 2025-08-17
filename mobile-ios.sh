#!/bin/bash

echo "🍎 Сборка iOS приложения..."

# Сборка и синхронизация
npm run build
npx cap sync ios

# Открытие Xcode
echo "📱 Открываем Xcode..."
npx cap open ios