#!/bin/bash

echo "🚀 Тестирование готовности к Replit Deployment..."
echo "================================================"

# Проверка подготовки к deployment
echo "1. Запуск подготовки deployment..."
node deploy-replit.js

# Проверка наличия файлов
echo ""
echo "2. Проверка критических файлов для deployment:"
files_to_check=(
  "dist/index.js"
  "dist/autoauction.db"
  "dist/public/index.html"
  "dist/public/assets"
  ".env.production"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
  if [ -e "$file" ]; then
    echo "✅ $file найден"
  else
    echo "❌ $file отсутствует"
    all_files_exist=false
  fi
done

# Проверка размеров файлов
echo ""
echo "3. Проверка размеров файлов:"
if [ -f "dist/index.js" ]; then
  server_size=$(stat -c%s "dist/index.js")
  echo "📊 Сервер: $server_size байт (~$(($server_size / 1024))KB)"
fi

if [ -f "dist/autoauction.db" ]; then
  db_size=$(stat -c%s "dist/autoauction.db")
  echo "📊 База данных: $db_size байт (~$(($db_size / 1024 / 1024))MB)"
fi

# Тест запуска production сервера
echo ""
echo "4. Тест запуска production сервера (5 секунд)..."
PORT=3000 NODE_ENV=production timeout 5s node dist/index.js &
server_pid=$!

sleep 2

# Проверка API endpoints
echo ""
echo "5. Тест API endpoints:"
api_tests=(
  "http://localhost:3000/api/listings"
  "http://localhost:3000/api/banners"
  "http://localhost:3000/"
)

for endpoint in "${api_tests[@]}"; do
  response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null | tail -1)
  if [ "$response" = "200" ]; then
    echo "✅ $endpoint - OK"
  else
    echo "❌ $endpoint - Fail (HTTP $response)"
  fi
done

# Завершение теста
kill $server_pid 2>/dev/null || true

echo ""
echo "6. Итоговый результат:"
if [ "$all_files_exist" = true ]; then
  echo "✅ Все файлы готовы для deployment"
  echo "🎉 ПРИЛОЖЕНИЕ ГОТОВО К DEPLOYMENT НА REPLIT"
  echo ""
  echo "📋 Следующие шаги:"
  echo "1. Нажмите кнопку 'Deploy' в Replit"
  echo "2. Выберите 'Autoscale' deployment"
  echo "3. Дождитесь завершения deployment"
  echo "4. Проверьте работу приложения по URL"
else
  echo "❌ Не все файлы готовы для deployment"
  echo "🔧 Запустите: node build-production.js"
fi

echo ""
echo "📄 Подробные инструкции: REPLIT_DEPLOYMENT_GUIDE.md"