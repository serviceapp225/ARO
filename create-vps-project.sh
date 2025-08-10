#!/bin/bash

# Скрипт для создания проекта на VPS без git

echo "🚀 Создание проекта autobid-tj на VPS..."

# Создание структуры проекта
mkdir -p autobid-tj/{client,server,shared,uploads}
cd autobid-tj

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "autobid-tj",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:pg-native",
    "start": "node dist/server.js",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "express": "^4.18.2",
    "drizzle-orm": "^0.29.0",
    "aws-sdk": "^2.1519.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "esbuild": "^0.19.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "concurrently": "^8.0.0",
    "vite": "^5.0.0"
  }
}
EOF

echo "✅ Создан package.json"
echo "📦 Установка зависимостей..."
npm install

echo "🎯 Проект готов! Переходите к копированию файлов кода."