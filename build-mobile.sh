#!/bin/bash

echo "🏗️  Сборка мобильного приложения AutoBid.TJ"

# Сборка веб-версии
echo "📦 Сборка веб-версии..."
npm run build

# Синхронизация с мобильными платформами
echo "📱 Синхронизация с Capacitor..."
npx cap sync

echo "✅ Сборка завершена!"
echo ""
echo "Следующие шаги:"
echo "🤖 Android: npx cap open android"
echo "🍎 iOS: npx cap open ios"
echo ""
echo "Или используйте готовые команды:"
echo "• npm run mobile:android (откроет Android Studio)"
echo "• npm run mobile:ios (откроет Xcode)"