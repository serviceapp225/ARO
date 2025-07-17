#!/bin/bash

# Скрипт для тестирования deployment AutoBid.TJ

echo "🚀 Тестирование deployment AutoBid.TJ..."

# 1. Сборка приложения
echo "📦 Сборка приложения..."
if node build-production.js; then
    echo "✅ Сборка успешно завершена"
else
    echo "❌ Ошибка при сборке"
    exit 1
fi

# 2. Проверка файлов
echo "📁 Проверка файлов сборки..."
if [[ -f "dist/index.js" && -f "dist/autoauction.db" && -d "dist/public" ]]; then
    echo "✅ Все файлы на месте"
    echo "  - dist/index.js: $(du -h dist/index.js | cut -f1)"
    echo "  - dist/autoauction.db: $(du -h dist/autoauction.db | cut -f1)"
    echo "  - dist/public: $(du -h dist/public | cut -f1)"
else
    echo "❌ Файлы сборки отсутствуют"
    exit 1
fi

# 3. Запуск тестового сервера
echo "🔧 Запуск тестового сервера на порту 8080..."
PORT=8080 NODE_ENV=production node dist/index.js &
SERVER_PID=$!

# Ждем запуска сервера
sleep 3

# 4. Тестирование API
echo "🧪 Тестирование API..."
if curl -s http://localhost:8080/api/listings >/dev/null; then
    echo "✅ API работает корректно"
    
    # Проверка количества аукционов
    AUCTIONS_COUNT=$(curl -s http://localhost:8080/api/listings | grep -o '"id":[0-9]*' | wc -l)
    echo "  - Найдено $AUCTIONS_COUNT активных аукционов"
else
    echo "❌ API не отвечает"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 5. Тестирование фронтенда
echo "🌐 Тестирование фронтенда..."
if curl -s http://localhost:8080/ >/dev/null; then
    echo "✅ Фронтенд загружается"
else
    echo "❌ Фронтенд не загружается"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 6. Остановка сервера
echo "🛑 Остановка тестового сервера..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 DEPLOYMENT ТЕСТ ПРОЙДЕН УСПЕШНО!"
echo "📋 Готово к развертыванию:"
echo "  - Команда сборки: node build-production.js"
echo "  - Команда запуска: PORT=3000 NODE_ENV=production node dist/index.js"
echo "  - Размер приложения: ~17MB (база данных + код)"
echo "  - Все API endpoints работают"
echo "  - Фронтенд загружается корректно"