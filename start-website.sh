#!/bin/bash

echo "🌐 Запуск корпоративного веб-сайта AutoBid..."

# Переход в папку website
cd website

# Установка зависимостей (если нужно)
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Запуск сервера
echo "🚀 Запуск веб-сайта на порту 3000..."
WEBSITE_PORT=3000 node server.js