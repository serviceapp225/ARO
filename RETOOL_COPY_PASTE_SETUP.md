# Копируй-Вставляй настройка Retool (5 минут)

## Шаг 1: Создайте 4 запроса по очереди

### Запрос 1: getStats
```
Name: getStats
Type: REST API  
URL: https://task-tracker-serviceapp225.replit.app/api/admin/stats
Method: GET
Headers: 
  x-admin-key: retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 2: getUsers
```
Name: getUsers
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/users  
Method: GET
Headers:
  x-admin-key: retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 3: getListings
```
Name: getListings
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/listings
Method: GET
Headers:
  x-admin-key: retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 4: getBids
```
Name: getBids
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/bids
Method: GET
Headers:
  x-admin-key: retool-admin-key-2024
Run when page loads: ✓
```

## Шаг 2: Добавьте компоненты на Dashboard

Перетащите 4 компонента **Text** и вставьте эти значения:

### Text 1 - Ожидающие объявления
```
{{getStats.data.pendingListings}} ожидающих объявлений
```

### Text 2 - Активные аукционы  
```
{{getStats.data.activeAuctions}} активных аукционов
```

### Text 3 - Всего пользователей
```
{{getStats.data.totalUsers}} пользователей зарегистрировано
```

### Text 4 - Заблокированные
```
{{getStats.data.bannedUsers}} заблокированных пользователей
```

## Шаг 3: Создайте вторую страницу "Пользователи"

1. Добавьте новую страницу в Retool
2. Перетащите компонент **Table**
3. В настройках таблицы Data source вставьте:
```
{{getUsers.data}}
```

## Шаг 4: Создайте третью страницу "Объявления"

1. Добавьте новую страницу
2. Добавьте **Table** с Data source:
```
{{getListings.data}}  
```

## Шаг 5: Создайте четвертую страницу "Ставки"

1. Добавьте новую страницу
2. Добавьте **Table** с Data source:
```
{{getBids.data}}
```

## Проверка работы

После создания всех запросов должны отображаться:
- **getStats:** {"pendingListings":"1","activeAuctions":"16","totalUsers":"4","bannedUsers":"0"}
- **getUsers:** 4 пользователя в таблице
- **getListings:** 17 объявлений (16 активных + 1 ожидающее)
- **getBids:** 2 ставки с информацией о покупателях

Вся админ-панель готова за 5 минут ручной настройки!