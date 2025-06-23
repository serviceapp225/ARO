# NocoDB Complete Setup - Полная админка AutoBid

## 🚀 Быстрый старт (5 минут)

### 1. Подключение к базе данных
```
URL: https://app.nocodb.com/
Создать проект: AutoBid Admin
Тип: PostgreSQL External Database

Настройки подключения:
Host: ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_u6DqeO4wSMQU
SSL: require
```

### 2. Автоимпорт таблиц
NocoDB автоматически импортирует 8 таблиц:
- ✅ users (пользователи)
- ✅ car_listings (объявления автомобилей)
- ✅ bids (ставки на аукционах)
- ✅ notifications (уведомления)
- ✅ favorites (избранные объявления)
- ✅ car_alerts (оповещения о поиске)
- ✅ banners (рекламные баннеры)
- ✅ documents (документы и файлы)

## 📊 Дашборд с ключевыми метриками

### Виджеты статистики (добавить в Dashboard):

**Ожидающие модерации:**
```sql
SELECT COUNT(*) as count FROM car_listings WHERE status = 'pending';
```

**Активные аукционы:**
```sql
SELECT COUNT(*) as count FROM car_listings WHERE status = 'active';
```

**Всего пользователей:**
```sql
SELECT COUNT(*) as count FROM users;
```

**Неактивные пользователи:**
```sql
SELECT COUNT(*) as count FROM users WHERE is_active = false;
```

**API endpoint для проверки:** `GET /api/admin/stats`
```json
{
  "pendingListings": "1",
  "activeAuctions": "15", 
  "totalUsers": "4",
  "activeUsers": 4,
  "inactiveUsers": 0
}
```

## 🔧 Настройка основных представлений

### Таблица car_listings - Модерация объявлений

**Представление "На модерации":**
- Фильтр: status = 'pending'
- Столбцы: id, lot_number, make, model, year, starting_price, seller_id
- Сортировка: created_at ASC (старые первыми)
- Цвет: оранжевый (#f59e0b)

**Представление "Активные аукционы":**
- Фильтр: status = 'active'  
- Столбцы: id, lot_number, make, model, current_bid, auction_end_time
- Сортировка: auction_end_time ASC
- Цвет: зеленый (#10b981)

**Быстрые действия:**
- Кнопка "Одобрить" → status = 'active'
- Кнопка "Отклонить" → status = 'rejected'

### Таблица users - Управление пользователями

**Представление "Все пользователи":**
- Столбцы: id, username, phone_number, full_name, is_active, role
- Группировка: по role
- Цветовое кодирование is_active (зеленый/красный)

**Представление "Неактивные пользователи":**
- Фильтр: is_active = false
- Сортировка: created_at DESC

**Быстрые действия:**
- Кнопка "Активировать" → is_active = true
- Кнопка "Деактивировать" → is_active = false

### Таблица bids - Мониторинг ставок

**Представление "Все ставки":**
- Столбцы: id, listing_id, bidder_id, amount, created_at
- Связи: listing_id → car_listings.lot_number, bidder_id → users.username
- Сортировка: created_at DESC

## 🔗 Webhook интеграция

### Настройка Webhooks в NocoDB

**Webhook 1: Одобрение объявления**
- Таблица: car_listings
- Событие: After Update
- Условие: status = 'active'
- URL: `https://your-app.replit.app/api/webhooks/listing-approved`
- Payload:
```json
{
  "id": "{{id}}",
  "status": "{{status}}"
}
```

**Webhook 2: Отклонение объявления**  
- Таблица: car_listings
- Событие: After Update
- Условие: status = 'rejected'
- URL: `https://your-app.replit.app/api/webhooks/listing-rejected`
- Payload:
```json
{
  "id": "{{id}}",
  "status": "{{status}}",
  "reason": "{{rejection_reason}}"
}
```

**Webhook 3: Активация пользователя**
- Таблица: users
- Событие: After Update  
- Условие: is_active = true
- URL: `https://your-app.replit.app/api/webhooks/user-activated`
- Payload:
```json
{
  "id": "{{id}}",
  "is_active": "{{is_active}}"
}
```

**Webhook 4: Деактивация пользователя**
- Таблица: users
- Событие: After Update
- Условие: is_active = false  
- URL: `https://your-app.replit.app/api/webhooks/user-deactivated`
- Payload:
```json
{
  "id": "{{id}}",
  "is_active": "{{is_active}}",
  "reason": "{{deactivation_reason}}"
}
```

## 📈 Аналитические представления

### Еженедельные отчеты

**Топ продавцов:**
```sql
SELECT 
  u.username,
  u.full_name,
  COUNT(cl.id) as listings_count,
  SUM(CAST(COALESCE(cl.current_bid, cl.starting_price) as decimal)) as total_value
FROM users u
JOIN car_listings cl ON u.id = cl.seller_id
WHERE cl.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.username, u.full_name
ORDER BY total_value DESC
LIMIT 10;
```

**Популярные марки:**
```sql
SELECT 
  make,
  COUNT(*) as listings,
  AVG(CAST(starting_price as decimal)) as avg_start_price,
  AVG(CAST(COALESCE(current_bid, starting_price) as decimal)) as avg_final_price
FROM car_listings 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY make
ORDER BY listings DESC;
```

**Регистрации по дням:**
```sql
SELECT 
  DATE(created_at) as date, 
  COUNT(*) as registrations 
FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' 
GROUP BY DATE(created_at) 
ORDER BY date;
```

## 🔐 Настройка ролей доступа

### Роли пользователей NocoDB:

**Super Admin (Суперадмин):**
- Полный доступ ко всем таблицам
- Изменение структуры базы данных
- Настройка webhook и автоматизации

**Moderator (Модератор):**
- Чтение: все таблицы
- Редактирование: car_listings.status, users.is_active
- Создание: notifications

**Analyst (Аналитик):**
- Только чтение всех данных
- Доступ к дашбордам и отчетам
- Экспорт данных

## 🎯 Быстрые действия и автоматизация

### Кнопки быстрых действий:

**Для объявлений:**
1. "Одобрить объявление" - меняет status на 'active'
2. "Отклонить объявление" - меняет status на 'rejected'  
3. "Вернуть на модерацию" - меняет status на 'pending'

**Для пользователей:**
1. "Активировать пользователя" - is_active = true
2. "Деактивировать пользователя" - is_active = false
3. "Сделать продавцом" - role = 'seller'

### Автоматические правила:

**Правило 1: Автоодобрение проверенных продавцов**
- Условие: новое объявление от role = 'verified_seller'
- Действие: автоматически status = 'active'

**Правило 2: Деактивация неактивных пользователей**
- Условие: нет активности > 90 дней
- Действие: is_active = false

## 📊 Тестирование webhook (все работает!)

### Проверенные endpoints:

✅ **Статистика:** `GET /api/admin/stats`
```bash
curl -X GET "https://your-app.replit.app/api/admin/stats"
# Ответ: {"pendingListings":"1","activeAuctions":"15","totalUsers":"4","activeUsers":4}
```

✅ **Активация пользователя:** `POST /api/webhooks/user-activated`
```bash
curl -X POST "https://your-app.replit.app/api/webhooks/user-activated" \
  -H "Content-Type: application/json" \
  -d '{"id": 31, "is_active": true}'
# Ответ: {"success":true,"message":"User activated successfully"}
```

✅ **Одобрение объявления:** `POST /api/webhooks/listing-approved`
```bash
curl -X POST "https://your-app.replit.app/api/webhooks/listing-approved" \
  -H "Content-Type: application/json" \
  -d '{"id": 41, "status": "active"}'
# Ответ: {"success":true,"message":"Listing approved successfully"}
```

✅ **Массовые уведомления:** `POST /api/webhooks/broadcast-notification`
```bash
curl -X POST "https://your-app.replit.app/api/webhooks/broadcast-notification" \
  -H "Content-Type: application/json" \
  -d '{"title": "Техническое обслуживание", "message": "Завтра с 02:00 до 04:00 ТО", "type": "system"}'
# Ответ: {"success":true,"message":"Broadcast sent to 4 users"}
```

## 🎉 Результат полной настройки

После выполнения всех шагов получите:

### ✅ Полноценную админку с:
- Дашборд с ключевыми метриками в реальном времени
- Систему модерации объявлений одним кликом
- Управление пользователями с фильтрацией и группировкой
- Мониторинг ставок и активности аукционов
- Систему уведомлений и массовых рассылок

### ✅ Автоматизацию процессов:
- Webhook интеграция с приложением
- Автоматические уведомления пользователей
- Быстрые действия для модерации
- Готовые отчеты и аналитику

### ✅ Безопасность и контроль:
- Разграничение ролей доступа
- Логирование всех действий
- Контроль изменений через webhook

### 🕐 Время настройки: 30-45 минут
### 📋 Требования: доступ к NocoDB + данные подключения к PostgreSQL

**Админка готова к полноценному использованию для управления AutoBid платформой!**