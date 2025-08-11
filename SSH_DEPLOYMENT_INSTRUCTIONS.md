# 🔑 SSH Развертывание AutoBid.TJ

## Шаги для развертывания с вашего компьютера:

### 1. Скачать файлы из Replit

**Скачайте эти файлы:**
- `autobid-tj-build-final.tar.gz` (3.7MB)
- `deploy-digitalocean.sh` 

### 2. SSH подключение к VPS

```bash
# Подключение к VPS
ssh root@188.166.61.86
```

**Введите пароль от VPS** (который вы получили от DigitalOcean)

### 3. Автоматическое развертывание

**На вашем компьютере:**
```bash
# Сделать скрипт исполняемым
chmod +x deploy-digitalocean.sh

# Запустить автоматическое развертывание
./deploy-digitalocean.sh
```

### 4. Альтернативный способ - ручная загрузка

**Если автоматический скрипт не работает:**

```bash
# 1. Загрузить файл на VPS
scp autobid-tj-build-final.tar.gz root@188.166.61.86:~/

# 2. Подключиться к VPS
ssh root@188.166.61.86

# 3. На VPS выполнить:
cd ~/
mkdir -p autobid-tj
cd autobid-tj
tar -xzf ../autobid-tj-build-final.tar.gz

# 4. Создать переменные окружения
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
EOF

# 5. Создать systemd service
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'SERVICEEOF'
[Unit]
Description=AutoBid.TJ Auction Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/autobid-tj
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/root/autobid-tj/.env

StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=autobid

[Install]
WantedBy=multi-user.target
SERVICEEOF

# 6. Запустить службу
sudo systemctl daemon-reload
sudo systemctl enable autobid
sudo systemctl start autobid

# 7. Проверить статус
sudo systemctl status autobid
```

## Проверка результата

После развертывания проверьте:
- 🌐 **Сайт**: http://188.166.61.86
- 🏥 **Health**: http://188.166.61.86/health
- 📱 **SMS API**: http://188.166.61.86:3000/api/health

## Полезные команды на VPS

```bash
# Просмотр логов
sudo journalctl -u autobid -f

# Перезапуск службы
sudo systemctl restart autobid

# Статус службы  
sudo systemctl status autobid

# Остановка службы
sudo systemctl stop autobid
```

---
**Готово к развертыванию!** 🚀