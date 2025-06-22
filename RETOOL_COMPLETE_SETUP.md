# AutoBid.tj - Полная настройка Retool админ-панели

## Шаг 1: Создание аккаунта и подключение БД

### 1.1 Регистрация
1. Перейдите на https://retool.com
2. Создайте бесплатный аккаунт
3. Выберите "Build internal tools"

### 1.2 Подключение PostgreSQL
1. В Retool нажмите "Resources" → "Create new"
2. Выберите "PostgreSQL"
3. Введите данные подключения:
   - **Host:** ваш_хост_postgresql
   - **Port:** 5432
   - **Database name:** имя_базы_данных
   - **Username:** postgres
   - **Password:** ваш_пароль
4. Нажмите "Test connection" → "Create resource"

### 1.3 Проверка подключения
Выполните тестовый запрос:
```sql
SELECT COUNT(*) as total_users FROM users;
```

## Шаг 2: Создание основного приложения

### 2.1 Новое приложение
1. Нажмите "Create" → "App"
2. Название: "AutoBid Admin Panel"
3. Выберите "Blank app"

### 2.2 Структура приложения
Создадим 4 основные вкладки:
- Dashboard (Дашборд)
- Users (Пользователи) 
- Listings (Объявления)
- Analytics (Аналитика)

## Шаг 3: Настройка запросов к базе данных

### 3.1 Запрос статистики (getStats)
```sql
SELECT 
  (SELECT COUNT(*) FROM car_listings WHERE status = 'pending') as pending_listings,
  (SELECT COUNT(*) FROM car_listings WHERE status = 'active') as active_auctions,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE is_active = false) as banned_users,
  (SELECT COUNT(*) FROM bids WHERE created_at >= CURRENT_DATE) as todays_bids,
  (SELECT SUM(CAST(current_bid as decimal)) FROM car_listings WHERE status = 'ended' AND current_bid IS NOT NULL) as total_sales
```

### 3.2 Запрос пользователей (getUsers)
```sql
SELECT 
  id,
  username,
  email,
  full_name,
  role,
  is_active,
  created_at,
  (SELECT COUNT(*) FROM car_listings WHERE seller_id = users.id) as listings_count,
  (SELECT COUNT(*) FROM bids WHERE bidder_id = users.id) as bids_count
FROM users 
ORDER BY created_at DESC
```

### 3.3 Запрос объявлений на модерации (getPendingListings)
```sql
SELECT 
  cl.id,
  cl.lot_number,
  cl.make,
  cl.model,
  cl.year,
  cl.mileage,
  cl.starting_price,
  cl.description,
  cl.status,
  cl.created_at,
  u.username as seller_name,
  u.email as seller_email
FROM car_listings cl
JOIN users u ON cl.seller_id = u.id
WHERE cl.status = 'pending'
ORDER BY cl.created_at ASC
```

### 3.4 Запрос всех объявлений (getAllListings)
```sql
SELECT 
  cl.id,
  cl.lot_number,
  cl.make,
  cl.model,
  cl.year,
  cl.starting_price,
  cl.current_bid,
  cl.status,
  cl.created_at,
  cl.auction_end_time,
  u.username as seller_name,
  (SELECT COUNT(*) FROM bids WHERE listing_id = cl.id) as bids_count
FROM car_listings cl
JOIN users u ON cl.seller_id = u.id
ORDER BY cl.created_at DESC
```

### 3.5 Обновление статуса пользователя (updateUserStatus)
```sql
UPDATE users 
SET is_active = {{ !usersTable.selectedRow.is_active }}
WHERE id = {{ usersTable.selectedRow.id }}
```

### 3.6 Одобрение объявления (approveListing)
```sql
UPDATE car_listings 
SET status = 'active',
    auction_start_time = NOW(),
    auction_end_time = NOW() + INTERVAL '{{ pendingListingsTable.selectedRow.auction_duration || 72 }} hours'
WHERE id = {{ pendingListingsTable.selectedRow.id }}
```

### 3.7 Отклонение объявления (rejectListing)
```sql
UPDATE car_listings 
SET status = 'rejected'
WHERE id = {{ pendingListingsTable.selectedRow.id }}
```

## Шаг 4: Создание интерфейса

### 4.1 Dashboard (Главная страница)

#### Статистические карточки
Добавьте 6 компонентов "Statistic":

1. **Ожидают модерации**
   - Значение: `{{ getStats.data[0].pending_listings }}`
   - Цвет: Orange

2. **Активные аукционы** 
   - Значение: `{{ getStats.data[0].active_auctions }}`
   - Цвет: Green

3. **Всего пользователей**
   - Значение: `{{ getStats.data[0].total_users }}`
   - Цвет: Blue

4. **Заблокированные**
   - Значение: `{{ getStats.data[0].banned_users }}`
   - Цвет: Red

5. **Ставки сегодня**
   - Значение: `{{ getStats.data[0].todays_bids }}`
   - Цвет: Purple

6. **Общий объем продаж**
   - Значение: `${{ (getStats.data[0].total_sales || 0).toLocaleString() }}`
   - Цвет: Green

#### Быстрые действия
Добавьте кнопки:
- "Обновить статистику" → Trigger: getStats
- "Модерация объявлений" → Open modal: moderationModal

### 4.2 Users (Управление пользователями)

#### Таблица пользователей
Компонент "Table":
```javascript
{
  data: {{ getUsers.data }},
  columns: [
    { key: "id", label: "ID" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "full_name", label: "Имя" },
    { 
      key: "is_active", 
      label: "Статус",
      render: (value) => value ? "Активен" : "Заблокирован"
    },
    { key: "role", label: "Роль" },
    { key: "listings_count", label: "Объявлений" },
    { key: "bids_count", label: "Ставок" },
    { key: "created_at", label: "Регистрация", type: "datetime" }
  ]
}
```

#### Кнопки управления
1. **Переключить статус**
   - Текст: `{{ usersTable.selectedRow ? (usersTable.selectedRow.is_active ? "Заблокировать" : "Разблокировать") : "Выберите пользователя" }}`
   - Цвет: `{{ usersTable.selectedRow?.is_active ? "red" : "green" }}`
   - Disabled: `{{ !usersTable.selectedRow }}`
   - onClick: Trigger updateUserStatus

2. **Обновить список**
   - onClick: Trigger getUsers

### 4.3 Listings (Модерация объявлений)

#### Таблица ожидающих модерации
```javascript
{
  data: {{ getPendingListings.data }},
  columns: [
    { key: "lot_number", label: "Лот" },
    { key: "make", label: "Марка" },
    { key: "model", label: "Модель" },
    { key: "year", label: "Год" },
    { key: "starting_price", label: "Цена", render: (value) => `$${value}` },
    { key: "seller_name", label: "Продавец" },
    { key: "created_at", label: "Создано", type: "datetime" }
  ]
}
```

#### Кнопки модерации
1. **Одобрить**
   - Цвет: Green
   - onClick: Trigger approveListing

2. **Отклонить**  
   - Цвет: Red
   - onClick: Trigger rejectListing

3. **Просмотр деталей**
   - onClick: Open modal с полной информацией

#### Таблица всех объявлений
```javascript
{
  data: {{ getAllListings.data }},
  columns: [
    { key: "lot_number", label: "Лот" },
    { key: "make", label: "Марка" },
    { key: "model", label: "Модель" },
    { 
      key: "status", 
      label: "Статус",
      render: (value) => {
        const colors = {
          pending: "orange",
          active: "green", 
          ended: "gray",
          rejected: "red"
        };
        return `<span style="color: ${colors[value]}">${value}</span>`;
      }
    },
    { key: "current_bid", label: "Текущая ставка", render: (value) => value ? `$${value}` : "Нет ставок" },
    { key: "bids_count", label: "Ставок" }
  ]
}
```

### 4.4 Analytics (Аналитика)

#### График регистраций по дням
Компонент "Chart":
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as registrations
FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date
```

#### График продаж по дням  
```sql
SELECT 
  DATE(auction_end_time) as date,
  COUNT(*) as sales,
  SUM(CAST(current_bid as decimal)) as revenue
FROM car_listings 
WHERE status = 'ended' 
  AND current_bid IS NOT NULL
  AND auction_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(auction_end_time)
ORDER BY date
```

#### Топ марок автомобилей
```sql
SELECT 
  make,
  COUNT(*) as count,
  AVG(CAST(current_bid as decimal)) as avg_price
FROM car_listings 
WHERE status IN ('active', 'ended')
GROUP BY make
ORDER BY count DESC
LIMIT 10
```

## Шаг 5: Настройка автообновления

### 5.1 Автоматическое обновление данных
Для каждого запроса установите:
- **Run query on page load:** true
- **Auto-refresh:** каждые 30 секунд для критичных данных

### 5.2 Триггеры обновления
После успешного выполнения действий (одобрение, блокировка):
1. Trigger соответствующий запрос обновления
2. Показать уведомление об успехе
3. Обновить статистику

## Шаг 6: Настройка уведомлений

### 6.1 Success notifications
```javascript
// После успешного действия
utils.showNotification({
  title: "Успешно",
  description: "Действие выполнено",
  type: "success"
});
```

### 6.2 Error handling
```javascript
// При ошибке
utils.showNotification({
  title: "Ошибка", 
  description: query.error,
  type: "error"
});
```

## Шаг 7: Безопасность и доступы

### 7.1 Настройка ролей
1. В настройках приложения → "Permissions"
2. Создайте группу "Admins"
3. Ограничьте доступ только для администраторов

### 7.2 Логирование действий
Добавьте запрос для логирования:
```sql
INSERT INTO admin_logs (admin_email, action, target_id, created_at)
VALUES ({{ current_user.email }}, '{{ action_type }}', {{ target_id }}, NOW())
```

## Шаг 8: Мобильная версия

### 8.1 Responsive design
- Настройте адаптивную сетку
- Оптимизируйте таблицы для мобильных
- Добавьте swipe actions

### 8.2 Мобильное приложение
Retool автоматически создает мобильную версию, доступную через браузер на телефоне.

## Завершение настройки

После выполнения всех шагов у вас будет:
- ✅ Полноценная админ-панель
- ✅ Модерация объявлений
- ✅ Управление пользователями  
- ✅ Аналитика и статистика
- ✅ Мобильная версия
- ✅ Автообновление данных
- ✅ Безопасный доступ

**Время настройки:** 30-45 минут
**Результат:** Профессиональная админ-панель, независимая от основного приложения