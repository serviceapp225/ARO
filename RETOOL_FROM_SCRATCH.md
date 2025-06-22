# Создание админ-панели в Retool с нуля

## Шаг 1: Создание нового приложения

1. Откройте Retool → **Create** → **App**
2. Назовите: **AutoAuction Admin Dashboard**

## Шаг 2: Создание Resource

1. Нажмите **Resources** (левая панель)
2. **Create new** → **REST API**
3. Заполните:
   - **Name**: `AutoAuction API`
   - **Base URL**: `https://d8a15fc1-aa9c-422e-afb1-9506fa80f861-00-2j9oxj0dke5fk.sisko.replit.dev`
   - **Headers** (нажмите Add):
     - Key: `Content-Type`, Value: `application/json`
     - Key: `x-admin-key`, Value: `retool-admin-key-2024`
4. **Test connection** → **Save resource**

## Шаг 3: Создание Query для пользователей

1. В редакторе нажмите **+ New** → **Resource query**
2. Выберите **AutoAuction API**
3. Настройте:
   - **Query name**: `getUsersQuery`
   - **Action type**: `GET`
   - **URL path**: `/api/admin/users`
   - **Run automatically when inputs change**: ✓
4. Нажмите **Save & run**

Должны появиться данные о 4 пользователях.

## Шаг 4: Создание Query для статистики

1. **+ New** → **Resource query**
2. Выберите **AutoAuction API**
3. Настройте:
   - **Query name**: `getStatsQuery`
   - **Action type**: `GET`
   - **URL path**: `/api/admin/stats`
   - **Run automatically when inputs change**: ✓
4. **Save & run**

## Шаг 5: Добавление статистики на страницу

1. Из компонентов слева перетащите **Statistic** (4 раза)
2. Настройте каждый:

**Statistic 1:**
- **Label**: `Ожидают модерации`
- **Value**: `{{ getStatsQuery.data.pendingListings }}`
- **Format**: `Number`

**Statistic 2:**
- **Label**: `Активные аукционы`  
- **Value**: `{{ getStatsQuery.data.activeAuctions }}`
- **Format**: `Number`

**Statistic 3:**
- **Label**: `Всего пользователей`
- **Value**: `{{ getStatsQuery.data.totalUsers }}`
- **Format**: `Number`

**Statistic 4:**
- **Label**: `Заблокированные`
- **Value**: `{{ getStatsQuery.data.bannedUsers }}`
- **Format**: `Number`

## Шаг 6: Создание таблицы пользователей

1. Перетащите **Table** компонент
2. Настройте:
   - **Data source**: `{{ getUsersQuery.data }}`
   - **Show search**: ✓
   - **Show download**: ✓

## Шаг 7: Настройка колонок таблицы

В настройках таблицы → **Columns**:

1. **id** - оставить как есть
2. **username** → **Display name**: `Username`
3. **email** → **Display name**: `Email`
4. **fullName** → **Display name**: `Full Name`
5. **isActive** → **Display name**: `Active`, **Column type**: `Boolean`
6. **role** → **Display name**: `Role`
7. **createdAt** → **Display name**: `Created`, **Column type**: `Date`

## Шаг 8: Добавление кнопки управления пользователями

1. Перетащите **Button** под таблицу
2. Настройте:
   - **Text**: `{{ table1.selectedRow?.isActive ? "Деактивировать" : "Активировать" }}`
   - **Disabled**: `{{ !table1.selectedRow }}`
   - **Button color**: `{{ table1.selectedRow?.isActive ? "red" : "green" }}`

## Шаг 9: Создание Query для изменения статуса пользователя

1. **+ New** → **Resource query**
2. **AutoAuction API**
3. Настройте:
   - **Query name**: `updateUserStatusQuery`
   - **Action type**: `PATCH`
   - **URL path**: `/api/admin/users/{{ table1.selectedRow.id }}/status`
   - **Request body**:
     ```json
     {
       "isActive": {{ !table1.selectedRow.isActive }}
     }
     ```

## Шаг 10: Подключение кнопки к Query

1. Выберите кнопку
2. **Event handlers** → **Add handler**
3. **Event**: `Click`
4. **Action**: `Trigger query`
5. **Query**: `updateUserStatusQuery`
6. **Additional settings** → **Show success notification**: ✓

## Шаг 11: Автообновление после изменений

1. В `updateUserStatusQuery` → **Event handlers**
2. **Add handler**:
   - **Event**: `Query success`
   - **Action**: `Trigger query`
   - **Query**: `getUsersQuery`

## Готово!

Теперь у вас работающая админ-панель с:
- Статистикой (1 pending, 15 active, 4 users, 0 banned)
- Таблицей пользователей с реальными данными
- Возможностью активировать/деактивировать пользователей

Следующим шагом можно добавить модерацию объявлений и управление баннерами.