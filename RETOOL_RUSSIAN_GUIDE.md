# Полное руководство по настройке Retool для автоаукциона

## Что такое Retool?
Retool - это платформа для быстрого создания внутренних инструментов и административных панелей. Она позволяет создавать интерфейсы без написания кода, подключаясь к вашим API.

## Шаг 1: Регистрация в Retool

1. Перейдите на сайт [retool.com](https://retool.com)
2. Нажмите "Start building for free" (Начать бесплатно)
3. Зарегистрируйтесь через email или Google
4. Подтвердите email адрес
5. Создайте workspace (рабочее пространство) с названием "AutoAuction Admin"

## Шаг 2: Создание ресурса API

После входа в Retool:

1. В левом меню найдите раздел **"Resources"** (Ресурсы)
2. Нажмите **"Create new"** → **"REST API"**
3. Заполните поля:
   - **Name:** `AutoAuction API`
   - **Base URL:** `https://d8a15fc1-aa9c-422e-afb1-9506fa80f861-00-2j9oxj0dke5fk.sisko.replit.dev`

4. В разделе **"Headers"** (Заголовки) добавьте:
   - Нажмите **"+ Add"**
   - **Key:** `Content-Type`
   - **Value:** `application/json`
   
   - Нажмите **"+ Add"** еще раз
   - **Key:** `x-admin-key` 
   - **Value:** `retool-admin-key-2024`

5. Нажмите **"Test connection"** (Проверить соединение)
   - Должно появиться сообщение об успешном подключении

6. Нажмите **"Create resource"** (Создать ресурс)

## Шаг 3: Создание первого приложения

1. Вернитесь на главную страницу Retool
2. Нажмите **"Create new"** → **"App"** (Приложение)
3. Выберите **"Start from scratch"** (Начать с нуля)
4. Название приложения: `Админка Автоаукциона`

## Шаг 4: Настройка первого запроса

В редакторе приложения:

1. В левой панели найдите **"Code"** (Код)
2. Нажмите **"+ New"** → **"Resource query"**
3. Выберите **"AutoAuction API"** из списка
4. Заполните настройки запроса:
   - **Query name:** `getUsers`
   - **Action type:** `GET`
   - **URL path:** `/api/admin/users`
   - Поставьте галочку **"Run query automatically"** (Запускать автоматически)

5. Нажмите **"Save & Run"** (Сохранить и запустить)

**Результат:** Вы должны увидеть данные о 4 пользователях в формате JSON.

## Шаг 5: Создание таблицы пользователей

1. В центральной части экрана найдите **"+ Insert"** (Вставить)
2. Выберите **"Table"** (Таблица)
3. В настройках таблицы:
   - **Data source:** выберите `{{ getUsers.data }}`
   - Retool автоматически создаст колонки

4. Настройте отображение колонок:
   - **id:** "ID пользователя"
   - **username:** "Логин"
   - **email:** "Email"
   - **fullName:** "Полное имя"
   - **phoneNumber:** "Телефон"
   - **isActive:** "Активен" (тип: boolean)
   - **createdAt:** "Дата регистрации" (тип: datetime)

## Шаг 6: Добавление статистики

1. Создайте новый запрос:
   - **Query name:** `getStats`
   - **Action type:** `GET`
   - **URL path:** `/api/admin/stats`
   - **Run automatically:** включено

2. Добавьте компоненты статистики:
   - Нажмите **"+ Insert"** → **"Statistic"** (4 раза)
   
3. Настройте каждую статистику:
   
   **Статистика 1:**
   - **Value:** `{{ getStats.data.totalUsers }}`
   - **Label:** "Всего пользователей"
   
   **Статистика 2:**
   - **Value:** `{{ getStats.data.activeAuctions }}`
   - **Label:** "Активные аукционы"
   
   **Статистика 3:**
   - **Value:** `{{ getStats.data.pendingListings }}`
   - **Label:** "Ожидают модерации"
   
   **Статистика 4:**
   - **Value:** `{{ getStats.data.bannedUsers }}`
   - **Label:** "Заблокированные"

## Шаг 7: Добавление управления пользователями

1. В таблице пользователей добавьте колонку действий:
   - В настройках таблицы найдите **"Columns"**
   - Нажмите **"+ Add column"**
   - **Column type:** "Action"
   - **Column name:** "Действия"

2. Добавьте кнопку блокировки:
   - **Button text:** `{{ table1.selectedRow.data.isActive ? "Заблокировать" : "Разблокировать" }}`
   - **Button color:** `{{ table1.selectedRow.data.isActive ? "red" : "green" }}`

3. Создайте запрос для управления пользователями:
   - **Query name:** `updateUserStatus`
   - **Action type:** `PUT`
   - **URL path:** `/api/admin/users/{{ table1.selectedRow.data.id }}/status`
   - **Body:** 
   ```json
   {
     "isActive": {{ !table1.selectedRow.data.isActive }}
   }
   ```
   - **Run automatically:** выключено

4. Привяжите кнопку к запросу:
   - В настройках кнопки найдите **"Event handlers"**
   - **Event:** "Click"
   - **Action:** "Trigger query"
   - **Query:** `updateUserStatus`

## Шаг 8: Добавление модерации аукционов

1. Создайте новый запрос для получения ожидающих модерации:
   - **Query name:** `getPendingListings`
   - **URL path:** `/api/admin/listings/pending`

2. Добавьте новую таблицу для модерации:
   - **Data source:** `{{ getPendingListings.data }}`
   - Настройте колонки: марка, модель, год, продавец, статус

3. Создайте запросы для одобрения/отклонения:
   - **Query name:** `approveListing`
   - **URL path:** `/api/admin/listings/{{ table2.selectedRow.data.id }}/approve`
   - **Action type:** `PUT`

## Шаг 9: Тестирование

1. Нажмите **"Preview"** (Предварительный просмотр) в правом верхнем углу
2. Проверьте:
   - Загружаются ли данные пользователей
   - Отображается ли статистика
   - Работают ли кнопки управления

## Шаг 10: Публикация

1. Нажмите **"Publish"** (Опубликовать)
2. Выберите **"Publish to production"**
3. Получите ссылку на админку для использования

## Доступные API endpoints:

### Пользователи:
- `GET /api/admin/users` - список всех пользователей
- `PUT /api/admin/users/{id}/status` - изменить статус пользователя

### Статистика:
- `GET /api/admin/stats` - общая статистика системы

### Модерация:
- `GET /api/admin/listings/pending` - ожидающие модерации
- `PUT /api/admin/listings/{id}/approve` - одобрить
- `PUT /api/admin/listings/{id}/reject` - отклонить

## Помощь и поддержка

Если что-то не получается:
1. Проверьте, что API ключ указан правильно: `retool-admin-key-2024`
2. Убедитесь, что Base URL правильный
3. Проверьте логи запросов во вкладке "Network" в браузере

---

**Готово!** Теперь у вас есть полноценная административная панель для управления автоаукционом.