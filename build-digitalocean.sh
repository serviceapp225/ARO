#!/bin/bash
set -e

echo "🚀 Сборка для DigitalOcean без SQLite зависимостей..."

# Резервное копирование оригинального package.json
cp package.json package.json.backup

# Используем минимальную версию только с 3 базовыми пакетами
cp package.digitalocean.minimal-core.json package.json

echo "✅ Package.json заменен на production версию без SQLite"

# Очищаем node_modules и package-lock.json для чистой установки
rm -rf node_modules package-lock.json

echo "🧹 Очищены node_modules и package-lock.json"

# Устанавливаем зависимости без SQLite
npm install

echo "📦 Установлены зависимости без SQLite"

# Собираем приложение
npm run build

echo "🏗️ Приложение собрано успешно"

# Восстанавливаем оригинальный package.json для development
cp package.json.backup package.json

echo "🔄 Оригинальный package.json восстановлен"

echo "✅ Сборка для DigitalOcean завершена!"
echo "📁 Готовые файлы в папке dist/"

# Копируем скрипт проверки базы данных
cp quick-db-check.js dist/
cp check-database-connection.js dist/

echo "🔧 Скрипты диагностики скопированы в dist/"
echo "🐳 Можно деплоить в DigitalOcean"
echo ""
echo "📋 Для проверки базы данных в production:"
echo "   node quick-db-check.js - быстрая проверка"
echo "   node check-database-connection.js - подробная диагностика"