# Быстрый старт - Retool админка за 5 минут

## Шаг 1: Создание ресурса
1. Войдите в [retool.com](https://retool.com)
2. Resources → Create new → REST API
3. Заполните:
   - Name: `AutoAuction API`
   - Base URL: `https://d8a15fc1-aa9c-422e-afb1-9506fa80f861-00-2j9oxj0dke5fk.sisko.replit.dev`
   - Headers:
     - `Content-Type`: `application/json`
     - `x-admin-key`: `retool-admin-key-2024`
4. Test connection → Create resource

## Шаг 2: Создание приложения
1. Create new → App → Start from scratch
2. Название: `Админка Автоаукциона`

## Шаг 3: Добавление запросов
Создайте 3 запроса:

**getUsers:**
- Resource: AutoAuction API
- Method: GET
- URL: `/api/admin/users`
- Run automatically: ✓

**getStats:**
- Resource: AutoAuction API  
- Method: GET
- URL: `/api/admin/stats`
- Run automatically: ✓

**getPendingListings:**
- Resource: AutoAuction API
- Method: GET
- URL: `/api/admin/listings/pending`
- Run automatically: ✓

## Шаг 4: Добавление компонентов

### Статистика (4 блока):
Insert → Statistic (4 раза)
- Блок 1: Value: `{{ getStats.data.totalUsers }}`, Label: "Всего пользователей"
- Блок 2: Value: `{{ getStats.data.activeAuctions }}`, Label: "Активные аукционы"
- Блок 3: Value: `{{ getStats.data.pendingListings }}`, Label: "На модерации"  
- Блок 4: Value: `{{ getStats.data.bannedUsers }}`, Label: "Заблокированные"

### Таблица пользователей:
Insert → Table
- Data source: `{{ getUsers.data }}`
- Настройте колонки: ID, Логин, Email, Имя, Телефон, Активен, Дата регистрации

### Таблица модерации:
Insert → Table
- Data source: `{{ getPendingListings.data }}`
- Колонки: ID, Лот, Марка, Модель, Год, Продавец, Статус

## Шаг 5: Тестирование
1. Preview → проверьте загрузку данных
2. Publish → опубликуйте админку

**Готово!** Базовая админка работает.

## Данные для проверки:
- Пользователей: 4
- Активных аукционов: 15  
- На модерации: 1
- Заблокированных: 0