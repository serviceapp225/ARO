#!/bin/bash
# Скрипт для обновления существующего сервера Digital Ocean до новой версии
set -e

echo "🔄 Обновление существующего сервера Digital Ocean..."

APP_DIR="/root/autobid-tj"
SERVICE_NAME="autobid"

# Проверяем что мы на правильном сервере
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Приложение не найдено в $APP_DIR"
    echo "❌ Этот скрипт должен запускаться на сервере Digital Ocean"
    exit 1
fi

cd $APP_DIR

# Останавливаем сервис
echo "⏹️ Остановка сервиса..."
systemctl stop $SERVICE_NAME

# Принудительное обновление Node.js до версии 20
echo "⚙️ Принудительное обновление Node.js до версии 20..."

# Проверяем текущую версию
current_version=$(node --version 2>/dev/null || echo "none")
echo "📊 Текущая версия Node.js: $current_version"

if [[ $current_version != v20* ]]; then
    echo "🔧 Обновляем Node.js до версии 20..."
    
    # Удаляем старую версию Node.js
    apt-get remove -y nodejs npm || true
    apt-get autoremove -y
    
    # Очищаем кэш
    apt-get clean
    rm -rf /usr/local/lib/node_modules || true
    rm -rf /usr/local/bin/node || true
    rm -rf /usr/local/bin/npm || true
    
    # Устанавливаем Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
    
    # Проверяем установку
    new_version=$(node --version)
    if [[ $new_version == v20* ]]; then
        echo "✅ Node.js 20 успешно установлен: $new_version"
    else
        echo "❌ Ошибка: Node.js версия $new_version не соответствует требуемой 20.x"
        exit 1
    fi
else
    echo "✅ Node.js уже версии 20: $current_version"
fi

# Получаем последние изменения из репозитория
echo "📥 Обновление кода из репозитория..."
git pull origin main

# Очищаем старые зависимости
echo "🧹 Очистка старых зависимостей..."
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml || true
npm cache clean --force

# Используем новый совместимый package.json
echo "📦 Установка совместимых зависимостей..."
cp package.digitalocean.minimal-core.json package.json

# Устанавливаем зависимости
npm install --production

# Проверяем на ошибки совместимости
echo "🔍 Проверка на ошибки совместимости..."
if npm ls --depth=0 2>&1 | grep -i "UNMET\|ERROR\|WARN.*engine"; then
    echo "⚠️ Найдены предупреждения совместимости, но продолжаем..."
fi

# Сборка фронтенда (если нужно)
if [ -d "client" ]; then
    echo "🌐 Обновление фронтенда..."
    cd client
    rm -rf node_modules package-lock.json || true
    npm install
    npm run build
    cd ..
fi

# Сборка бэкенда
echo "🔧 Сборка бэкенда..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/index.js

# Тестирование сборки
echo "🧪 Тестирование сборки..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Ошибка: файл dist/index.js не создан"
    exit 1
fi

# Проверяем что файл корректный
if ! node -c dist/index.js; then
    echo "❌ Ошибка: dist/index.js содержит синтаксические ошибки"
    exit 1
fi

echo "✅ Сборка прошла успешно"

# Запускаем сервис
echo "▶️ Запуск обновленного сервиса..."
systemctl start $SERVICE_NAME

# Ждем запуска
sleep 5

# Проверяем статус
echo "🔍 Проверка статуса сервиса..."
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Сервис успешно запущен"
    systemctl status $SERVICE_NAME --no-pager -l
else
    echo "❌ Ошибка запуска сервиса"
    echo "📋 Логи ошибок:"
    journalctl -u $SERVICE_NAME --no-pager -l -n 50
    exit 1
fi

# Проверяем доступность приложения
echo "🌐 Проверка доступности приложения..."
sleep 10

if curl -f http://localhost:3000/health &> /dev/null; then
    echo "✅ Приложение отвечает на запросы"
else
    echo "⚠️ Приложение не отвечает, проверьте логи"
    journalctl -u $SERVICE_NAME --no-pager -l -n 20
fi

echo ""
echo "🎉 Обновление завершено!"
echo ""
echo "📋 Полезные команды:"
echo "  Логи приложения: journalctl -u $SERVICE_NAME -f"
echo "  Перезапуск: systemctl restart $SERVICE_NAME"
echo "  Статус: systemctl status $SERVICE_NAME"
echo ""
echo "🌐 Версии ПО:"
echo "  Node.js: $(node --version)"
echo "  NPM: $(npm --version)"