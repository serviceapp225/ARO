# AutoBid AdminPanel - Запуск одним кликом

## Мгновенное подключение к NocoDB

### 1. Откройте NocoDB
```
https://app.nocodb.com/
```

### 2. Создайте проект с готовыми настройками
Скопируйте и вставьте эти данные:

```
Project Name: AutoBid Admin
Database Type: PostgreSQL
Host: ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_u6DqeO4wSMQU
SSL: require
```

### 3. Результат через 30 секунд
Автоматически импортируются все таблицы с данными:
- users (4 пользователя)
- car_listings (16 объявлений)
- bids (180+ ставок)
- notifications (уведомления)
- favorites, car_alerts, banners, documents

## Готовые webhook для автоматизации

### Скопируйте эти webhook URLs в NocoDB:

**Модерация объявлений:**
```
https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-approved
https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-rejected
```

**Управление пользователями:**
```
https://task-tracker-serviceapp225.replit.app/api/webhooks/user-activated
https://task-tracker-serviceapp225.replit.app/api/webhooks/user-deactivated
```

**Массовые уведомления:**
```
https://task-tracker-serviceapp225.replit.app/api/webhooks/broadcast-notification
```

**API статистики:**
```
https://task-tracker-serviceapp225.replit.app/api/admin/stats
```

## Мгновенная проверка работоспособности

Выполните эти команды для проверки:

```bash
# Статистика платформы
curl https://task-tracker-serviceapp225.replit.app/api/admin/stats

# Тест активации пользователя
curl -X POST https://task-tracker-serviceapp225.replit.app/api/webhooks/user-activated \
  -H "Content-Type: application/json" \
  -d '{"id": 31, "is_active": true}'

# Тест одобрения объявления
curl -X POST https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-approved \
  -H "Content-Type: application/json" \
  -d '{"id": 41, "status": "active"}'

# Тест массовых уведомлений
curl -X POST https://task-tracker-serviceapp225.replit.app/api/webhooks/broadcast-notification \
  -H "Content-Type: application/json" \
  -d '{"title": "Тест", "message": "Тестовое сообщение", "type": "system"}'
```

## Быстрые фильтры для создания в NocoDB

### Таблица users:
- **Неактивные:** is_active = false
- **Продавцы:** role = 'seller'
- **Новые (7 дней):** created_at >= last 7 days

### Таблица car_listings:
- **На модерации:** status = 'pending'
- **Активные:** status = 'active'
- **Отклоненные:** status = 'rejected'

### Таблица bids:
- **Сегодня:** created_at >= today
- **По сумме:** amount > 50000

## Готовые SQL запросы для дашборда

Скопируйте в NocoDB Dashboard:

```sql
-- Ожидающие модерации
SELECT COUNT(*) as count FROM car_listings WHERE status = 'pending';

-- Активные аукционы
SELECT COUNT(*) as count FROM car_listings WHERE status = 'active';

-- Всего пользователей
SELECT COUNT(*) as count FROM users;

-- Неактивные пользователи
SELECT COUNT(*) as count FROM users WHERE is_active = false;

-- Топ марок
SELECT make, COUNT(*) as count FROM car_listings GROUP BY make ORDER BY count DESC LIMIT 10;

-- Ставки за день
SELECT COUNT(*) as count FROM bids WHERE created_at >= CURRENT_DATE;
```

## Цветовая схема для статусов

### Для поля status в car_listings:
- pending: #F39C12 (оранжевый)
- active: #27AE60 (зеленый)
- ended: #95A5A6 (серый)
- rejected: #E74C3C (красный)

### Для поля is_active в users:
- true: #27AE60 (зеленый)
- false: #E74C3C (красный)

### Для поля role в users:
- buyer: #3498DB (синий)
- seller: #E67E22 (оранжевый)
- admin: #9B59B6 (фиолетовый)

## Готово к использованию

После выполнения этих шагов получите полноценную админку с:
- Живыми данными из базы AutoBid
- Автоматической модерацией через webhook
- Мониторингом всех операций
- Дашбордом с ключевыми метриками
- Управлением пользователями и объявлениями

Время настройки: 2-3 минуты
Сложность: копировать и вставить