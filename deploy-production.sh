#!/bin/bash

# Скрипт для правильного production деплоя AUTOBID.TJ
set -e

echo "🏗️ Сборка frontend и backend для production..."

# Собираем проект
npm run build

echo "🚀 Запуск в production режиме..."

# Запускаем в production режиме
NODE_ENV=production node dist/index.js