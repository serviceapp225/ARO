# Шаг 5: Страница мониторинга ставок

## Создание новой страницы:

1. Добавьте страницу "Ставки"

## Создание запроса ставок:

1. Добавьте REST API запрос:
   - Name: `getBids`
   - URL: `{{API_BASE_URL}}/api/admin/bids`
   - Method: GET
   - Headers: `x-admin-key` = `{{ADMIN_SECRET}}`
   - Run when page loads: включить

2. Transformer:
```javascript
return data.map(bid => ({
  ...bid,
  amountDisplay: `${bid.amount} сомони`,
  bidderDisplay: bid.bidder?.fullName || 'Неизвестно',
  carDisplay: `${bid.listing?.make} ${bid.listing?.model} ${bid.listing?.year}`,
  lotDisplay: bid.listing?.lotNumber,
  dateDisplay: new Date(bid.createdAt).toLocaleDateString('ru-RU'),
  timeDisplay: new Date(bid.createdAt).toLocaleTimeString('ru-RU'),
  bidderPhone: bid.bidder?.phoneNumber || 'Не указан'
}));
```

## Создание таблицы ставок:

1. Добавьте Table компонент
2. Настройки:
   - Название: `bidsTable`
   - Data source: `{{getBids.data}}`
   - Sorting: по `createdAt` убывающий (новые сверху)

3. Колонки таблицы:
   - ID: `id` (Number, 60px)
   - Сумма: `amountDisplay` (Text, 120px)
   - Покупатель: `bidderDisplay` (Text, 150px)
   - Телефон: `bidderPhone` (Text, 120px)
   - Автомобиль: `carDisplay` (Text, 200px)
   - Лот: `lotDisplay` (Text, 80px)
   - Дата: `dateDisplay` (Text, 100px)
   - Время: `timeDisplay` (Text, 80px)

## Добавление фильтров:

### Фильтр по пользователю:
1. Добавьте Text Input компонент
2. Настройки:
   - Название: `userFilter`
   - Placeholder: "Поиск по имени покупателя"

### Фильтр по автомобилю:
1. Добавьте Text Input компонент
2. Настройки:
   - Название: `carFilter`
   - Placeholder: "Поиск по марке/модели"

### Применение фильтров:
Измените Data source таблицы на:
```javascript
{{getBids.data.filter(bid => 
  (!userFilter.value || bid.bidderDisplay.toLowerCase().includes(userFilter.value.toLowerCase())) &&
  (!carFilter.value || bid.carDisplay.toLowerCase().includes(carFilter.value.toLowerCase()))
)}}
```

## Добавление статистики ставок:

1. Добавьте Text компонент для отображения общей статистики:
```javascript
Всего ставок: {{getBids.data.length}}
Общая сумма: {{getBids.data.reduce((sum, bid) => sum + parseFloat(bid.amount), 0).toLocaleString()}} сомони
Уникальных покупателей: {{new Set(getBids.data.map(bid => bid.bidderId)).size}}
```

## Добавление обновления в реальном времени:

1. Добавьте Button компонент
2. Настройки:
   - Text: "Обновить"
   - Event handler: `getBids.trigger()`

3. Для автообновления добавьте JavaScript Query:
   - Name: `autoRefresh`
   - Code:
```javascript
setInterval(() => {
  getBids.trigger();
}, 30000); // обновление каждые 30 секунд
```

## Расположение компонентов:

- Фильтры в верхней части горизонтально
- Статистика под фильтрами
- Таблица ставок занимает основную часть
- Кнопка обновления в правом верхнем углу

# Шаг 6: Финальная настройка

## Создание навигации между страницами:

1. На каждой странице добавьте Navigation компонент или кнопки:
   - Dashboard
   - Пользователи  
   - Объявления
   - Ставки

2. Настройте переходы между страницами используя `utils.openPage()`

## Настройка автообновления:

На странице Dashboard добавьте автообновление статистики:
```javascript
// JavaScript Query: autoRefreshStats
setInterval(() => {
  getStats.trigger();
}, 60000); // каждую минуту
```

## Добавление уведомлений:

Для критических действий добавьте подтверждения:
1. При деактивации пользователя
2. При отклонении объявления
3. При завершении аукциона

Используйте `utils.showNotification()` для отображения результатов операций.

## Тестирование:

1. Проверьте все запросы работают корректно
2. Убедитесь что кнопки активируются/деактивируются правильно
3. Протестируйте фильтры и поиск
4. Проверьте автообновление данных

Админ-панель Retool готова к использованию!