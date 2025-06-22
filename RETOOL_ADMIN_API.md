# Retool Admin API Documentation

## База данных и Аутентификация

**Base URL:** `https://your-app.replit.app`
**Admin Authentication:** Добавьте заголовок `x-admin-key` со значением `retool-admin-key-2024`

## Основные эндпоинты для админ-панели

### 1. Управление пользователями

#### Получить всех пользователей
```
GET /api/admin/users
Headers: x-admin-key: retool-admin-key-2024
```

#### Получить пользователя по ID
```
GET /api/users/{id}
```

#### Активировать/деактивировать пользователя
```
PATCH /api/admin/users/{id}/status
Headers: x-admin-key: retool-admin-key-2024
Body: { "isActive": true/false }
```

### 2. Управление объявлениями

#### Получить все объявления с фильтрами
```
GET /api/listings?status=pending&limit=50
```

#### Получить объявление по ID
```
GET /api/listings/{id}
```

#### Обновить статус объявления
```
PATCH /api/listings/{id}/status
Body: { "status": "active" | "pending" | "rejected" | "ended" }
```

#### Создать новое объявление (для тестирования)
```
POST /api/listings
Body: {
  "sellerId": 1,
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "mileage": 50000,
  "description": "Отличное состояние",
  "startingPrice": "25000",
  "auctionEndTime": "2025-07-01T12:00:00Z",
  "photos": [],
  "condition": "excellent"
}
```

### 3. Управление ставками

#### Получить ставки для объявления
```
GET /api/listings/{id}/bids
```

#### Получить все ставки пользователя
```
GET /api/users/{userId}/bids
```

### 4. Статистика админ-панели

#### Получить общую статистику
```
GET /api/admin/stats
Headers: x-admin-key: retool-admin-key-2024

Response:
{
  "pendingListings": 5,
  "activeAuctions": 15,
  "totalUsers": 25,
  "bannedUsers": 2
}
```

### 5. Управление уведомлениями

#### Получить уведомления пользователя
```
GET /api/notifications/{userId}
```

#### Создать уведомление
```
POST /api/notifications
Body: {
  "userId": 1,
  "title": "Важное уведомление",
  "message": "Ваш аккаунт активирован",
  "type": "system"
}
```

### 6. Управление баннерами

#### Получить все баннеры
```
GET /api/banners
```

#### Создать новый баннер
```
POST /api/banners
Headers: x-admin-key: retool-admin-key-2024
Body: {
  "title": "Новый баннер",
  "description": "Описание баннера",
  "imageUrl": "https://example.com/image.jpg",
  "linkUrl": "https://example.com",
  "position": "main",
  "isActive": true
}
```

#### Обновить баннер
```
PATCH /api/banners/{id}
Headers: x-admin-key: retool-admin-key-2024
Body: { "isActive": false }
```

### 7. Алерты и предупреждения

#### Получить алерты пользователя
```
GET /api/users/{userId}/alerts
```

#### Создать алерт
```
POST /api/alerts
Body: {
  "userId": 1,
  "make": "Toyota",
  "model": "Camry",
  "maxPrice": "30000",
  "phoneNumber": "+992555555555"
}
```

## Примеры использования в Retool

### 1. Таблица пользователей
- **Data Source:** REST API
- **URL:** `{{base_url}}/api/admin/users`
- **Headers:** `{"x-admin-key": "retool-admin-key-2024"}`

### 2. Модерация объявлений
- **Query для получения pending:** `{{base_url}}/api/listings?status=pending&limit=100`
- **Кнопки действий:** Approve (PATCH status=active), Reject (PATCH status=rejected)

### 3. Статистика дашборда
- **Виджеты:** Stat components для pendingListings, activeAuctions, totalUsers
- **Обновление:** Каждые 30 секунд

### 4. Управление баннерами
- **Форма создания:** Text inputs для title, description, imageUrl
- **Toggle:** Для isActive статуса
- **Превью:** Image component для показа баннера

## Схемы данных

### User
```typescript
{
  id: number,
  email: string,
  username: string,
  fullName: string,
  role: "buyer" | "seller" | "admin",
  isActive: boolean,
  profilePhoto: string,
  phoneNumber: string,
  createdAt: Date
}
```

### CarListing
```typescript
{
  id: number,
  sellerId: number,
  make: string,
  model: string,
  year: number,
  mileage: number,
  description: string,
  startingPrice: string,
  currentBid: string,
  auctionEndTime: Date,
  status: "pending" | "active" | "ended" | "rejected",
  photos: string[],
  condition: string,
  lotNumber: string
}
```

### Bid
```typescript
{
  id: number,
  listingId: number,
  bidderId: number,
  amount: string,
  bidTime: Date,
  bidder: {
    id: number,
    username: string,
    email: string
  }
}
```