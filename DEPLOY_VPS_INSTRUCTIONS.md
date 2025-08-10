# Инструкции по деплою на VPS (188.166.61.86)

## Исправления

✅ **Исправлена проблема с портами** - приложение теперь корректно использует переменную окружения PORT
✅ **Исправлены URL SMS прокси** - теперь используются переменные окружения вместо жестко прописанных адресов

## Команды для деплоя на VPS

Выполните эти команды на VPS (188.166.61.86):

```bash
# 1. Перейти в директорию приложения
cd ~/autobid-tj

# 2. Остановить существующую службу
sudo systemctl stop autobid

# 3. Сделать backup текущей версии (на всякий случай)
cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)

# 4. Удалить старый build
rm -rf dist

# 5. Скопировать новый build с Replit
# (сначала нужно скопировать файлы из Replit на VPS)

# 6. Установить правильные переменные окружения
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=your_database_url_here
VPS_PROXY_URL=http://localhost:3000/api/send-sms
SMS_LOGIN=zarex
SMS_PASSWORD=a6d5d8b47551199899862d6d768a4cb1
SMS_SENDER=OsonSMS
EOF

# 7. Проверить права на файлы
chmod +x dist/index.js

# 8. Запустить службу
sudo systemctl start autobid

# 9. Проверить статус
sudo systemctl status autobid

# 10. Проверить логи
sudo journalctl -u autobid -f

# 11. Тестировать доступность
curl http://localhost:3001/health
curl http://188.166.61.86/health
```

## Конфигурация портов

- **Порт 3001**: Основное приложение AutoBid.TJ
- **Порт 3000**: SMS прокси сервер (уже работает)
- **Порт 80**: Nginx прокси (перенаправляет на 3001)

## Переменные окружения

Критически важные переменные:

- `PORT=3001` - порт основного приложения
- `VPS_PROXY_URL=http://localhost:3000/api/send-sms` - URL SMS прокси
- `NODE_ENV=production` - режим производства

## Проверка работы

1. **Проверить приложение**: http://188.166.61.86
2. **Проверить health**: http://188.166.61.86/health
3. **Проверить SMS прокси**: http://188.166.61.86:3000/api/health
4. **Проверить логи**: `sudo journalctl -u autobid -f`

## Troubleshooting

Если приложение не запускается:

1. Проверить порты: `netstat -tlnp | grep :3001`
2. Проверить логи: `sudo journalctl -u autobid -f`
3. Проверить переменные: `cat .env`
4. Проверить права: `ls -la dist/index.js`

## Следующие шаги

После успешного деплоя:

1. Реализовать админский dropdown с номерами пользователей
2. Добавить SMS уведомления при создании листинга админом
3. Тестирование системы с реальными пользователями