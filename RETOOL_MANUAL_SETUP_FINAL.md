# Ручная настройка Retool Admin Panel (10 минут)

## Шаг 1: Создайте 4 запроса подряд

### Запрос 1: getStats
```
Type: REST API
Name: getStats
URL: https://task-tracker-serviceapp225.replit.app/api/admin/stats
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 2: getUsers
```
Type: REST API
Name: getUsers
URL: https://task-tracker-serviceapp225.replit.app/api/admin/users
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 3: getListings
```
Type: REST API
Name: getListings
URL: https://task-tracker-serviceapp225.replit.app/api/admin/listings
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 4: getBids
```
Type: REST API
Name: getBids
URL: https://task-tracker-serviceapp225.replit.app/api/admin/bids
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

## Шаг 2: Добавьте компоненты на главную страницу

Перетащите 4 компонента **Text** и вставьте эти значения:

### Text 1
```
Ожидающие: {{getStats.data.pendingListings}}
```

### Text 2
```
Активные: {{getStats.data.activeAuctions}}
```

### Text 3
```
Пользователи: {{getStats.data.totalUsers}}
```

### Text 4
```
Заблокированные: {{getStats.data.bannedUsers}}
```

## Шаг 3: Создайте страницу "Пользователи"

1. Добавьте новую страницу
2. Перетащите компонент **Table**
3. В Data source введите: `{{getUsers.data}}`

## Шаг 4: Создайте страницу "Объявления"

1. Добавьте новую страницу
2. Перетащите компонент **Table**
3. В Data source введите: `{{getListings.data}}`

## Шаг 5: Создайте страницу "Ставки"

1. Добавьте новую страницу
2. Перетащите компонент **Table**
3. В Data source введите: `{{getBids.data}}`

## Проверка

После создания всех запросов вы должны увидеть:
- getStats: {"pendingListings":"1","activeAuctions":"16","totalUsers":"4","bannedUsers":"0"}
- getUsers: таблица с 4 пользователями
- getListings: таблица с 17 объявлениями
- getBids: таблица с 2 ставками

Готово! У вас есть рабочая админ-панель за 10 минут.