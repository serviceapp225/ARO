# AutoBid Retool Admin Panel - Пошаговая настройка

## Этап 1: Подготовка Retool

1. Перейдите на https://retool.com и создайте аккаунт
2. Создайте новое приложение "AutoBid Admin Panel"
3. В настройках приложения добавьте переменные среды:
   - `API_BASE_URL`: `https://ваш-домен.replit.app`
   - `ADMIN_SECRET`: `retool-admin-key-2024`

## Этап 2: Настройка подключения к базе данных

1. В Retool перейдите в Resources → Add Resource
2. Выберите PostgreSQL
3. Введите параметры подключения из вашей Replit базы данных:
   - Host: адрес из DATABASE_URL
   - Port: 5432
   - Database name: из DATABASE_URL
   - Username: из DATABASE_URL  
   - Password: из DATABASE_URL
4. Протестируйте подключение

## Этап 3: Создание основных запросов (Queries)

### Запрос статистики:
```javascript
// Название: getStats
// Тип: REST API
// URL: {{API_BASE_URL}}/api/admin/stats
// Method: GET
// Headers: x-admin-key = {{ADMIN_SECRET}}
```

### Запрос пользователей:
```javascript
// Название: getUsers  
// Тип: REST API
// URL: {{API_BASE_URL}}/api/admin/users
// Method: GET
// Headers: x-admin-key = {{ADMIN_SECRET}}
// Transformer:
return data.map(user => ({
  ...user,
  status: user.isActive ? 'Активен' : 'Неактивен',
  created: new Date(user.createdAt).toLocaleDateString('ru-RU')
}));
```

### Запрос объявлений:
```javascript
// Название: getListings
// Тип: REST API  
// URL: {{API_BASE_URL}}/api/admin/listings
// Method: GET
// Headers: x-admin-key = {{ADMIN_SECRET}}
// Transformer:
return data.map(listing => ({
  ...listing,
  currentBid: `${listing.currentBid} сомони`,
  seller: listing.seller?.fullName || 'Неизвестно',
  statusBadge: listing.status
}));
```

### Запрос ставок:
```javascript
// Название: getBids
// Тип: REST API
// URL: {{API_BASE_URL}}/api/admin/bids  
// Method: GET
// Headers: x-admin-key = {{ADMIN_SECRET}}
// Transformer:
return data.map(bid => ({
  ...bid,
  amount: `${bid.amount} сомони`,
  bidder: bid.bidder?.fullName || 'Неизвестно',
  car: `${bid.listing?.make} ${bid.listing?.model} ${bid.listing?.year}`,
  lot: bid.listing?.lotNumber,
  date: new Date(bid.createdAt).toLocaleDateString('ru-RU')
}));
```

## Этап 4: Создание страниц

### Страница 1: Dashboard (Панель управления)

1. Добавьте 4 компонента Statistic:
   - **Ожидающие**: `{{getStats.data.pendingListings}}`
   - **Активные**: `{{getStats.data.activeAuctions}}`  
   - **Пользователи**: `{{getStats.data.totalUsers}}`
   - **Заблокированные**: `{{getStats.data.bannedUsers}}`

2. Добавьте Button для обновления:
   ```javascript
   // Event Handler:
   getStats.trigger();
   getUsers.trigger();
   getListings.trigger();
   ```

### Страница 2: Управление пользователями

1. Добавьте Table компонент:
   - **Data**: `{{getUsers.data}}`
   - **Columns**: id, fullName, phoneNumber, email, status, role, created
   - **Selection**: Single row

2. Добавьте кнопки управления:
   
   **Активировать пользователя:**
   ```javascript
   // Query: activateUser
   // URL: {{API_BASE_URL}}/api/admin/users/{{table1.selectedRow.id}}/status
   // Method: PATCH
   // Headers: x-admin-key = {{ADMIN_SECRET}}
   // Body: {"isActive": true}
   // Success actions: getUsers.trigger(); getStats.trigger();
   ```
   
   **Деактивировать пользователя:**
   ```javascript
   // Query: deactivateUser  
   // URL: {{API_BASE_URL}}/api/admin/users/{{table1.selectedRow.id}}/status
   // Method: PATCH
   // Headers: x-admin-key = {{ADMIN_SECRET}}
   // Body: {"isActive": false}
   // Success actions: getUsers.trigger(); getStats.trigger();
   ```

### Страница 3: Модерация объявлений

1. Добавьте Table компонент:
   - **Data**: `{{getListings.data}}`
   - **Columns**: id, lotNumber, make, model, year, currentBid, statusBadge, seller, bidCount
   - **Selection**: Single row

2. Добавьте фильтр по статусу:
   ```javascript
   // Select компонент с опциями:
   // - Все объявления
   // - pending (Ожидающие)
   // - active (Активные) 
   // - ended (Завершенные)
   // - rejected (Отклоненные)
   ```

3. Добавьте кнопки модерации:
   
   **Одобрить:**
   ```javascript
   // Query: approveListing
   // URL: {{API_BASE_URL}}/api/listings/{{table2.selectedRow.id}}/status
   // Method: PATCH
   // Headers: x-admin-key = {{ADMIN_SECRET}}
   // Body: {"status": "active"}
   // Disabled: {{table2.selectedRow.status !== 'pending'}}
   ```
   
   **Отклонить:**
   ```javascript
   // Query: rejectListing
   // URL: {{API_BASE_URL}}/api/listings/{{table2.selectedRow.id}}/status  
   // Method: PATCH
   // Headers: x-admin-key = {{ADMIN_SECRET}}
   // Body: {"status": "rejected"}
   // Disabled: {{table2.selectedRow.status !== 'pending'}}
   ```

### Страница 4: Мониторинг ставок

1. Добавьте Table компонент:
   - **Data**: `{{getBids.data}}`
   - **Columns**: id, amount, bidder, car, lot, date
   - **Sorting**: По дате (новые сверху)

2. Добавьте фильтры:
   - По пользователю
   - По объявлению
   - По диапазону дат

## Этап 5: Настройка стилей

1. Установите цветовую схему:
   - Активен: Зеленый
   - Неактивен: Красный  
   - Ожидает: Оранжевый
   - Завершен: Серый

2. Настройте размеры колонок таблиц для удобного просмотра

## Этап 6: Тестирование

1. Протестируйте каждый запрос в Retool
2. Проверьте работу кнопок активации/деактивации
3. Убедитесь что модерация объявлений работает
4. Проверьте обновление статистики

## Этап 7: Публикация

1. Сохраните приложение
2. Настройте права доступа для администраторов
3. Опубликуйте приложение для использования

## Полезные советы

- Используйте переменные среды для гибкости
- Добавьте подтверждения для критических действий
- Настройте автообновление данных каждые 30 секунд
- Добавьте индикаторы загрузки для лучшего UX
- Используйте условную логику для отключения кнопок

## Готовые тестовые URL

Для быстрого тестирования используйте:
- Статистика: `GET /api/admin/stats`
- Пользователи: `GET /api/admin/users` 
- Объявления: `GET /api/admin/listings`
- Ставки: `GET /api/admin/bids`

Все запросы требуют заголовок: `x-admin-key: retool-admin-key-2024`