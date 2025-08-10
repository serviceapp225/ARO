# Команды для миграции на DigitalOcean

## После настройки .env файла на VPS:

### Тестирование инфраструктуры:
```bash
# Тест всей инфраструктуры
node server/scripts/testInfrastructure.js

# Отдельные тесты
node -e "import('./server/scripts/testInfrastructure.js').then(m => m.testPostgreSQL())"
node -e "import('./server/scripts/testInfrastructure.js').then(m => m.testDigitalOceanSpaces())"
node -e "import('./server/scripts/testInfrastructure.js').then(m => m.testSMS())"
```

### Миграция изображений:
```bash
# Миграция всех изображений в Spaces
node server/scripts/migrateToSpaces.js
```

### Сборка и запуск:
```bash
# Инициализация БД
npm run db:push

# Сборка приложения
npm run build

# Запуск в продакшене
npm start
```

## Файлы созданы:
- ✅ `.env.production.do` - шаблон переменных окружения
- ✅ `server/services/digitalOceanStorage.ts` - сервис работы с Spaces
- ✅ `server/scripts/testInfrastructure.js` - тесты инфраструктуры
- ✅ `server/scripts/migrateToSpaces.js` - миграция изображений
- ✅ `DIGITALOCEAN_MIGRATION_GUIDE.md` - полное руководство

## Готовность к миграции: ✅ 100%