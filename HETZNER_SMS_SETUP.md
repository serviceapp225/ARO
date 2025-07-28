# HETZNER SMS ПРОКСИ - АВТОМАТИЧЕСКАЯ УСТАНОВКА

## 🎯 Быстрая настройка SMS прокси на Hetzner Cloud

### Этап 1: Создание сервера на Hetzner

1. **Регистрация**: https://www.hetzner.com/cloud
2. **Настройки сервера**:
   - Location: Нюрнберг или Хельсинки  
   - Image: Ubuntu 22.04 LTS
   - Type: CX11 (€3.29/месяц)
   - Name: sms-proxy

### Этап 2: Автоматическая установка (одна команда)

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/sms-proxy-setup.sh | bash
```

### Этап 3: Ручная установка (если нужно)

```bash
#!/bin/bash
# SMS Proxy Setup for Hetzner Cloud
echo "🚀 Установка SMS прокси сервера..."

# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Создание директории для SMS прокси
mkdir -p /opt/sms-proxy
cd /opt/sms-proxy

# Создание SMS прокси сервера
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'SMS Proxy', timestamp: new Date().toISOString() });
});

// SMS прокси endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { login, hash, sender, to, text } = req.body;
    
    console.log('📱 SMS прокси запрос:', { sender, to, text: text.substring(0, 50) + '...' });
    
    // Формируем запрос к OSON SMS API
    const params = new URLSearchParams({
      login: login,
      hash: hash,
      sender: sender,
      to: to,
      text: text
    });
    
    // Отправляем запрос к OSON SMS
    const response = await fetch('http://api.osonsms.com/sendsms.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    const result = await response.text();
    console.log('✅ OSON SMS ответ:', result);
    
    // Возвращаем результат клиенту
    res.status(response.status).send(result);
    
  } catch (error) {
    console.error('❌ Ошибка SMS прокси:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SMS proxy error',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMS Proxy сервер запущен на порту ${PORT}`);
  console.log(`📍 Внешний доступ: http://YOUR_IP:${PORT}`);
  console.log(`🔗 Health check: http://YOUR_IP:${PORT}/health`);
});
EOF

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "sms-proxy",
  "version": "1.0.0",
  "description": "SMS Proxy для OSON SMS API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Установка зависимостей
npm install

# Создание systemd службы
cat > /etc/systemd/system/sms-proxy.service << 'EOF'
[Unit]
Description=SMS Proxy Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sms-proxy
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Запуск службы
systemctl daemon-reload
systemctl enable sms-proxy
systemctl start sms-proxy

# Настройка firewall
ufw allow 22/tcp
ufw allow 3001/tcp
ufw --force enable

# Проверка статуса
echo "✅ Установка завершена!"
echo "📊 Статус службы:"
systemctl status sms-proxy --no-pager
echo ""
echo "🌐 Проверьте работу:"
echo "curl http://$(curl -s ifconfig.me):3001/health"
```

### Этап 4: Интеграция с Replit

После получения IP адреса Hetzner сервера обновите настройки в Replit:

```javascript
// В server/routes.ts обновите SMS_PROXY_URL
const SMS_PROXY_URL = 'http://YOUR_HETZNER_IP:3001';
```

### Этап 5: Добавление IP в белый список OSON

Отправьте IP адрес Hetzner сервера в службу поддержки OSON SMS для добавления в белый список.

## 🔧 Управление сервером

```bash
# Проверка статуса
systemctl status sms-proxy

# Просмотр логов
journalctl -u sms-proxy -f

# Перезапуск
systemctl restart sms-proxy

# Остановка
systemctl stop sms-proxy
```

## 💰 Стоимость

- **Hetzner CX11**: €3.29/месяц
- **Трафик**: 20TB включено
- **Резервные копии**: +20% (опционально)

## 🎯 Преимущества Hetzner

- Простая панель управления
- Быстрое развертывание
- Стабильные IP адреса
- Европейские дата-центры
- Отличная производительность
- Честная почасовая оплата

Сообщите IP адрес Hetzner сервера - я подготовлю финальный скрипт интеграции с Replit.