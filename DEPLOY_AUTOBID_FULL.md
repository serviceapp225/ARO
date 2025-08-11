# 🚀 Развертывание полной версии AutoBid.TJ на VPS

## Статус инфраструктуры
- ✅ VPS: 188.166.61.86 работает  
- ✅ PostgreSQL: База `autobid_db` готова
- ✅ Nginx: Прокси настроен
- ✅ Приложение собрано и готово к развертыванию

## Быстрое развертывание

### Вариант 1: Полный автоматический скрипт
```bash
chmod +x deploy-full-autobid.sh
sudo ./deploy-full-autobid.sh
```

### Вариант 2: Пошаговая миграция базы данных
```bash
chmod +x migrate-database-vps.sh  
sudo ./migrate-database-vps.sh
```

### Вариант 3: Одна команда (копировать полностью)
Выполните содержимое файла `VPS_FULL_DEPLOY_COMMAND.txt` на сервере

## Что будет развернуто

### 🗄️ База данных
- **Таблицы**: users, car_listings, bids, favorites, notifications, car_alerts, banners, messages, auto_bids
- **Индексы**: Оптимизация для 10,000+ автомобилей
- **Триггеры**: Автоматическое обновление временных меток
- **Тестовые данные**: 3 пользователя и 1 баннер

### 🛠️ Приложение  
- **Backend**: Node.js с Express на порту 3001
- **Frontend**: React SPA со статическими файлами
- **WebSocket**: Реальное время для аукционов
- **Файловое хранилище**: Оптимизированные изображения

### 🌐 Веб-сервер
- **Nginx**: Обратный прокси на порту 80
- **SSL**: Готов для настройки HTTPS
- **Сжатие**: Gzip для статических файлов
- **Кэширование**: Оптимизированное кэширование ресурсов

### 🔧 Системные сервисы
- **systemd**: Автозапуск приложения
- **Логирование**: Централизованные журналы
- **Мониторинг**: Health endpoints
- **Безопасность**: Ограничения процессов

## После развертывания

### Доступ к приложению
- **Основной URL**: http://188.166.61.86
- **Прямой доступ**: http://188.166.61.86:3001  
- **API**: http://188.166.61.86/api/*
- **WebSocket**: ws://188.166.61.86/ws

### Учетные записи по умолчанию
- **Админ**: +992901234567 / admin@autoauction.tj
- **Продавец**: +992911234567 / seller@autoauction.tj  
- **Покупатель**: +992921234567 / buyer@autoauction.tj

### Полезные команды
```bash
# Статус сервисов
sudo systemctl status autobid-full
sudo systemctl status nginx
sudo systemctl status postgresql

# Просмотр логов
sudo journalctl -u autobid-full -f
sudo tail -f /var/log/nginx/autobid.access.log

# Управление сервисом
sudo systemctl restart autobid-full
sudo systemctl stop autobid-full
sudo systemctl start autobid-full

# Проверка базы данных
sudo -u postgres psql -d autobid_db -c "SELECT COUNT(*) FROM users;"
```

### Настройка SMS (опционально)
Отредактируйте `/var/www/autobid/.env`:
```bash
SMS_API_URL=https://oson.tj/smsservice.php
SMS_USERNAME=ваш_логин
SMS_PASSWORD=ваш_пароль
```

## Проверка работоспособности

1. **Главная страница**: `curl -I http://188.166.61.86/`
2. **API здоровья**: `curl http://188.166.61.86/api/health`
3. **База данных**: Проверка подключения через админку
4. **WebSocket**: Откройте консоль браузера для проверки соединения

## Следующие шаги

- ✅ **Домен**: Настроить DNS для autobid.tj
- ✅ **SSL**: Установить Let's Encrypt сертификат  
- ✅ **SMS**: Настроить SMS провайдера OSON
- ✅ **Мониторинг**: Добавить системы мониторинга
- ✅ **Резервное копирование**: Настроить автоматические бэкапы

---
*Развертывание готово! AutoBid.TJ теперь полностью функционирует на production сервере.*