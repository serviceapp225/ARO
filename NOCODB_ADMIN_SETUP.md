# NocoDB Admin Setup для AutoBid

## 1. Создание проекта в NocoDB

### Подключение к базе данных
1. Откройте NocoDB веб-интерфейс
2. Создайте новый проект: "AutoBid Admin"
3. Выберите "Connect to external database"
4. Тип базы данных: PostgreSQL
5. Настройки подключения:
   ```
   Host: ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech
   Port: 5432
   Database: neondb
   Username: neondb_owner
   Password: [ваш пароль из DATABASE_URL]
   SSL: Required
   ```

## 2. Настройка таблиц и представлений

### Основные таблицы для управления:

#### 2.1 Таблица "users" - Управление пользователями
**Столбцы для отображения:**
- id (ID)
- username (Имя пользователя)
- phone_number (Телефон)
- full_name (Полное имя)
- is_active (Активен) - Boolean
- role (Роль)
- created_at (Дата регистрации)

**Настройки представления:**
- Сортировка: по created_at (убывание)
- Фильтры по умолчанию: показать активных и неактивных
- Группировка: по role

**Формы для редактирования:**
- Поля: full_name, is_active, role
- Только чтение: id, username, phone_number, created_at

#### 2.2 Таблица "car_listings" - Модерация объявлений
**Столбцы для отображения:**
- id (ID)
- lot_number (№ Лота)
- make (Марка)
- model (Модель)
- year (Год)
- starting_price (Стартовая цена)
- current_bid (Текущая ставка)
- status (Статус)
- seller_id (ID продавца)
- created_at (Дата создания)

**Настройки представления:**
- Сортировка: по created_at (убывание)
- Фильтры: по status (pending, active, ended, rejected)
- Цветовое кодирование status:
  - pending: оранжевый
  - active: зеленый
  - ended: серый
  - rejected: красный

**Формы для редактирования:**
- Основные поля: status, starting_price, auction_duration
- Только просмотр: make, model, year, description, photos

#### 2.3 Таблица "bids" - Мониторинг ставок
**Столбцы для отображения:**
- id (ID)
- listing_id (ID объявления)
- bidder_id (ID покупателя)
- amount (Сумма)
- created_at (Время ставки)

**Связи (Relations):**
- bidder_id → users.id (для отображения имени покупателя)
- listing_id → car_listings.id (для отображения авто)

#### 2.4 Таблица "notifications" - Управление уведомлениями
**Столбцы для отображения:**
- id (ID)
- user_id (Пользователь)
- type (Тип)
- title (Заголовок)
- message (Сообщение)
- is_read (Прочитано)
- created_at (Дата)

## 3. Создание дашборда статистики

### 3.1 Основные метрики (Views)
Создайте следующие представления:

**Ожидающие модерации:**
```sql
SELECT COUNT(*) as pending_count 
FROM car_listings 
WHERE status = 'pending'
```

**Активные аукционы:**
```sql
SELECT COUNT(*) as active_count 
FROM car_listings 
WHERE status = 'active'
```

**Всего пользователей:**
```sql
SELECT COUNT(*) as total_users 
FROM users
```

**Неактивные пользователи:**
```sql
SELECT COUNT(*) as inactive_users 
FROM users 
WHERE is_active = false
```

### 3.2 Графики и аналитика
**Регистрации по дням (последние 30 дней):**
```sql
SELECT DATE(created_at) as date, COUNT(*) as registrations 
FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' 
GROUP BY DATE(created_at) 
ORDER BY date
```

**Продажи по дням:**
```sql
SELECT DATE(auction_end_time) as date, 
       COUNT(*) as sales,
       COALESCE(SUM(CAST(current_bid as decimal)), 0) as revenue
FROM car_listings 
WHERE status = 'ended' 
  AND current_bid IS NOT NULL 
  AND auction_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(auction_end_time) 
ORDER BY date
```

**Популярные марки:**
```sql
SELECT make, 
       COUNT(*) as count,
       COALESCE(AVG(CAST(current_bid as decimal)), 0) as avg_price
FROM car_listings 
WHERE status IN ('active', 'ended')
GROUP BY make 
ORDER BY count DESC 
LIMIT 10
```

## 4. Настройка ролей и доступов

### 4.1 Роли пользователей NocoDB
**Администратор:**
- Полный доступ ко всем таблицам
- Возможность изменения структуры
- Доступ к настройкам проекта

**Модератор:**
- Чтение всех таблиц
- Редактирование: car_listings.status, users.is_active
- Создание уведомлений

**Аналитик:**
- Только чтение всех данных
- Доступ к представлениям и дашбордам

### 4.2 Настройка полей
**Обязательные поля для редактирования:**
- users.is_active (для активации/деактивации)
- car_listings.status (для модерации)
- notifications (для создания уведомлений)

**Поля только для чтения:**
- Все ID поля
- created_at поля
- phone_number, username

## 5. Автоматизация и хуки

### 5.1 Webhooks для интеграции
Настройте webhooks для следующих событий:

**При одобрении объявления:**
```javascript
// URL: https://your-domain.replit.app/api/webhooks/listing-approved
// Method: POST
// Trigger: car_listings.status = 'active'
```

**При деактивации пользователя:**
```javascript
// URL: https://your-domain.replit.app/api/webhooks/user-deactivated  
// Method: POST
// Trigger: users.is_active = false
```

### 5.2 Формулы для вычисляемых полей
**Статус аукциона (активен/завершен):**
```javascript
IF(auction_end_time < NOW(), 'Завершен', 'Активен')
```

**Время до завершения:**
```javascript
DATEDIFF(auction_end_time, NOW(), 'hours')
```

## 6. Быстрые действия

### 6.1 Кнопки действий
Создайте кнопки для частых операций:

**Одобрить объявление:**
- Изменить status на 'active'
- Установить auction_start_time = NOW()
- Вычислить auction_end_time

**Отклонить объявление:**
- Изменить status на 'rejected'
- Отправить уведомление продавцу

**Активировать пользователя:**
- Изменить is_active на true
- Отправить SMS подтверждение

## 7. Мониторинг и отчеты

### 7.1 Ежедневные отчеты
**Утренний отчет модератора:**
- Новые объявления на модерации
- Заявки на активацию пользователей
- Жалобы и проблемы

**Вечерний отчет аналитика:**
- Статистика продаж за день
- Новые регистрации
- Популярные категории авто

### 7.2 Еженедельные отчеты
- Топ продавцов по объему продаж
- Анализ конверсии посетителей
- Популярные ценовые сегменты

## 8. Резервное копирование

### 8.1 Настройка бэкапов
- Ежедневное резервное копирование в 2:00 UTC
- Хранение бэкапов: 30 дней
- Проверка целостности: еженедельно

### 8.2 Экспорт данных
- CSV экспорт для отчетности
- JSON экспорт для миграции
- Excel формат для бухгалтерии

## 9. Безопасность

### 9.1 Настройки доступа
- Двухфакторная аутентификация для всех админов
- IP whitelist для доступа к админке
- Логирование всех действий

### 9.2 Аудит действий
- Лог изменений статусов объявлений
- История активации/деактивации пользователей
- Отчеты по административным действиям

---

## Готовая конфигурация

После настройки по этому руководству у вас будет:
- Полноценная админка для управления AutoBid
- Дашборд с ключевыми метриками
- Инструменты модерации объявлений
- Система управления пользователями
- Мониторинг ставок и транзакций
- Отчетность и аналитика

Для запуска потребуется только доступ к NocoDB и данные подключения к вашей PostgreSQL базе.