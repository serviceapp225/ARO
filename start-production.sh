#!/bin/bash

echo "🚀 Запуск автоаукциона в продакшн режиме..."

# Остановка сервера разработки
pkill -f "tsx.*server/index.ts" 2>/dev/null || true

# Запуск продакшн сервера
node replit-production.js

echo "✅ Продакшн сервер запущен"