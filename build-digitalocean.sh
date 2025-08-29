#!/bin/bash
set -e

echo "🚀 Сборка для DigitalOcean без SQLite зависимостей..."

# Резервное копирование оригинального package.json
cp package.json package.json.backup

# Используем ультра-минимальную production версию только с базовыми пакетами
cp package.digitalocean.ultra.json package.json

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
echo "🐳 Можно деплоить в DigitalOcean"