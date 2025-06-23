# NocoDB Webhook Integration для AutoBid

## Доступные Webhook Endpoints

### 1. Одобрение объявления
**URL:** `https://your-app.replit.app/api/webhooks/listing-approved`
**Method:** POST
**Trigger:** Когда в NocoDB меняется car_listings.status на 'active'

```json
{
  "id": 123,
  "status": "active"
}
```

**Результат:**
- Объявление получает статус 'active'
- Продавец получает уведомление об одобрении
- Автоматически устанавливается время начала аукциона

### 2. Отклонение объявления
**URL:** `https://your-app.replit.app/api/webhooks/listing-rejected`
**Method:** POST
**Trigger:** Когда в NocoDB меняется car_listings.status на 'rejected'

```json
{
  "id": 123,
  "status": "rejected",
  "reason": "Недостаточно фотографий автомобиля"
}
```

**Результат:**
- Объявление получает статус 'rejected'
- Продавец получает уведомление с причиной отклонения

### 3. Активация пользователя
**URL:** `https://your-app.replit.app/api/webhooks/user-activated`
**Method:** POST
**Trigger:** Когда в NocoDB меняется users.is_active на true

```json
{
  "id": 456,
  "is_active": true
}
```

**Результат:**
- Пользователь получает доступ к полному функционалу
- Отправляется уведомление об активации

### 4. Деактивация пользователя
**URL:** `https://your-app.replit.app/api/webhooks/user-deactivated`
**Method:** POST  
**Trigger:** Когда в NocoDB меняется users.is_active на false

```json
{
  "id": 456,
  "is_active": false,
  "reason": "Нарушение правил платформы"
}
```

**Результат:**
- Пользователь теряет доступ к функциям
- Отправляется уведомление о деактивации

### 5. Массовые уведомления
**URL:** `https://your-app.replit.app/api/webhooks/broadcast-notification`
**Method:** POST
**Trigger:** Ручной запуск из NocoDB

```json
{
  "title": "Техническое обслуживание",
  "message": "Завтра с 02:00 до 04:00 будет проводиться техническое обслуживание",
  "type": "system",
  "user_ids": [123, 456, 789]
}
```

**Результат:**
- Указанные пользователи получают уведомление
- Если user_ids не указаны, уведомление отправляется всем активным пользователям

## API Endpoints для NocoDB

### 1. Статистика для дашборда
**URL:** `https://your-app.replit.app/api/admin/stats`
**Method:** GET

**Возвращает:**
```json
{
  "pendingListings": 5,
  "activeAuctions": 12,
  "totalUsers": 150,
  "bannedUsers": 3,
  "activeUsers": 142,
  "inactiveUsers": 8,
  "totalBids": 847
}
```

### 2. Детальная информация о пользователе
**URL:** `https://your-app.replit.app/api/admin/users/{id}`
**Method:** GET

**Возвращает:**
```json
{
  "user": {
    "id": 123,
    "username": "+992901234567",
    "email": "992901234567@autoauction.tj",
    "fullName": "Иван Иванов",
    "isActive": true,
    "role": "seller"
  },
  "stats": {
    "totalListings": 5,
    "activeListings": 2,
    "totalBids": 23,
    "unreadNotifications": 1
  }
}
```

## Настройка Webhooks в NocoDB

### Шаг 1: Создание Webhook
1. Откройте таблицу car_listings
2. Перейдите в настройки → Webhooks
3. Нажмите "Add Webhook"
4. Выберите событие: "After Update"
5. Добавьте условие: status = 'active'
6. URL: https://your-app.replit.app/api/webhooks/listing-approved

### Шаг 2: Настройка Headers
```
Content-Type: application/json
Authorization: Bearer your-secret-token (опционально)
```

### Шаг 3: Payload Template
```json
{
  "id": "{{id}}",
  "status": "{{status}}",
  "reason": "{{rejection_reason}}"
}
```

## Тестирование Webhooks

### Тест одобрения объявления:
```bash
curl -X POST https://your-app.replit.app/api/webhooks/listing-approved \
  -H "Content-Type: application/json" \
  -d '{
    "id": 41,
    "status": "active"
  }'
```

### Тест отклонения объявления:
```bash
curl -X POST https://your-app.replit.app/api/webhooks/listing-rejected \
  -H "Content-Type: application/json" \
  -d '{
    "id": 41,
    "status": "rejected",
    "reason": "Недостаточно информации"
  }'
```

### Тест активации пользователя:
```bash
curl -X POST https://your-app.replit.app/api/webhooks/user-activated \
  -H "Content-Type: application/json" \
  -d '{
    "id": 18,
    "is_active": true
  }'
```

### Тест массовых уведомлений:
```bash
curl -X POST https://your-app.replit.app/api/webhooks/broadcast-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новые функции",
    "message": "Добавлены новые функции поиска",
    "type": "system"
  }'
```

### Тест получения статистики:
```bash
curl -X GET https://your-app.replit.app/api/admin/stats \
  -H "Content-Type: application/json"
```

## Настройка Quick Actions в NocoDB

### Кнопка "Одобрить объявление"
1. Создайте кнопку в представлении car_listings
2. Настройте action: Update Record
3. Поля для обновления: status = 'active'
4. Webhook: автоматически сработает после обновления

### Кнопка "Отклонить объявление"
1. Создайте кнопку с полем для ввода причины
2. Action: Update Record
3. Поля: status = 'rejected', rejection_reason = {input}

### Кнопка "Активировать пользователя"
1. Создайте кнопку в представлении users
2. Action: Update Record
3. Поля: is_active = true

## Автоматизированные правила

### Правило 1: Автоодобрение проверенных продавцов
**Условие:** Новое объявление от пользователя с role = 'verified_seller'
**Действие:** Автоматически устанавливать status = 'active'

### Правило 2: Уведомления об истечении аукциона
**Условие:** auction_end_time <= NOW() + 1 час
**Действие:** Отправить уведомление продавцу и активным участникам

### Правило 3: Деактивация неактивных пользователей
**Условие:** Нет активности более 90 дней
**Действие:** Установить is_active = false

## Безопасность

### Проверка подлинности webhook
```javascript
// Добавьте секретный токен в headers
const webhookSecret = process.env.WEBHOOK_SECRET;
const receivedSignature = req.headers['x-webhook-signature'];

// Проверьте подпись
if (receivedSignature !== webhookSecret) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Логирование webhook вызовов
Все webhook вызовы логируются в консоль с информацией:
- Время вызова
- Endpoint
- Payload
- Результат выполнения

## Мониторинг

### Проверка работоспособности webhook
```bash
# Проверка доступности endpoints
curl -X GET https://your-app.replit.app/api/admin/stats
```

### Отслеживание ошибок
- Webhook ошибки логируются в server console
- Неудачные вызовы возвращают HTTP 500
- Детали ошибок доступны в логах приложения

---

## Результат интеграции

После настройки всех webhook получите:
- Автоматическую модерацию объявлений одним кликом
- Мгновенные уведомления пользователей о изменениях
- Централизованное управление через NocoDB
- Полную синхронизацию данных между админкой и приложением
- Возможность массовых операций и уведомлений