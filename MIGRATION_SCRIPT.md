# Скрипт миграции данных в DigitalOcean PostgreSQL

## Подготовка к миграции

### 1. Экспорт текущих данных
```bash
# Создать дамп текущей базы данных
pg_dump $CURRENT_DATABASE_URL > autobid_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Создание таблиц в новой базе
```bash
# Подключиться к новой DigitalOcean базе и создать структуру
psql "postgresql://username:password@your-db-host:25060/autobid_production?sslmode=require" < database-schema.sql
```

### 3. Миграция данных
```bash
# Импорт данных в новую базу
psql "postgresql://username:password@your-db-host:25060/autobid_production?sslmode=require" < autobid_backup_YYYYMMDD_HHMMSS.sql
```

### 4. Миграция изображений в DigitalOcean Spaces

Использовать встроенный скрипт миграции:
```bash
# Установить переменные окружения для Spaces
export SPACES_KEY="your-spaces-access-key"
export SPACES_SECRET="your-spaces-secret-key"  
export SPACES_BUCKET="autobid-storage"
export SPACES_ENDPOINT="ams3.digitaloceanspaces.com"
export SPACES_REGION="ams3"

# Запустить миграцию изображений
npm run migrate-images
```

### 5. Проверка миграции

#### База данных:
```sql
-- Проверить количество записей в основных таблицах
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'car_listings', COUNT(*) FROM car_listings  
UNION ALL
SELECT 'bids', COUNT(*) FROM bids
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
```

#### Изображения:
```bash
# Проверить загруженные файлы в Spaces
# Через DigitalOcean Dashboard → Spaces → autobid-storage
# Должны появиться папки: listings/, users/, banners/
```

## Команды для быстрой миграции

### Полная миграция одной командой:
```bash
#!/bin/bash
echo "🚀 Начало миграции AutoBid.TJ на DigitalOcean"

# 1. Создать бэкап
echo "📦 Создание бэкапа базы данных..."
BACKUP_FILE="autobid_backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE

# 2. Импорт в новую базу
echo "📥 Импорт данных в DigitalOcean PostgreSQL..."
psql "$DO_DATABASE_URL" < $BACKUP_FILE

# 3. Миграция изображений
echo "🖼️ Миграция изображений в DigitalOcean Spaces..."
npm run migrate-images

# 4. Проверка
echo "✅ Проверка миграции..."
psql "$DO_DATABASE_URL" -c "SELECT COUNT(*) as total_users FROM users;"
psql "$DO_DATABASE_URL" -c "SELECT COUNT(*) as total_listings FROM car_listings;"

echo "🎉 Миграция завершена!"
```

## Важные замечания

- ⚠️ **Время простоя**: Миграция займет 2-4 часа
- 💾 **Бэкап**: Создать полный бэкап перед началом
- 🔄 **Откат**: В случае проблем можно вернуться к текущей версии
- 📊 **Мониторинг**: Следить за логами App Platform во время миграции
- 🔗 **DNS**: После успешной миграции обновить DNS записи