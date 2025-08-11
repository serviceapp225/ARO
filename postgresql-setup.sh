#!/bin/bash

# Настройка PostgreSQL для AutoBid.TJ

echo "🐘 Настраиваю PostgreSQL для AutoBid.TJ..."

ssh root@188.166.61.86 << 'POSTGRES_SETUP'
# Установка PostgreSQL
apt update
apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных и пользователя
sudo -u postgres psql << 'SQL'
CREATE DATABASE autobid_db;
CREATE USER autobid_user WITH PASSWORD 'AutoBid2025!Secure';
GRANT ALL PRIVILEGES ON DATABASE autobid_db TO autobid_user;
ALTER USER autobid_user CREATEDB;
\q
SQL

# Настройка подключения
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
echo "host autobid_db autobid_user 127.0.0.1/32 md5" >> /etc/postgresql/*/main/pg_hba.conf

# Перезапуск PostgreSQL
systemctl restart postgresql

# Обновление переменных окружения в приложении
cd ~/autobid-tj
cat > .env << 'ENV'
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://autobid_user:AutoBid2025!Secure@localhost:5432/autobid_db
VPS_PROXY_URL=http://localhost:3000
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
ENV

echo "✅ PostgreSQL настроен!"
echo "📊 База данных: autobid_db"
echo "👤 Пользователь: autobid_user"
echo "🔗 URL: postgresql://autobid_user:***@localhost:5432/autobid_db"

# Перезапуск приложения для применения новых настроек
systemctl restart autobid

echo "🔍 Статус служб:"
systemctl status postgresql --no-pager -l | head -3
systemctl status autobid --no-pager -l | head -3
POSTGRES_SETUP