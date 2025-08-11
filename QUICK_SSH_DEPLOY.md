# ⚡ Быстрое SSH развертывание

**С вашего компьютера выполните:**

## 1. Скачать файлы из Replit
- `autobid-tj-build-final.tar.gz`
- `deploy-digitalocean.sh`

## 2. Запустить автоматическое развертывание
```bash
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

**Или ручная загрузка:**
```bash
# Загрузить файл
scp autobid-tj-build-final.tar.gz root@188.166.61.86:~/

# Подключиться к VPS  
ssh root@188.166.61.86

# На VPS выполнить одной командой:
cd ~ && mkdir -p autobid-tj && cd autobid-tj && tar -xzf ../autobid-tj-build-final.tar.gz && cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:secure_password_123@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
EOF

# Создать и запустить службу:
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'EOF'
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
EOF

sudo systemctl daemon-reload && sudo systemctl enable autobid && sudo systemctl start autobid && sudo systemctl status autobid
```

## 3. Проверить результат
- http://188.166.61.86 - основной сайт
- http://188.166.61.86/health - проверка работы

**Готово!** 🎉