#!/bin/bash
set -e

echo "🚀 Сборка для DigitalOcean без SQLite зависимостей..."

# Резервное копирование оригинального package.json
cp package.json package.json.backup

# Заменяем package.json на минимальный для продакшн (без SQLite)
cp package.digitalocean.minimal-core.json package.json

echo "✅ package.json заменён на production версию без SQLite"

# Чистим node_modules и lock-файлы
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml

echo "🧹 Очистка зависимостей завершена"

# Устанавливаем только продакшн зависимости (серверные)
npm install --production

echo "📦 Установлены только production зависимости"

# Сборка фронтенда (Vite) из папки client
echo "🌐 Сборка фронтенда (Vite)..."
cd client
npm install
npm run build
cd ..

echo "✅ Фронтенд собран и готов в client/dist"

# Сборка бэкенда (esbuild)
echo "🔧 Сборка бэкенда..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/index.js

echo "✅ Бэкенд собран"

# Копируем скрипты проверки базы данных в dist/
cp quick-db-check.js dist/
cp check-database-connection.js dist/

echo "🔧 Скрипты диагностики скопированы в dist/"

# Восстанавливаем оригинальный package.json
cp package.json.backup package.json

echo "🔄 Оригинальный package.json восстановлен"

echo "✅ Сборка для DigitalOcean завершена!"
echo "📁 Готовые файлы в папке dist/"
echo "🐳 Можно деплоить на DigitalOcean"
echo ""
echo "📋 Для проверки базы данных в production:"
echo "   node quick-db-check.js - быстрая проверка"
echo "   node check-database-connection.js - подробная диагностика"
