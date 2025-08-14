#!/bin/bash

echo "🐳 Тест сборки Docker для DigitalOcean..."

# Очищаем старые образы
echo "🧹 Очистка старых образов..."
docker rmi autobid-tj:test 2>/dev/null || true

# Собираем образ
echo "🔨 Сборка Docker образа..."
docker build -t autobid-tj:test .

if [ $? -eq 0 ]; then
    echo "✅ Docker образ собран успешно!"
    
    # Проверяем содержимое образа
    echo "📋 Проверяем содержимое образа..."
    docker run --rm autobid-tj:test ls -la /app/dist
    
    # Тестируем запуск
    echo "🚀 Тестовый запуск приложения (5 секунд)..."
    timeout 5s docker run --rm -p 8080:8080 autobid-tj:test || true
    
    echo "✅ Тест завершен. Образ готов для деплоя в DigitalOcean!"
else
    echo "❌ Ошибка сборки Docker образа!"
    exit 1
fi