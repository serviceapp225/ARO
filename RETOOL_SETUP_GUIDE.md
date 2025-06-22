# Retool Setup Guide для AutoAuction Admin

## 1. Настройка подключения к API

### База данных (Resource)
1. В Retool создайте новый Resource типа "REST API"
2. **Base URL**: `https://your-repl-name.replit.app` 
3. **Headers**: 
   - `Content-Type`: `application/json`
   - `x-admin-key`: `retool-admin-key-2024`

## 2. Настройка таблицы пользователей

### Query для пользователей
```javascript
// Название: getUsersQuery
// Тип: REST API Query
// URL: {{your_api.baseUrl}}/api/admin/users
// Method: GET
// Headers: уже настроены в Resource
```

### Настройка Table component
1. **Data source**: `{{ getUsersQuery.data }}`
2. **Columns**:
   - `id`: ID (число)
   - `username`: Username (текст)
   - `email`: Email (текст) 
   - `fullName`: Full Name (текст)
   - `isActive`: Active (boolean с Toggle)
   - `role`: Role (текст)
   - `createdAt`: Created (дата)

### Кнопки действий для пользователей
```javascript
// Активировать пользователя
// Query: activateUser
// URL: {{your_api.baseUrl}}/api/admin/users/{{table1.selectedRow.id}}/status
// Method: PATCH  
// Body: {"isActive": true}

// Деактивировать пользователя
// Query: deactivateUser
// URL: {{your_api.baseUrl}}/api/admin/users/{{table1.selectedRow.id}}/status
// Method: PATCH
// Body: {"isActive": false}
```

## 3. Настройка таблицы объявлений

### Query для объявлений
```javascript
// Название: getListingsQuery
// URL: {{your_api.baseUrl}}/api/admin/listings
// Method: GET
// Query params: 
//   - status: pending (для модерации)
//   - limit: 100
```

### Настройка Table component для объявлений
1. **Data source**: `{{ getListingsQuery.data }}`
2. **Columns**:
   - `id`: ID
   - `lotNumber`: Lot Number
   - `make`: Make
   - `model`: Model  
   - `year`: Year
   - `startingPrice`: Starting Price
   - `currentBid`: Current Bid
   - `status`: Status
   - `seller.username`: Seller
   - `bidCount`: Bids

### Кнопки модерации
```javascript
// Одобрить объявление
// Query: approveListing
// URL: {{your_api.baseUrl}}/api/listings/{{table2.selectedRow.id}}/status
// Method: PATCH
// Body: {"status": "active"}

// Отклонить объявление  
// Query: rejectListing
// URL: {{your_api.baseUrl}}/api/listings/{{table2.selectedRow.id}}/status
// Method: PATCH
// Body: {"status": "rejected"}
```

## 4. Дашборд со статистикой

### Query для статистики
```javascript
// Название: getStatsQuery
// URL: {{your_api.baseUrl}}/api/admin/stats
// Method: GET
```

### Stat Components
1. **Pending Listings**: `{{ getStatsQuery.data.pendingListings }}`
2. **Active Auctions**: `{{ getStatsQuery.data.activeAuctions }}`
3. **Total Users**: `{{ getStatsQuery.data.totalUsers }}`
4. **Banned Users**: `{{ getStatsQuery.data.bannedUsers }}`

## 5. Управление баннерами

### Query для баннеров
```javascript
// Получить баннеры
// Название: getBannersQuery
// URL: {{your_api.baseUrl}}/api/banners
// Method: GET

// Создать баннер
// Название: createBannerQuery
// URL: {{your_api.baseUrl}}/api/admin/banners
// Method: POST
// Body: {
//   "title": "{{titleInput.value}}",
//   "description": "{{descInput.value}}",
//   "imageUrl": "{{imageInput.value}}",
//   "linkUrl": "{{linkInput.value}}",
//   "position": "{{positionSelect.value}}",
//   "isActive": {{activeToggle.value}}
// }

// Обновить баннер
// Название: updateBannerQuery
// URL: {{your_api.baseUrl}}/api/admin/banners/{{bannersTable.selectedRow.id}}
// Method: PUT
// Body: {
//   "isActive": {{!bannersTable.selectedRow.isActive}}
// }
```

## 6. Просмотр ставок

### Query для ставок
```javascript
// Название: getBidsQuery
// URL: {{your_api.baseUrl}}/api/admin/bids
// Method: GET
// Query params:
//   - limit: 50
//   - listingId: {{listingIdInput.value}} (опционально)
```

### Table для ставок
1. **Data source**: `{{ getBidsQuery.data }}`
2. **Columns**:
   - `id`: Bid ID
   - `amount`: Amount
   - `bidTime`: Bid Time
   - `bidder.username`: Bidder
   - `bidder.email`: Email
   - `listing.make`: Car Make
   - `listing.model`: Car Model
   - `listing.lotNumber`: Lot Number

## 7. Автоматическое обновление

### JavaScript для автообновления
```javascript
// В App settings > Events > Page Load
setInterval(() => {
  getUsersQuery.trigger();
  getStatsQuery.trigger();
  getListingsQuery.trigger();
}, 30000); // Обновление каждые 30 секунд
```

## 8. Фильтры и поиск

### Фильтр по статусу объявлений
```javascript
// Select component: statusFilter
// Options: [
//   {label: "All", value: ""},
//   {label: "Pending", value: "pending"},
//   {label: "Active", value: "active"},
//   {label: "Ended", value: "ended"},
//   {label: "Rejected", value: "rejected"}
// ]

// В Query getListingsQuery добавить:
// Query params: status = {{statusFilter.value}}
```

### Поиск пользователей
```javascript
// Text Input: userSearchInput
// В таблице пользователей Filter:
{{ 
  getUsersQuery.data.filter(user => 
    user.username.toLowerCase().includes(userSearchInput.value.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchInput.value.toLowerCase())
  )
}}
```

## 9. Валидация и обработка ошибок

### Error handling для queries
```javascript
// В каждом Query в разделе "Event handlers":
// On failure:
notification.trigger({
  type: "error",
  title: "Error", 
  description: "{{ query1.error }}"
});

// On success:
notification.trigger({
  type: "success",
  title: "Success",
  description: "Operation completed successfully"
});
```

## 10. Безопасность

### Проверка прав доступа
- API уже защищен middleware `adminAuth`
- Проверяет заголовок `x-admin-key`
- Возвращает 403 при неверном ключе

### Рекомендации
1. Используйте переменные среды для хранения API ключей
2. Настройте роли пользователей в Retool
3. Логируйте все админские действия

## Готовые URL для тестирования

- Пользователи: `GET /api/admin/users`
- Статистика: `GET /api/admin/stats` 
- Объявления: `GET /api/admin/listings?status=pending`
- Ставки: `GET /api/admin/bids?limit=50`
- Баннеры: `GET /api/banners`

Все эндпоинты требуют заголовок `x-admin-key: retool-admin-key-2024`