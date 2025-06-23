# NocoDB Quick Start для AutoBid - Пошаговая настройка

## Шаг 1: Создание проекта (5 минут)

### 1.1 Подключение к базе данных
```bash
# Данные подключения к PostgreSQL
Host: ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
SSL: Required
```

### 1.2 Импорт существующих таблиц
NocoDB автоматически обнаружит таблицы:
- users (пользователи)
- car_listings (объявления)
- bids (ставки)
- notifications (уведомления)
- favorites (избранное)
- car_alerts (оповещения о машинах)
- banners (баннеры)
- documents (документы)

## Шаг 2: Настройка представлений таблиц (10 минут)

### 2.1 Таблица Users - Управление пользователями
**Основное представление:**
```
Столбцы: id, username, phone_number, full_name, is_active, role, created_at
Сортировка: created_at DESC
Фильтр: Все пользователи
```

**Представление "Неактивные пользователи":**
```
Фильтр: is_active = false
Сортировка: created_at DESC
```

**Представление "Новые регистрации":**
```
Фильтр: created_at >= last 7 days
Сортировка: created_at DESC
```

### 2.2 Таблица Car Listings - Модерация объявлений
**Основное представление:**
```
Столбцы: id, lot_number, make, model, year, starting_price, current_bid, status, created_at
Сортировка: created_at DESC
Группировка: status
```

**Представление "На модерации":**
```
Фильтр: status = 'pending'
Сортировка: created_at ASC (старые первыми)
```

**Представление "Активные аукционы":**
```
Фильтр: status = 'active'
Сортировка: auction_end_time ASC
```

### 2.3 Таблица Bids - Мониторинг ставок
**Основное представление:**
```
Столбцы: id, listing_id, bidder_id, amount, created_at
Сортировка: created_at DESC
Связи: 
- bidder_id → users.username
- listing_id → car_listings.lot_number
```

## Шаг 3: Создание дашборда (15 минут)

### 3.1 Карточки статистики
Создайте представления с SQL запросами:

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

### 3.2 Графики (Charts)
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

**Объявления по статусам:**
```sql
SELECT 
  status, 
  COUNT(*) as count 
FROM car_listings 
GROUP BY status;
```

**Топ марок автомобилей:**
```sql
SELECT 
  make, 
  COUNT(*) as count,
  AVG(CAST(COALESCE(current_bid, starting_price) as decimal)) as avg_price
FROM car_listings 
WHERE status IN ('active', 'ended')
GROUP BY make 
ORDER BY count DESC 
LIMIT 10;
```

## Шаг 4: Настройка форм редактирования (10 минут)

### 4.1 Форма Users
**Редактируемые поля:**
- full_name (Полное имя)
- is_active (Активен) - Switch/Toggle
- role (Роль) - Select: buyer, seller, admin

**Поля только для чтения:**
- id, username, phone_number, created_at

### 4.2 Форма Car Listings
**Редактируемые поля:**
- status (Статус) - Select: pending, active, ended, rejected
- starting_price (Стартовая цена)
- current_bid (Текущая ставка)
- auction_duration (Длительность аукциона)

**Поля только для чтения:**
- id, seller_id, make, model, year, created_at

### 4.3 Цветовое кодирование
**Статусы объявлений:**
- pending: #f59e0b (оранжевый)
- active: #10b981 (зеленый)
- ended: #6b7280 (серый)
- rejected: #ef4444 (красный)

**Статусы пользователей:**
- is_active = true: #10b981 (зеленый)
- is_active = false: #ef4444 (красный)

## Шаг 5: Быстрые действия (5 минут)

### 5.1 Кнопки для объявлений
**Одобрить объявление:**
```javascript
// Изменить status на 'active'
// Установить auction_start_time = NOW()
```

**Отклонить объявление:**
```javascript
// Изменить status на 'rejected'
```

### 5.2 Кнопки для пользователей
**Активировать пользователя:**
```javascript
// Изменить is_active на true
```

**Деактивировать пользователя:**
```javascript
// Изменить is_active на false
```

## Шаг 6: Настройка доступов (5 минут)

### 6.1 Роли NocoDB
**Super Admin:**
- Полный доступ ко всем таблицам
- Изменение структуры базы

**Moderator:**
- Чтение: все таблицы
- Редактирование: car_listings.status, users.is_active
- Создание: notifications

**Viewer:**
- Только чтение всех данных
- Доступ к дашбордам

## Шаг 7: Готовые фильтры и поиск (5 минут)

### 7.1 Предустановленные фильтры
**Для пользователей:**
- Активные пользователи: is_active = true
- Продавцы: role = 'seller'
- Покупатели: role = 'buyer'
- Новички: created_at >= last 7 days

**Для объявлений:**
- На модерации: status = 'pending'
- Активные: status = 'active'
- Завершенные: status = 'ended'
- Дорогие авто: starting_price > 50000

### 7.2 Поиск
**Поиск пользователей:**
- По username
- По phone_number  
- По full_name

**Поиск объявлений:**
- По make + model
- По lot_number
- По price range

## Шаг 8: Мониторинг и отчеты (10 минут)

### 8.1 Ежедневные представления
**Утренний чек-лист модератора:**
```sql
-- Новые объявления за сутки
SELECT COUNT(*) FROM car_listings 
WHERE status = 'pending' 
  AND created_at >= CURRENT_DATE - INTERVAL '1 day';

-- Новые пользователи для активации
SELECT COUNT(*) FROM users 
WHERE is_active = false 
  AND created_at >= CURRENT_DATE - INTERVAL '1 day';
```

**Вечерняя статистика:**
```sql
-- Продажи за день
SELECT 
  COUNT(*) as sales_count,
  SUM(CAST(current_bid as decimal)) as total_revenue
FROM car_listings 
WHERE status = 'ended' 
  AND auction_end_time >= CURRENT_DATE;

-- Активность ставок
SELECT COUNT(*) as bids_today 
FROM bids 
WHERE created_at >= CURRENT_DATE;
```

### 8.2 Еженедельные отчеты
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

**Популярные категории:**
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

## Готовые шаблоны для копирования

### Конфигурация подключения
```json
{
  "client": "postgresql",
  "connection": {
    "host": "ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech",
    "port": 5432,
    "database": "neondb",
    "user": "neondb_owner",
    "ssl": {"require": true}
  }
}
```

### Экспорт/импорт представлений
После настройки всех представлений экспортируйте конфигурацию для быстрого развертывания на других инстансах.

---

## Результат настройки

После выполнения всех шагов получите:
- Полноценную админку с интуитивным интерфейсом
- Дашборд с ключевыми метриками в реальном времени
- Систему модерации объявлений одним кликом
- Управление пользователями с фильтрацией
- Мониторинг ставок и активности
- Готовые отчеты для анализа бизнеса

Время настройки: 60-70 минут
Требования: доступ к NocoDB и данные подключения к PostgreSQL