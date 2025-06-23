# Retool Admin Panel - Обновленная настройка

## Обзор
Полная настройка админ-панели Retool для AutoBid платформы с актуальными API эндпоинтами.

## База данных подключение
```
Database Type: PostgreSQL
Connection String: {{DATABASE_URL из переменных окружения}}
```

## API Подключения

### Base URL
```
https://ваш-домен.replit.app/api/admin
```

### Аутентификация
Все админские API требуют заголовка:
```
Authorization: Bearer admin-secret-key
```

## Основные компоненты Retool

### 1. Управление пользователями

#### API эндпоинты:
- `GET /api/admin/users` - Получить всех пользователей
- `PATCH /api/admin/users/{id}/status` - Изменить статус пользователя
- `PATCH /api/admin/users/{id}/profile` - Обновить профиль пользователя

#### Компонент таблицы пользователей:
```javascript
// Query: getUsers
{
  "query": "/api/admin/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer admin-secret-key"
  }
}

// Transformer для отображения:
return data.map(user => ({
  id: user.id,
  fullName: user.fullName || 'Пользователь',
  email: user.email,
  phoneNumber: user.phoneNumber,
  isActive: user.isActive ? 'Активен' : 'Неактивен',
  createdAt: new Date(user.createdAt).toLocaleDateString('ru-RU'),
  role: user.role
}));
```

#### Активация/деактивация пользователя:
```javascript
// Query: updateUserStatus
{
  "query": "/api/admin/users/{{table1.selectedRow.id}}/status",
  "method": "PATCH",
  "headers": {
    "Authorization": "Bearer admin-secret-key",
    "Content-Type": "application/json"
  },
  "body": {
    "isActive": {{!table1.selectedRow.isActive.includes('Активен')}}
  }
}
```

### 2. Управление объявлениями

#### API эндпоинты:
- `GET /api/admin/listings` - Получить все объявления
- `GET /api/admin/listings?status=pending` - Объявления по статусу
- `PATCH /api/listings/{id}/status` - Обновить статус объявления

#### Компонент таблицы объявлений:
```javascript
// Query: getListings
{
  "query": "/api/admin/listings",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer admin-secret-key"
  }
}

// Transformer:
return data.map(listing => ({
  id: listing.id,
  lotNumber: listing.lotNumber,
  make: listing.make,
  model: listing.model,
  year: listing.year,
  currentBid: `${listing.currentBid} сомони`,
  status: listing.status,
  seller: listing.seller?.fullName || 'Неизвестно',
  bidCount: listing.bidCount,
  createdAt: new Date(listing.createdAt).toLocaleDateString('ru-RU')
}));
```

#### Одобрение/отклонение объявлений:
```javascript
// Query: approveRejectListing
{
  "query": "/api/listings/{{table2.selectedRow.id}}/status",
  "method": "PATCH",
  "headers": {
    "Authorization": "Bearer admin-secret-key",
    "Content-Type": "application/json"
  },
  "body": {
    "status": "{{select1.value}}" // 'active' или 'rejected'
  }
}
```

### 3. Просмотр ставок

#### API эндпоинт:
- `GET /api/admin/bids` - Получить все ставки
- `GET /api/admin/bids?listingId={id}` - Ставки по объявлению

#### Компонент таблицы ставок:
```javascript
// Query: getBids
{
  "query": "/api/admin/bids",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer admin-secret-key"
  }
}

// Transformer:
return data.map(bid => ({
  id: bid.id,
  amount: `${bid.amount} сомони`,
  bidder: bid.bidder?.fullName || 'Неизвестно',
  listing: `${bid.listing?.make} ${bid.listing?.model} ${bid.listing?.year}`,
  lotNumber: bid.listing?.lotNumber,
  createdAt: new Date(bid.createdAt).toLocaleDateString('ru-RU')
}));
```

### 4. Статистика

#### API эндпоинт:
- `GET /api/admin/stats` - Получить статистику платформы

#### Компонент статистики:
```javascript
// Query: getStats
{
  "query": "/api/admin/stats",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer admin-secret-key"
  }
}

// Отображение в карточках:
// Card 1: Ожидающие объявления - {{getStats.data.pendingListings}}
// Card 2: Активные аукционы - {{getStats.data.activeAuctions}}
// Card 3: Всего пользователей - {{getStats.data.totalUsers}}
// Card 4: Заблокированные пользователи - {{getStats.data.bannedUsers}}
```

### 5. Управление баннерами

#### API эндпоинты (без аутентификации):
- `GET /api/banners` - Получить баннеры
- `POST /api/banners` - Создать баннер
- `PUT /api/banners/{id}` - Обновить баннер
- `DELETE /api/banners/{id}` - Удалить баннер

#### Компонент управления баннерами:
```javascript
// Query: getBanners
{
  "query": "/api/banners",
  "method": "GET"
}

// Query: createBanner
{
  "query": "/api/banners",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "title": "{{textInput1.value}}",
    "imageUrl": "{{textInput2.value}}",
    "linkUrl": "{{textInput3.value}}",
    "position": "{{select2.value}}",
    "isActive": {{checkbox1.value}}
  }
}
```

### 6. Управление рекламной каруселью

#### API эндпоинты:
- `GET /api/advertisement-carousel` - Получить элементы карусели
- `POST /api/advertisement-carousel` - Создать элемент
- `PUT /api/advertisement-carousel/{id}` - Обновить элемент
- `DELETE /api/advertisement-carousel/{id}` - Удалить элемент

### 7. Управление документами

#### API эндпоинты:
- `GET /api/documents` - Получить документы
- `POST /api/documents` - Создать документ
- `PUT /api/documents/{id}` - Обновить документ
- `DELETE /api/documents/{id}` - Удалить документ

## Переменные окружения Retool

Добавьте в Settings → Environment variables:
```
DATABASE_URL: строка подключения к PostgreSQL
ADMIN_SECRET: admin-secret-key
API_BASE_URL: https://ваш-домен.replit.app
```

## Схема базы данных

### Основные таблицы:
- `users` - Пользователи
- `car_listings` - Объявления о продаже автомобилей
- `bids` - Ставки на аукционах
- `notifications` - Уведомления пользователей
- `banners` - Рекламные баннеры
- `advertisement_carousel` - Элементы карусели
- `documents` - Документы (политики, правила)

## Быстрая настройка

1. Создайте новое Retool приложение
2. Настройте PostgreSQL ресурс с DATABASE_URL
3. Импортируйте компоненты из RETOOL_IMPORT_CONFIGS.json
4. Настройте переменные окружения
5. Протестируйте API вызовы

## Безопасность

- Все админские API защищены middleware `adminAuth`
- Используйте HTTPS для продакшна
- Регулярно обновляйте ADMIN_SECRET ключ
- Ограничьте доступ к Retool панели по IP адресам

## Примечания

- API возвращает данные в JSON формате
- Даты в ISO 8601 формате
- Суммы в строковом формате с точностью до копеек
- Статусы объявлений: 'pending', 'active', 'ended', 'rejected'
- Статусы пользователей: isActive (boolean)