# NocoDB - Автоматический импорт админки за 3 минуты

## 🚀 Способ 1: Подключение к существующей базе данных (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Создание проекта (1 минута)
1. Откройте https://app.nocodb.com/
2. Нажмите "Create Project"
3. Выберите "Connect to external database"
4. Выберите PostgreSQL

### Шаг 2: Данные подключения (скопируйте и вставьте)
```
Host: ep-broad-shadow-adb94hwu.c-2.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_u6DqeO4wSMQU
SSL Mode: require
Project Name: AutoBid Admin
```

### Шаг 3: Автоматический импорт (30 секунд)
NocoDB автоматически обнаружит и импортирует все таблицы:
- ✅ users (4 пользователя)
- ✅ car_listings (16 объявлений)
- ✅ bids (180+ ставок)
- ✅ notifications (уведомления)
- ✅ favorites (избранное)
- ✅ car_alerts (оповещения)
- ✅ banners (баннеры)
- ✅ documents (документы)

### Шаг 4: Проверка подключения (30 секунд)
После импорта увидите все таблицы с данными. Проверьте:
- users: 4 записи
- car_listings: 16 записей со статусами
- bids: активные ставки

---

## 🔧 Способ 2: Импорт готовой конфигурации

### Если хотите готовые представления и webhook:

1. **Скачайте файл:** `NOCODB_AUTO_IMPORT.json`
2. **В NocoDB:** Settings → Project → Import Metadata
3. **Загрузите файл** и нажмите Import
4. **Готово!** Все представления и webhook настроены автоматически

---

## 📊 Что получите сразу после импорта:

### Готовые представления:
- **Пользователи → Неактивные** (фильтр is_active = false)
- **Объявления → На модерации** (фильтр status = pending)
- **Объявления → Активные аукционы** (фильтр status = active)
- **Ставки → Последние ставки** (сортировка по дате)

### Цветовое кодирование:
- 🟢 Активные пользователи / объявления
- 🔴 Неактивные / отклоненные
- 🟠 На модерации
- ⚪ Завершенные

### Связи между таблицами:
- seller_id → users.username
- bidder_id → users.username  
- listing_id → car_listings.lot_number

---

## ⚡ Быстрая настройка webhook (2 минуты)

### Автоматическая модерация объявлений:

**Webhook 1: Одобрение объявления**
```
URL: https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-approved
Событие: После обновления car_listings
Условие: status = 'active'
Payload: {"id": "{{id}}", "status": "{{status}}"}
```

**Webhook 2: Отклонение объявления**
```
URL: https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-rejected
Событие: После обновления car_listings  
Условие: status = 'rejected'
Payload: {"id": "{{id}}", "status": "{{status}}", "reason": "{{rejection_reason}}"}
```

**Webhook 3: Активация пользователя**
```
URL: https://task-tracker-serviceapp225.replit.app/api/webhooks/user-activated
Событие: После обновления users
Условие: is_active = true
Payload: {"id": "{{id}}", "is_active": "{{is_active}}"}
```

### Настройка webhook в NocoDB:
1. Откройте таблицу (например, car_listings)
2. Настройки → Webhooks → Add Webhook
3. Скопируйте данные выше
4. Сохраните

---

## 📈 Дашборд статистики (1 минута)

### Добавьте виджеты на главную страницу:

**API endpoint для статистики:**
```
GET https://task-tracker-serviceapp225.replit.app/api/admin/stats
```

**Возвращает:**
```json
{
  "pendingListings": "1",     // Ожидающие модерации
  "activeAuctions": "15",     // Активные аукционы  
  "totalUsers": "4",          // Всего пользователей
  "activeUsers": 4,           // Активные пользователи
  "inactiveUsers": 0          // Неактивные пользователи
}
```

### Виджеты для дашборда:
1. **Number Widget:** Ожидающие модерации (оранжевый)
2. **Number Widget:** Активные аукционы (зеленый)
3. **Number Widget:** Всего пользователей (синий)
4. **Number Widget:** Неактивные пользователи (красный)

---

## 🎯 Быстрые действия (готовые кнопки)

### Для модерации объявлений:
- **Кнопка "Одобрить":** status → 'active'
- **Кнопка "Отклонить":** status → 'rejected'

### Для управления пользователями:  
- **Кнопка "Активировать":** is_active → true
- **Кнопка "Деактивировать":** is_active → false

### Настройка кнопок:
1. Представления → Настройки → Actions
2. Add Action → Update Record
3. Выберите поле и новое значение
4. Сохраните

---

## ✅ Проверка работоспособности

### Тест 1: Статистика
```bash
curl https://task-tracker-serviceapp225.replit.app/api/admin/stats
```

### Тест 2: Одобрение объявления  
```bash
curl -X POST https://task-tracker-serviceapp225.replit.app/api/webhooks/listing-approved \
  -H "Content-Type: application/json" \
  -d '{"id": 41, "status": "active"}'
```

### Тест 3: Активация пользователя
```bash
curl -X POST https://task-tracker-serviceapp225.replit.app/api/webhooks/user-activated \
  -H "Content-Type: application/json" \
  -d '{"id": 31, "is_active": true}'
```

---

## 🏁 Результат через 3 минуты:

✅ **Полноценная админка** с доступом ко всем данным  
✅ **Автоматическая модерация** объявлений через webhook  
✅ **Управление пользователями** с уведомлениями  
✅ **Мониторинг ставок** в реальном времени  
✅ **Дашборд с метриками** платформы  
✅ **Готовые фильтры** и представления  

### Сразу доступно:
- 4 пользователя для управления
- 16 объявлений для модерации  
- 180+ ставок для мониторинга
- Все webhook endpoints работают

**Админка готова к использованию немедленно!**

---

## 🔧 Если нужны дополнительные настройки:

### Добавить поле "Причина отклонения":
1. Таблица car_listings → Add Column
2. Название: rejection_reason
3. Тип: Long Text

### Добавить поле "Причина деактивации":
1. Таблица users → Add Column  
2. Название: deactivation_reason
3. Тип: Long Text

### Массовые операции:
- Выделите записи → Bulk Actions
- Выберите операцию (активировать/деактивировать)
- Применить ко всем выбранным

Теперь у вас есть полная админка для AutoBid с автоматизацией!