#!/bin/bash

echo "🏗️ Полная сборка для DigitalOcean App Platform..."

# Шаг 1: Стандартная сборка
echo "📦 Стандартная сборка..."
npm run build

# Шаг 2: Сборка продакшн сервера
echo "🔧 Сборка продакшн сервера..."
npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js

# Шаг 3: Создание правильного index.js для DigitalOcean
echo "🔄 Создание index.js для DigitalOcean..."
cat > dist/index.js << 'EOF'
#!/usr/bin/env node

// Запуск production сервера для DigitalOcean
import('./production.js')
  .then(() => {
    console.log('✅ Production server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  });
EOF

echo "✅ Сборка для DigitalOcean завершена!"
echo "📊 Финальные файлы:"
ls -lah dist/
echo ""
echo "🎯 Готово для деплоя в DigitalOcean!"
echo "   • dist/index.js - точка входа (импортирует production.js)"
echo "   • dist/production.js - независимый сервер"
echo "   • dist/public/ - статические файлы"