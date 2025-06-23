# Автоматический импорт в Retool - 3 способа

## Способ 1: Импорт через JSON файл (Рекомендуется)

1. Откройте Retool
2. Нажмите "Create new" → "Import from JSON"
3. Загрузите файл `RETOOL_FINAL_CONFIG.json`
4. Retool автоматически создаст все страницы и компоненты

## Способ 2: Быстрая настройка (5 минут)

### Шаг 1: Environment Variables
В Retool Settings добавьте:
```
API_BASE_URL = http://localhost:5000
ADMIN_SECRET = retool-admin-key-2024
```

### Шаг 2: Создайте первую страницу "Dashboard"
1. Добавьте REST API Query:
   - Name: `getStats`
   - URL: `{{API_BASE_URL}}/api/admin/stats`
   - Headers: `x-admin-key: {{ADMIN_SECRET}}`

2. Добавьте 4 компонента Statistic:
   - Ожидающие: `{{getStats.data.pendingListings}}`
   - Активные: `{{getStats.data.activeAuctions}}`
   - Пользователи: `{{getStats.data.totalUsers}}`
   - Заблокированные: `{{getStats.data.bannedUsers}}`

### Шаг 3: Создайте остальные страницы по файлам:
- `retool-step3-users.md` - Управление пользователями
- `retool-step4-listings.md` - Модерация объявлений
- `retool-step5-bids.md` - Мониторинг ставок

## Способ 3: Копирование готовых компонентов

### Готовые запросы для копирования:

**Статистика:**
```javascript
// getStats Query
URL: {{API_BASE_URL}}/api/admin/stats
Headers: {"x-admin-key": "{{ADMIN_SECRET}}"}
```

**Пользователи:**
```javascript
// getUsers Query
URL: {{API_BASE_URL}}/api/admin/users
Headers: {"x-admin-key": "{{ADMIN_SECRET}}"}
Transformer: return data.map(user => ({...user, statusDisplay: user.isActive ? 'Активен' : 'Неактивен'}));
```

**Активация пользователя:**
```javascript
// activateUser Query
URL: {{API_BASE_URL}}/api/admin/users/{{usersTable.selectedRow.id}}/status
Method: PATCH
Headers: {"x-admin-key": "{{ADMIN_SECRET}}", "Content-Type": "application/json"}
Body: {"isActive": true}
```

**Объявления:**
```javascript
// getListings Query
URL: {{API_BASE_URL}}/api/admin/listings
Headers: {"x-admin-key": "{{ADMIN_SECRET}}"}
Transformer: return data.map(listing => ({...listing, carDisplay: `${listing.make} ${listing.model} ${listing.year}`}));
```

**Одобрение объявления:**
```javascript
// approveListing Query
URL: {{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status
Method: PATCH
Headers: {"x-admin-key": "{{ADMIN_SECRET}}", "Content-Type": "application/json"}
Body: {"status": "active"}
```

**Ставки:**
```javascript
// getBids Query
URL: {{API_BASE_URL}}/api/admin/bids
Headers: {"x-admin-key": "{{ADMIN_SECRET}}"}
Transformer: return data.map(bid => ({...bid, amountDisplay: `${bid.amount} сомони`}));
```

## Проверка работы:

После настройки проверьте каждый эндпоинт:

1. **Dashboard:** Должны отображаться реальные цифры статистики
2. **Пользователи:** Таблица с 4 пользователями, кнопки активации работают
3. **Объявления:** 16 активных + 1 ожидающее, кнопки модерации работают
4. **Ставки:** 2 ставки с информацией о покупателях

## Настройка для продакшна:

Измените `API_BASE_URL` на ваш реальный домен:
```
API_BASE_URL = https://ваш-домен.replit.app
```

Админ-панель будет готова к использованию!