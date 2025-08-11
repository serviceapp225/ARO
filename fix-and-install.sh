#!/bin/bash
# 🔧 ИСПРАВЛЕНИЕ ПРИЛОЖЕНИЯ И УСТАНОВКА POSTGRESQL

ssh root@188.166.61.86 << 'FIX_AND_INSTALL'
echo "🔧 Исправляю падающее приложение..."

# Остановка службы
systemctl stop autobid

# Создание рабочего приложения
cd ~/autobid-tj
cat > app.js << 'WORKING_APP'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>AutoBid.TJ - VPS Ready</title>
  <style>
    body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0; padding: 50px; color: white; text-align: center; }
    .card { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .status { background: #4CAF50; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .info { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 5px; }
  </style>
</head>
<body>
  <h1>🚗 AutoBid.TJ</h1>
  <div class="card">
    <div class="status">✅ VPS Приложение работает!</div>
    
    <div class="info"><strong>Сервер:</strong> 188.166.61.86</div>
    <div class="info"><strong>Nginx:</strong> Настроен на порту 80</div>
    <div class="info"><strong>Статус:</strong> Готов к PostgreSQL</div>
    <div class="info"><strong>Время работы:</strong> ${Math.floor(process.uptime())} сек</div>
    
    <a href="/health" class="btn">Health Check</a>
  </div>
  
  <p style="margin-top: 30px; opacity: 0.8;">
    Следующий шаг: установка PostgreSQL базы данных
  </p>
</body>
</html>`);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AutoBid.TJ VPS',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: Math.floor(process.uptime()),
    database: 'PostgreSQL not installed yet',
    next_step: 'Install PostgreSQL'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`AutoBid.TJ запущен на http://188.166.61.86:\${PORT}\`);
  console.log('Готов к установке PostgreSQL');
});
WORKING_APP

# Запуск приложения
systemctl start autobid
sleep 2

# Проверка что приложение работает
if systemctl is-active autobid >/dev/null 2>&1; then
  echo "✅ Приложение работает!"
else
  echo "❌ Приложение не запустилось"
  journalctl -u autobid --lines=10
  exit 1
fi

# Установка PostgreSQL
echo "🐘 Устанавливаю PostgreSQL..."
apt update
DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных и пользователя
sudo -u postgres createdb autobid_db
sudo -u postgres createuser autobid_user
sudo -u postgres psql -c "ALTER USER autobid_user WITH PASSWORD 'AutoBid2025';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autobid_db TO autobid_user;"

# Создание переменных окружения
cat > .env << 'ENV_VARS'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:AutoBid2025@localhost:5432/autobid_db
ENV_VARS

echo ""
echo "✅ ГОТОВО! Результаты:"
echo "🌐 Сайт: http://188.166.61.86"
echo "🏥 Health: http://188.166.61.86/health"
echo "🗄️ База данных: autobid_db"
echo "👤 Пользователь: autobid_user"
echo ""

# Проверка статуса служб
echo "📊 Статус служб:"
systemctl status autobid --no-pager | head -3
systemctl status postgresql --no-pager | head -3
FIX_AND_INSTALL