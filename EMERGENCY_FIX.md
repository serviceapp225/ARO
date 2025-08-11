# 🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ VPS 188.166.61.86

## Проблема
Приложение развернуто, но возвращает ошибку 500. Сервис не запускается.

## Быстрое решение

### 1. Скопируйте команды из `fixed-database-command.txt` и выполните на VPS

### 2. Или выполните эти команды по порядку:

```bash
# Остановить все старые сервисы
sudo systemctl stop autobid-3001.service autobid-full 2>/dev/null || true

# Проверить PostgreSQL
sudo systemctl start postgresql

# Создать простой рабочий сервер
sudo tee /var/www/autobid/server.js > /dev/null << 'EOF'
const express = require('express');
const app = express();
const PORT = 3001;

app.use('/assets', express.static('/var/www/autobid/dist/public/assets'));
app.use(express.static('/var/www/autobid/dist/public'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AutoBid.TJ Production' 
  });
});

app.get('*', (req, res) => {
  res.sendFile('/var/www/autobid/dist/public/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AutoBid.TJ запущен на порту ${PORT}`);
});
EOF

# Создать systemd сервис
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'EOF'
[Unit]
Description=AutoBid.TJ Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/autobid
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Запустить сервис
sudo chown -R www-data:www-data /var/www/autobid
sudo systemctl daemon-reload
sudo systemctl enable autobid
sudo systemctl start autobid

# Проверить
sleep 3
sudo systemctl status autobid
curl http://localhost:3001/api/health

# Перезагрузить nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Проверка результата:
- `systemctl status autobid` - должен показать active (running)
- `curl http://localhost:3001/api/health` - должен вернуть JSON
- `http://188.166.61.86/api/health` - должен работать через браузер

## Если все еще не работает:

```bash
# Проверить логи
journalctl -u autobid -f

# Проверить порты
netstat -tlnp | grep :3001

# Проверить файлы
ls -la /var/www/autobid/
ls -la /var/www/autobid/dist/public/

# Убить процессы Node.js и перезапустить
sudo killall node
sudo systemctl restart autobid
```

## Ожидаемый результат:
✅ Сервер запущен на порту 3001  
✅ API /health возвращает корректный JSON  
✅ Статические файлы доступны через /assets/  
✅ SPA приложение работает через nginx на порту 80  

После исправления сайт будет доступен по адресу: **http://188.166.61.86**