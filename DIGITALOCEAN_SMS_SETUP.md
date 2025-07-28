# НАСТРОЙКА SMS ПРОКСИ НА DIGITALOCEAN VPS

## 🎯 IP адрес вашего сервера: 188.166.61.86

### Шаг 1: Подключение к серверу
Откройте терминал (Windows: PowerShell, Mac/Linux: Terminal) и выполните:

```bash
ssh root@188.166.61.86
```

При первом подключении система спросит:
- "Are you sure you want to continue connecting?" - напишите `yes`
- Введите пароль root (который вы получили от DigitalOcean)

### Шаг 2: Автоматическая установка SMS прокси
Скопируйте и вставьте эту команду в терминал:

```bash
curl -sSL https://raw.githubusercontent.com/user/repo/main/install-sms-proxy.sh | bash
```

**ИЛИ выполните команды вручную:**

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Создание папки для SMS прокси
mkdir -p /opt/sms-proxy
cd /opt/sms-proxy

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "sms-proxy",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Создание SMS прокси сервера
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'SMS Proxy for AUTOBID.TJ',
    ip: '188.166.61.86',
    timestamp: new Date().toISOString()
  });
});

// SMS proxy endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { login, hash, sender, to, text } = req.body;
    
    console.log('SMS запрос от Replit:', { 
      sender, 
      to: to?.substring(0, 6) + '***', 
      text: text?.substring(0, 20) + '...' 
    });
    
    // Подготовка параметров для OSON SMS
    const params = new URLSearchParams({
      login: login,
      hash: hash,
      sender: sender,
      to: to,
      text: text
    });
    
    // Отправка SMS через OSON API
    const response = await fetch('http://api.osonsms.com/sendsms.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    const result = await response.text();
    console.log('OSON ответ:', result);
    
    // Возврат ответа Replit приложению
    res.status(response.status).send(result);
    
  } catch (error) {
    console.error('Ошибка SMS прокси:', error);
    res.status(500).json({ 
      error: 'SMS proxy error',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMS Proxy запущен на порту ${PORT}`);
  console.log(`📍 IP адрес: 188.166.61.86`);
  console.log(`🔗 Health check: http://188.166.61.86:${PORT}/health`);
  console.log(`📱 SMS endpoint: http://188.166.61.86:${PORT}/api/send-sms`);
});
EOF

# Установка зависимостей
npm install

# Создание systemd сервиса для автозапуска
cat > /etc/systemd/system/sms-proxy.service << 'EOF'
[Unit]
Description=SMS Proxy for AUTOBID.TJ
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sms-proxy
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Запуск и включение автозапуска
systemctl daemon-reload
systemctl enable sms-proxy
systemctl start sms-proxy

# Проверка статуса
systemctl status sms-proxy
```

### Шаг 3: Проверка работы SMS прокси
После установки выполните проверку:

```bash
# Проверка статуса сервиса
systemctl status sms-proxy

# Проверка логов
journalctl -u sms-proxy -f

# Тест health check
curl http://188.166.61.86:3000/health
```

Вы должны увидеть ответ:
```json
{
  "status": "OK",
  "service": "SMS Proxy for AUTOBID.TJ", 
  "ip": "188.166.61.86",
  "timestamp": "2025-01-26T..."
}
```

### Шаг 4: Настройка firewall (если нужно)
```bash
# Разрешить трафик на порт 3000
ufw allow 3000
ufw enable
```

## 🎯 Следующие шаги после установки:

1. **Сообщите об успешной установке** - я обновлю Replit для использования вашего VPS
2. **Добавьте IP в белый список OSON** - свяжитесь с поддержкой OSON SMS и попросите добавить IP 188.166.61.86 в белый список
3. **Тестирование SMS** - после добавления в белый список протестируем отправку реальных SMS

## 🔧 Полезные команды для управления:

```bash
# Остановка сервиса
systemctl stop sms-proxy

# Запуск сервиса  
systemctl start sms-proxy

# Перезапуск сервиса
systemctl restart sms-proxy

# Просмотр логов
journalctl -u sms-proxy -f

# Обновление кода (если потребуется)
cd /opt/sms-proxy
nano server.js
systemctl restart sms-proxy
```

## 📊 Мониторинг и отладка:

- **Health check URL**: http://188.166.61.86:3000/health
- **Логи сервиса**: `journalctl -u sms-proxy -f`
- **Статус сервера**: `systemctl status sms-proxy`

**IP адрес для OSON белого списка: 188.166.61.86**