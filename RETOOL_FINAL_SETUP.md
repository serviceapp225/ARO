# Финальная настройка Retool Admin для AutoAuction

## Шаг 1: Создание Resource в Retool

1. Откройте Retool и создайте новый App
2. Перейдите в Resources → Create New → REST API
3. Заполните настройки:
   - **Name**: `AutoAuction API`
   - **Base URL**: `https://your-repl-name.replit.app`
   - **Headers**:
     ```
     Content-Type: application/json
     x-admin-key: retool-admin-key-2024
     ```

## Шаг 2: Создание основных Query

### getUsersQuery
- **Resource**: AutoAuction API  
- **Action type**: GET
- **URL path**: `/api/admin/users`
- **Run automatically**: ✓

### getStatsQuery  
- **Resource**: AutoAuction API
- **Action type**: GET  
- **URL path**: `/api/admin/stats`
- **Run automatically**: ✓

### getListingsQuery
- **Resource**: AutoAuction API
- **Action type**: GET
- **URL path**: `/api/admin/listings`
- **URL params**: `status={{ statusFilter.value || "pending" }}&limit=100`
- **Run automatically**: ✓

## Шаг 3: Настройка компонентов

### Для таблицы пользователей в Retool:

1. Перетащите Table component
2. **Data source**: `{{ getUsersQuery.data }}`
3. В верхней таблице где сейчас "No rows found" установите этот data source

### Для статистики:

1. Добавьте 4 Stat component
2. Настройте значения:
   - **Pending**: `{{ getStatsQuery.data.pendingListings }}`
   - **Active**: `{{ getStatsQuery.data.activeAuctions }}`  
   - **Users**: `{{ getStatsQuery.data.totalUsers }}`
   - **Banned**: `{{ getStatsQuery.data.bannedUsers }}`

### Для кнопок управления пользователями:

1. Создайте Query `updateUserStatus`:
   - **URL path**: `/api/admin/users/{{ usersTable.selectedRow.id }}/status`
   - **Action type**: PATCH
   - **Body**: `{"isActive": {{ !usersTable.selectedRow.isActive }}}`

2. Добавьте Button component:
   - **Text**: `{{ usersTable.selectedRow?.isActive ? "Деактивировать" : "Активировать" }}`
   - **Disabled**: `{{ !usersTable.selectedRow }}`
   - **Event handler**: Trigger updateUserStatus query

## Шаг 4: Настройка модерации объявлений

### Создайте Query для одобрения:
```
approveListingQuery:
- URL path: /api/listings/{{ listingsTable.selectedRow.id }}/status  
- Method: PATCH
- Body: {"status": "active"}
```

### Создайте Query для отклонения:
```
rejectListingQuery:
- URL path: /api/listings/{{ listingsTable.selectedRow.id }}/status
- Method: PATCH  
- Body: {"status": "rejected"}
```

## Шаг 5: Тестирование

Протестируйте каждую функцию:

1. **Просмотр пользователей** - таблица должна загрузиться с данными
2. **Статистика** - числа должны отображаться корректно  
3. **Модерация объявлений** - кнопки Approve/Reject должны работать
4. **Активация пользователей** - переключение статуса должно работать

## URL для тестирования

Ваше приложение доступно по адресу в Replit. Все эндпоинты протестированы и работают:

- ✅ `/api/admin/users` - 4 пользователя  
- ✅ `/api/admin/stats` - 1 pending, 15 active, 4 users, 0 banned
- ✅ `/api/admin/listings` - полные данные объявлений с информацией о продавцах
- ✅ Authentication через `x-admin-key` заголовок

## Автоматическое обновление

Добавьте JavaScript Query для автообновления:

```javascript
// autoRefreshQuery - Run on page load
if (window.refreshInterval) clearInterval(window.refreshInterval);

window.refreshInterval = setInterval(() => {
  getUsersQuery.trigger();
  getStatsQuery.trigger(); 
  getListingsQuery.trigger();
}, 30000);

return "Auto-refresh enabled";
```

Админ-панель готова к использованию! Все необходимые эндпоинты созданы и протестированы.