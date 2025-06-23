# Шаг 1: Настройка Environment Variables в Retool

## В Retool приложении:

1. Нажмите на Settings (шестеренка) в правом верхнем углу
2. Выберите "Environment variables"
3. Добавьте эти переменные:

```
API_BASE_URL = http://localhost:5000
ADMIN_SECRET = retool-admin-key-2024
```

**Для продакшна замените на:**
```
API_BASE_URL = https://ваш-домен.replit.app
ADMIN_SECRET = retool-admin-key-2024
```

## Проверка подключения:

Создайте тестовый запрос:
- Type: REST API
- URL: `{{API_BASE_URL}}/api/admin/stats`
- Method: GET
- Headers: `x-admin-key: {{ADMIN_SECRET}}`

Должен вернуть JSON с данными статистики.