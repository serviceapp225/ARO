#!/bin/bash

echo "=== Поиск server-v2.js в системе ==="
find / -name "server-v2.js" 2>/dev/null

echo -e "\n=== Проверка systemd сервисов ==="
systemctl list-units --type=service | grep -i node
systemctl list-units --type=service | grep -i server
systemctl list-units --type=service | grep -i sms

echo -e "\n=== Проверка cron задач ==="
crontab -l 2>/dev/null || echo "Нет cron задач для root"
cat /etc/crontab 2>/dev/null | grep -i server || echo "Нет server в /etc/crontab"

echo -e "\n=== Проверка /etc/rc.local ==="
cat /etc/rc.local 2>/dev/null | grep -i server || echo "Нет server в rc.local"

echo -e "\n=== Проверка PM2 ==="
pm2 list 2>/dev/null || echo "PM2 не найден"

echo -e "\n=== Поиск упоминаний server-v2.js в /etc/ ==="
grep -r "server-v2.js" /etc/ 2>/dev/null || echo "Нет упоминаний в /etc/"

echo -e "\n=== Проверка автозапуска в ~/.bashrc ==="
cat ~/.bashrc | grep -i server || echo "Нет server в ~/.bashrc"

echo -e "\n=== Проверка автозапуска в ~/.profile ==="
cat ~/.profile 2>/dev/null | grep -i server || echo "Нет server в ~/.profile"

echo -e "\n=== Проверка init.d ==="
ls /etc/init.d/ | grep -i node
ls /etc/init.d/ | grep -i server
ls /etc/init.d/ | grep -i sms

echo -e "\n=== Проверка systemd user сервисов ==="
systemctl --user list-units --type=service 2>/dev/null | grep -i node || echo "Нет user сервисов с node"

echo -e "\n=== Проверка screen/tmux сессий ==="
screen -ls 2>/dev/null || echo "Нет screen сессий"
tmux list-sessions 2>/dev/null || echo "Нет tmux сессий"

echo -e "\n=== Завершено ==="