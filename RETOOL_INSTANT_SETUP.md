# Автоматический импорт в Retool за 2 минуты

## Способ 1: Импорт из JSON (Рекомендуется)

1. В Retool нажмите **"Create new app"**
2. Выберите **"Import from JSON"**
3. Загрузите файл `RETOOL_READY_IMPORT.json`
4. Готово - все 4 страницы создадутся автоматически

## Способ 2: Если импорт не работает

Скопируйте и вставьте эти запросы по очереди:

### Запрос 1: getStats
```
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/stats
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 2: getUsers  
```
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/users
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 3: getListings
```
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/listings
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

### Запрос 4: getBids
```
Type: REST API
URL: https://task-tracker-serviceapp225.replit.app/api/admin/bids
Method: GET
Headers: x-admin-key = retool-admin-key-2024
Run when page loads: ✓
```

## Создание компонентов

Добавьте Text компоненты с этими значениями:

**Dashboard страница:**
- `📊 Ожидающие: {{getStats.data.pendingListings}}`
- `🔥 Активные: {{getStats.data.activeAuctions}}`
- `👥 Пользователи: {{getStats.data.totalUsers}}`
- `🚫 Заблокированные: {{getStats.data.bannedUsers}}`

**Пользователи страница:**
- Table с данными: `{{getUsers.data}}`
- Колонки: fullName, phoneNumber, email, isActive

**Объявления страница:**
- Table с данными: `{{getListings.data}}`
- Колонки: lotNumber, make, model, status, seller.fullName

**Ставки страница:**
- Table с данными: `{{getBids.data}}`
- Колонки: amount, bidder.fullName, listing.make, createdAt

## Проверка работы

Все запросы должны возвращать реальные данные:
- getStats: {"pendingListings":"1","activeAuctions":"16","totalUsers":"4","bannedUsers":"0"}
- getUsers: массив из 4 пользователей
- getListings: 16 активных + 1 ожидающее объявление
- getBids: 2 ставки

Админ-панель готова к использованию!