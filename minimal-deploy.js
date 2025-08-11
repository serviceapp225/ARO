// Минимальное приложение без базы данных для проверки работы

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AutoBid.TJ',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: Math.floor(process.uptime()),
    database: 'Not connected yet'
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AutoBid.TJ - VPS Migration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, system-ui, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            color: #333;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; padding: 40px 0; }
        .card { background: white; border-radius: 15px; padding: 30px; margin: 20px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .status-ok { background: #4CAF50; color: white; text-align: center; border-radius: 10px; padding: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-box { background: #f8f9ff; padding: 15px; border-radius: 10px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 AutoBid.TJ</h1>
            <p>Миграция на DigitalOcean VPS</p>
        </div>
        
        <div class="card">
            <div class="status-ok">✅ Приложение работает на VPS!</div>
            
            <div class="info-grid">
                <div class="info-box">
                    <h4>🌐 Доступ</h4>
                    <p>http://188.166.61.86</p>
                </div>
                <div class="info-box">
                    <h4>⏰ Работает</h4>
                    <p>${Math.floor(process.uptime() / 60)} минут</p>
                </div>
                <div class="info-box">
                    <h4>🔧 Nginx</h4>
                    <p>Настроен</p>
                </div>
                <div class="info-box">
                    <h4>🗄️ База данных</h4>
                    <p>Следующий этап</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <a href="/health" class="btn">🏥 Health Check</a>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 10px;">
                <h4>📊 Прогресс миграции: 50%</h4>
                <p>✅ VPS подготовлен</p>
                <p>✅ Nginx настроен</p>
                <p>🔄 PostgreSQL (следующий шаг)</p>
                <p>⏳ Полное приложение</p>
            </div>
        </div>
        
        <div style="text-align: center; color: white; opacity: 0.8; margin-top: 30px;">
            <p><strong>AutoBid.TJ</strong> © 2025 | VPS: 188.166.61.86</p>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 AutoBid.TJ запущен на http://188.166.61.86:\${PORT}\`);
  console.log('🔧 Готов к настройке PostgreSQL');
});