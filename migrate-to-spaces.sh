#!/bin/bash

# DigitalOcean Spaces Migration Script
# Скрипт для миграции изображений в DigitalOcean Spaces

echo "🚀 SPACES MIGRATION: Запуск миграции изображений в DigitalOcean Spaces"

# Проверяем наличие необходимых переменных окружения
if [ -z "$SPACES_KEY" ] || [ -z "$SPACES_SECRET" ] || [ -z "$SPACES_BUCKET" ]; then
    echo "❌ ОШИБКА: Необходимо установить переменные окружения:"
    echo "   - SPACES_KEY"
    echo "   - SPACES_SECRET" 
    echo "   - SPACES_BUCKET"
    echo ""
    echo "Пример:"
    echo "export SPACES_KEY=your_spaces_access_key"
    echo "export SPACES_SECRET=your_spaces_secret_key"
    echo "export SPACES_BUCKET=autobid-storage"
    exit 1
fi

echo "✅ Переменные окружения настроены"
echo "📦 Bucket: $SPACES_BUCKET"
echo "🌍 Region: ${SPACES_REGION:-ams3}"

# Запускаем миграцию
echo ""
echo "📤 Запуск миграции..."
tsx server/migrateToSpaces.ts

# Проверяем результат
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Миграция завершена успешно!"
    echo ""
    echo "💡 Следующие шаги:"
    echo "1. Проверьте загруженные файлы в DigitalOcean Spaces"
    echo "2. Убедитесь что приложение корректно загружает изображения"
    echo "3. После проверки можете очистить локальные файлы: rm -rf uploads/listings/*"
else
    echo ""
    echo "❌ Миграция завершилась с ошибками!"
    echo "Проверьте логи выше для деталей"
    exit 1
fi