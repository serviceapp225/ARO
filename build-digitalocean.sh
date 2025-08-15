#!/bin/bash

echo "🏗️ Сборка для DigitalOcean App Platform..."

# Шаг 1: Сборка фронтенда
echo "📦 Сборка фронтенда..."
npm run build:frontend

# Шаг 2: Сборка продакшн сервера 
echo "🔧 Сборка продакшн сервера..."
npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

# Шаг 3: Копирование статических файлов
echo "📁 Копирование статических файлов..."
if [ -d "client/dist" ]; then
    mkdir -p dist/public
    cp -r client/dist/* dist/public/
    echo "✅ Статические файлы скопированы"
else
    echo "❌ Директория client/dist не найдена"
    exit 1
fi

# Шаг 4: Создание альтернативного index.js
echo "🔄 Создание index.js который запускает production.js..."
cat > dist/index.js << 'EOF'
// Перенаправление на production.js для обратной совместимости
import('./production.js').catch(console.error);
EOF

echo "✅ Сборка для DigitalOcean завершена!"
echo "📊 Размеры файлов:"
ls -lah dist/