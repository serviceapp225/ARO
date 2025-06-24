# Пошаговая настройка Retool Admin Panel (5 минут)

## Шаг 1: Откройте Retool и создайте приложение
1. Откройте Retool → Create → App
2. Назовите "AutoBid Admin"

## Шаг 2: Создайте 4 запроса на главной странице

### Запрос 1: Статистика
- Нажмите "+ New" внизу
- Name: `getStats`
- URL: `https://task-tracker-serviceapp225.replit.app/api/admin/stats`
- Method: GET
- Headers: добавьте `x-admin-key` = `retool-admin-key-2024`
- Включите "run this query on page load"
- Save

### Запрос 2: Пользователи  
- Нажмите "+ New"
- Name: `getUsers`
- URL: `https://task-tracker-serviceapp225.replit.app/api/admin/users`
- Method: GET
- Headers: `x-admin-key` = `retool-admin-key-2024`
- Включите "run this query on page load"
- Save

### Запрос 3: Объявления
- Нажмите "+ New"
- Name: `getListings`
- URL: `https://task-tracker-serviceapp225.replit.app/api/admin/listings`
- Method: GET
- Headers: `x-admin-key` = `retool-admin-key-2024`
- Включите "run this query on page load"
- Save

### Запрос 4: Ставки
- Нажмите "+ New"
- Name: `getBids`
- URL: `https://task-tracker-serviceapp225.replit.app/api/admin/bids`
- Method: GET
- Headers: `x-admin-key` = `retool-admin-key-2024`
- Включите "run this query on page load"
- Save

## Шаг 3: Добавьте статистику на главную страницу

Перетащите 4 компонента Text:
1. Text 1: `Ожидающие: {{getStats.data.pendingListings}}`
2. Text 2: `Активные: {{getStats.data.activeAuctions}}`
3. Text 3: `Пользователи: {{getStats.data.totalUsers}}`
4. Text 4: `Заблокированные: {{getStats.data.bannedUsers}}`

## Шаг 4: Создайте страницы

### Страница "Пользователи"
1. Нажмите "+" рядом с Page 1
2. Назовите "Пользователи"
3. Перетащите Table
4. Data source: `{{getUsers.data}}`

### Страница "Объявления"
1. Добавьте новую страницу "Объявления"
2. Перетащите Table
3. Data source: `{{getListings.data}}`

### Страница "Ставки"
1. Добавьте новую страницу "Ставки"
2. Перетащите Table
3. Data source: `{{getBids.data}}`

## Готово!
У вас есть полная админ-панель с реальными данными.