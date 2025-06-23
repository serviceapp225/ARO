# Шаг 4: Страница модерации объявлений

## Создание новой страницы:

1. Добавьте страницу "Объявления"

## Создание запроса объявлений:

1. Добавьте REST API запрос:
   - Name: `getListings`
   - URL: `{{API_BASE_URL}}/api/admin/listings`
   - Method: GET
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`
   - Run when page loads: включить

2. Transformer:
```javascript
return data.map(listing => ({
  ...listing,
  currentBidDisplay: `${listing.currentBid || listing.startingPrice} сомони`,
  sellerDisplay: listing.seller?.fullName || 'Неизвестно',
  carDisplay: `${listing.make} ${listing.model} ${listing.year}`,
  statusColor: {
    'pending': 'orange',
    'active': 'green', 
    'ended': 'gray',
    'rejected': 'red'
  }[listing.status] || 'gray'
}));
```

## Создание фильтра по статусу:

1. Добавьте Select компонент
2. Настройки:
   - Название: `statusFilter`
   - Options: Manual entry
   - Values и Labels:
     - `all` - "Все объявления"
     - `pending` - "Ожидающие"
     - `active` - "Активные"
     - `ended` - "Завершенные"
     - `rejected` - "Отклоненные"
   - Default value: `all`

## Создание таблицы объявлений:

1. Добавьте Table компонент
2. Настройки:
   - Название: `listingsTable`
   - Data source:
```javascript
{{statusFilter.value === 'all' ? 
  getListings.data : 
  getListings.data.filter(item => item.status === statusFilter.value)
}}
```
   - Selection: Single row

3. Колонки таблицы:
   - ID: `id` (Number, 60px)
   - Лот: `lotNumber` (Text, 80px)
   - Автомобиль: `carDisplay` (Text, 200px)
   - Цена: `currentBidDisplay` (Text, 120px)
   - Статус: `status` (Badge, 100px)
   - Продавец: `sellerDisplay` (Text, 150px)
   - Ставок: `bidCount` (Number, 70px)

4. Для колонки Статус настройте цветовую карту:
   - pending: orange
   - active: green
   - ended: gray
   - rejected: red

## Создание кнопок модерации:

### Кнопка одобрения:
1. Добавьте Button
2. Настройки:
   - Text: "Одобрить"
   - Color: Success
   - Disabled when: `{{!listingsTable.selectedRow || listingsTable.selectedRow.status !== 'pending'}}`

3. Создайте запрос одобрения:
   - Name: `approveListing`
   - URL: `{{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status`
   - Method: PATCH
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`, `Content-Type` = `application/json`
   - Body: `{"status": "active"}`
   - Success handlers: `getListings.trigger()` и `getStats.trigger()`

4. Event handler: `approveListing.trigger()`

### Кнопка отклонения:
1. Добавьте Button
2. Настройки:
   - Text: "Отклонить"
   - Color: Danger
   - Disabled when: `{{!listingsTable.selectedRow || listingsTable.selectedRow.status !== 'pending'}}`

3. Создайте запрос отклонения:
   - Name: `rejectListing`
   - URL: `{{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status`
   - Method: PATCH
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`, `Content-Type` = `application/json`
   - Body: `{"status": "rejected"}`
   - Success handlers: `getListings.trigger()` и `getStats.trigger()`

4. Event handler: `rejectListing.trigger()`

### Кнопка завершения:
1. Добавьте Button
2. Настройки:
   - Text: "Завершить"
   - Color: Warning
   - Disabled when: `{{!listingsTable.selectedRow || listingsTable.selectedRow.status !== 'active'}}`

3. Создайте запрос завершения:
   - Name: `endListing`
   - URL: `{{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status`
   - Method: PATCH
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`, `Content-Type` = `application/json`
   - Body: `{"status": "ended"}`
   - Success handlers: `getListings.trigger()` и `getStats.trigger()`

4. Event handler: `endListing.trigger()`

## Отображение деталей объявления:

1. Добавьте Text компонент для отображения выбранного объявления:
```javascript
{{listingsTable.selectedRow ? 
  `Выбрано: ${listingsTable.selectedRow.carDisplay} 
   Лот: ${listingsTable.selectedRow.lotNumber}
   Продавец: ${listingsTable.selectedRow.sellerDisplay}
   Описание: ${listingsTable.selectedRow.description || 'Нет описания'}` 
  : 'Выберите объявление для просмотра деталей'
}}
```

## Расположение компонентов:

- Фильтр по статусу вверху
- Таблица объявлений в центре
- Детали выбранного объявления справа или под таблицей
- Кнопки модерации в горизонтальном ряду снизу

После настройки переходите к странице мониторинга ставок.