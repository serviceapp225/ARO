// Подготовка к развертыванию PostgreSQL на VPS

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Подготавливаю развертывание PostgreSQL...');

// Создание рабочего приложения без зависимости от БД
const minimalApp = `
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AutoBid.TJ VPS',
    timestamp: new Date().toISOString(),
    ready_for_database: true
  });
});

app.get('/', (req, res) => {
  res.send(\`
<!DOCTYPE html>
<html>
<head><title>AutoBid.TJ - Ready for PostgreSQL</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>🚗 AutoBid.TJ</h1>
    <h2>✅ VPS готов к PostgreSQL</h2>
    <p>Приложение работает на 188.166.61.86</p>
    <a href="/health">Health Check</a>
</body>
</html>
  \`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('AutoBid.TJ готов на порту', PORT);
});
`;

// Создание команды для развертывания PostgreSQL
const postgresCommand = \`
# 📋 КОМАНДА УСТАНОВКИ POSTGRESQL

ssh root@188.166.61.86 << 'POSTGRES_INSTALL'
# Остановка текущего приложения
systemctl stop autobid || true

# Обновление приложения
cd ~/autobid-tj
cat > app.js << 'MINIMAL_APP'
\${minimalApp}
MINIMAL_APP

# Перезапуск приложения
systemctl start autobid

# Установка PostgreSQL
apt update
DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных
sudo -u postgres createdb autobid_db
sudo -u postgres createuser autobid_user
sudo -u postgres psql -c "ALTER USER autobid_user WITH PASSWORD 'AutoBid2025';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE autobid_db TO autobid_user;"

echo "✅ PostgreSQL установлен и настроен!"
echo "🔗 База данных: autobid_db"
echo "👤 Пользователь: autobid_user"
echo "🌐 Сайт: http://188.166.61.86"

systemctl status postgresql | head -5
systemctl status autobid | head -5
POSTGRES_INSTALL
\`;

// Сохранение команды в файл
fs.writeFileSync('deploy-postgres.sh', postgresCommand);
fs.writeFileSync('minimal-app.js', minimalApp);

console.log('✅ Файлы подготовлены:');
console.log('   - deploy-postgres.sh (команда для PostgreSQL)');
console.log('   - minimal-app.js (приложение без БД)');
console.log('');
console.log('📋 Выполните: bash deploy-postgres.sh');