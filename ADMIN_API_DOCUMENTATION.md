# Admin API Documentation для Retool

## Базовый URL
```
https://your-domain.replit.app/api/admin
```

## Управление пользователями

### Получить всех пользователей
```
GET /api/admin/users
```
Возвращает список всех пользователей с полной информацией.

### Активировать/деактивировать пользователя
```
PUT /api/admin/users/{id}/status
Content-Type: application/json

{
  "isActive": true|false
}
```

## Модерация объявлений

### Получить объявления по статусу
```
GET /api/admin/listings?status=pending
```
Параметры:
- `status`: "pending", "active", "sold", "rejected"

### Изменить статус объявления
```
PUT /api/admin/listings/{id}/status
Content-Type: application/json

{
  "status": "active"|"rejected"|"sold"
}
```

## Управление контентом

### Баннеры
```
GET /api/admin/banners
POST /api/admin/banners
PUT /api/admin/banners/{id}
DELETE /api/admin/banners/{id}
```

### Рекламная карусель
```
GET /api/admin/advertisement-carousel
POST /api/admin/advertisement-carousel
PUT /api/admin/advertisement-carousel/{id}
DELETE /api/admin/advertisement-carousel/{id}
```

### Секция "Продать авто"
```
GET /api/sell-car-section
PUT /api/admin/sell-car-section
```

### Документы
```
GET /api/admin/documents
POST /api/admin/documents
PUT /api/admin/documents/{id}
DELETE /api/admin/documents/{id}
```

## Статистика

### Получить статистику админа
```
GET /api/admin/stats
```
Возвращает:
```json
{
  "pendingListings": 5,
  "activeAuctions": 12,
  "totalUsers": 150,
  "bannedUsers": 3
}
```

## Уведомления

### Отправить массовое уведомление
```
POST /api/admin/notifications/broadcast
Content-Type: application/json

{
  "title": "Заголовок уведомления",
  "message": "Текст уведомления",
  "type": "system"
}
```

## Примеры использования в Retool

### 1. Таблица пользователей
- Источник данных: GET /api/admin/users
- Кнопка активации: PUT /api/admin/users/{{table.selectedRow.id}}/status

### 2. Модерация объявлений
- Источник данных: GET /api/admin/listings?status=pending
- Кнопки одобрения/отклонения: PUT /api/admin/listings/{{table.selectedRow.id}}/status

### 3. Статистика
- Dashboard с картами: GET /api/admin/stats

### 4. Массовые уведомления
- Форма с полями title, message, type
- Отправка: POST /api/admin/notifications/broadcast

## Безопасность

Все admin endpoints должны быть защищены на уровне Retool через:
1. Ограничение доступа к приложению
2. Проверка ролей пользователей
3. Логирование всех действий

## Статусы ответов

- 200: Успешно
- 204: Успешно удалено
- 400: Неверные данные
- 500: Ошибка сервера