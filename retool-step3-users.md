# Шаг 3: Страница управления пользователями

## Создание новой страницы:

1. Нажмите "+" рядом с Page в левой панели
2. Назовите страницу "Пользователи"

## Создание запроса пользователей:

1. Добавьте новый REST API запрос:
   - Name: `getUsers`
   - URL: `{{API_BASE_URL}}/api/admin/users`
   - Method: GET
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`
   - Run when page loads: включить

2. В Transformer добавьте код:
```javascript
return data.map(user => ({
  ...user,
  statusDisplay: user.isActive ? 'Активен' : 'Неактивен',
  statusColor: user.isActive ? 'green' : 'red',
  createdDisplay: new Date(user.createdAt).toLocaleDateString('ru-RU'),
  phoneDisplay: user.phoneNumber || 'Не указан'
}));
```

## Создание таблицы пользователей:

1. Перетащите "Table" компонент на страницу
2. В настройках таблицы:
   - Data source: `{{getUsers.data}}`
   - Selection: Single row
   - Название: `usersTable`

3. Настройте колонки таблицы:
   - ID: `id` (Number, ширина 60px)
   - Имя: `fullName` (Text, ширина 150px)
   - Телефон: `phoneDisplay` (Text, ширина 120px)
   - Email: `email` (Text, ширина 200px)
   - Статус: `statusDisplay` (Badge, ширина 100px)
   - Роль: `role` (Text, ширина 80px)
   - Создан: `createdDisplay` (Text, ширина 100px)

4. Для колонки Статус настройте цветовую карту:
   - Активен: green
   - Неактивен: red

## Создание кнопок управления:

### Кнопка активации:
1. Добавьте Button компонент
2. Настройки:
   - Text: "Активировать"
   - Color: Success (зеленый)
   - Disabled when: `{{!usersTable.selectedRow || usersTable.selectedRow.isActive}}`

3. Создайте запрос активации:
   - Name: `activateUser`
   - URL: `{{API_BASE_URL}}/api/admin/users/{{usersTable.selectedRow.id}}/status`
   - Method: PATCH
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`, `Content-Type` = `application/json`
   - Body: `{"isActive": true}`
   - Success handlers: `getUsers.trigger()` и `getStats.trigger()`

4. Event handler кнопки: `activateUser.trigger()`

### Кнопка деактивации:
1. Добавьте второй Button
2. Настройки:
   - Text: "Деактивировать"
   - Color: Danger (красный)
   - Disabled when: `{{!usersTable.selectedRow || !usersTable.selectedRow.isActive}}`

3. Создайте запрос деактивации:
   - Name: `deactivateUser`
   - URL: `{{API_BASE_URL}}/api/admin/users/{{usersTable.selectedRow.id}}/status`
   - Method: PATCH
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`, `Content-Type` = `application/json`
   - Body: `{"isActive": false}`
   - Success handlers: `getUsers.trigger()` и `getStats.trigger()`

4. Event handler кнопки: `deactivateUser.trigger()`

## Дополнительные функции:

### Кнопка обновления:
1. Добавьте Button с текстом "Обновить"
2. Event handler: `getUsers.trigger()`

### Поиск пользователей:
1. Добавьте Text Input компонент
2. Placeholder: "Поиск по имени или телефону"
3. В таблице измените Data source на:
```javascript
{{getUsers.data.filter(user => 
  !textInput1.value || 
  user.fullName?.toLowerCase().includes(textInput1.value.toLowerCase()) ||
  user.phoneNumber?.includes(textInput1.value)
)}}
```

## Расположение компонентов:

- Поиск вверху страницы
- Таблица занимает основную часть
- Кнопки управления под таблицей в горизонтальном ряду
- Кнопка обновления справа

После настройки переходите к странице модерации объявлений.