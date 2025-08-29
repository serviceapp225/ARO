# Проверка базы данных в DigitalOcean

## 🔍 Как проверить подключение к базе данных

### Метод 1: Через скрипты диагностики (после rebuild)

```bash
# Быстрая проверка
node quick-db-check.js

# Подробная диагностика  
node check-database-connection.js
```

### Метод 2: Встроенная диагностика (работает сразу)

```bash
# Проверяем переменную окружения
echo $DATABASE_URL

# Быстрая проверка подключения
node -e "
import { neon } from '@neondatabase/serverless';
try {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql\`SELECT 1 as test\`;
  console.log('✅ База подключена');
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}
"
```

### Метод 3: Через production.js

```bash
# Посмотреть логи запуска приложения
node dist/production.js

# Ищите в логах:
# ✅ "База подключена" = OK
# ❌ "The endpoint has been disabled" = Neon отключен
# ❌ "client.query is not a function" = версии несовместимы
```

## 🚨 Типичные ошибки и решения

### Ошибка: "Cannot find module '/app/quick-db-check.js'"
**Решение:** Файлы не скопированы в Docker. Пересоберите deployment:
```bash
# Локально запустите:
./build-digitalocean.sh
# Затем заново задеплойте в DigitalOcean
```

### Ошибка: "The endpoint has been disabled"
**Решение:** Production база Neon отключена. Используйте development базу:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_8ue1HgYdlhFm@ep-crimson-tooth-adg8b4en.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Ошибка: "client.query is not a function"
**Решение:** Несовместимость версий Drizzle. Убедитесь что используется:
- drizzle-orm: 0.39.3
- @neondatabase/serverless: 0.10.4
- drizzle-zod: 0.7.1

## 🔧 Проверка через терминал DigitalOcean

1. **Откройте Console в DigitalOcean App Platform**
2. **Запустите любой из методов выше**
3. **Результат покажет состояние подключения**

## ✅ Признаки рабочей базы данных

В логах приложения должно быть:
```
🔗 Подключение к базе данных PostgreSQL
✅ DEPLOYMENT: Найдено X активных объявлений
✅ DEPLOYMENT: Найдено X пользователей в системе
✅ DEPLOYMENT: Инициализация завершена успешно
```

## ❌ Признаки проблем с базой

В логах будут ошибки:
```
Error fetching listings: The endpoint has been disabled
Error: client.query is not a function
Database connection failed
```