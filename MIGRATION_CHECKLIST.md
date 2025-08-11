# ✅ Чеклист миграции AutoBid.TJ на DigitalOcean App Platform

## Подготовка (сделано ✅)
- ✅ Dockerfile создан и оптимизирован
- ✅ .platform.app.yaml настроен для App Platform
- ✅ Health check endpoint `/health` добавлен
- ✅ DigitalOcean Spaces интеграция готова
- ✅ Скрипт миграции изображений подготовлен
- ✅ Production environment template создан
- ✅ PostgreSQL база `autobid-production` существует
- ✅ Spaces bucket `autobid-storage` создан

## Шаг 1: Получение учетных данных
### PostgreSQL Connection String
- [ ] Открыть DigitalOcean → Databases → autobid-production
- [ ] Скопировать connection details:
  - Host: `db-postgresql-ams3-xxxxx-do-user-xxxxx-0.b.db.ondigitalocean.com`
  - Port: `25060`
  - Username: `doadmin` (или другой)
  - Password: `xxxxxxxxxxxxx`
  - Database: `defaultdb` (или autobid_production)

### Spaces API Keys
- [ ] Открыть DigitalOcean → Settings → API
- [ ] Создать/скопировать Spaces keys:
  - Access Key: `DO00xxxxxxxxxxxxx`
  - Secret Key: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Шаг 2: Создание App Platform приложения
- [ ] DigitalOcean → Apps → Create App
- [ ] Выбрать GitHub как источник
- [ ] Подключить репозиторий AutoBid.TJ
- [ ] Настроить параметры:
  - **Source Directory**: `/`
  - **Build Command**: `npm run build`
  - **Run Command**: `npm start`
  - **HTTP Port**: `8080`
  - **Instance Size**: Basic ($12/month) или Professional ($24/month)

## Шаг 3: Настройка Environment Variables
### Обязательные переменные:
- [ ] `DATABASE_URL`: connection string из шага 1
- [ ] `NODE_ENV=production`
- [ ] `PORT=8080`
- [ ] `SESSION_SECRET`: сгенерировать 32-символьный ключ
- [ ] `SPACES_KEY`: из шага 1
- [ ] `SPACES_SECRET`: из шага 1
- [ ] `SPACES_BUCKET=autobid-storage`
- [ ] `SPACES_ENDPOINT=ams3.digitaloceanspaces.com`
- [ ] `SPACES_REGION=ams3`

### Опциональные переменные:
- [ ] `OSON_API_KEY`: для SMS (если используется)
- [ ] `SMS_FROM_NUMBER`: номер отправителя
- [ ] `ALLOWED_ORIGINS`: домен приложения (получится после создания)

## Шаг 4: Первый деплой
- [ ] Нажать "Create Resources"
- [ ] Дождаться завершения билда (5-10 минут)
- [ ] Проверить что приложение запустилось
- [ ] Получить URL: `https://your-app-name.ondigitalocean.app`
- [ ] Обновить `ALLOWED_ORIGINS` на полученный URL

## Шаг 5: Миграция данных
### База данных:
- [ ] Создать бэкап текущей БД: `pg_dump $DATABASE_URL > backup.sql`
- [ ] Импорт в DigitalOcean: `psql "новый_DATABASE_URL" < backup.sql`
- [ ] Проверить количество записей в основных таблицах

### Изображения:
- [ ] Установить переменные SPACES_* локально
- [ ] Запустить: `npm run migrate-images`
- [ ] Проверить файлы в DigitalOcean Spaces панели

## Шаг 6: Финальная проверка
- [ ] Открыть App Platform URL
- [ ] Проверить основные функции:
  - [ ] Регистрация/вход работает
  - [ ] Объявления отображаются
  - [ ] Изображения загружаются
  - [ ] Ставки принимаются
  - [ ] WebSocket соединение работает
- [ ] Проверить логи в App Platform Dashboard
- [ ] Убедиться что health check проходит

## Шаг 7: DNS и производство
- [ ] Настроить custom domain (если нужно)
- [ ] Обновить DNS записи
- [ ] SSL сертификат автоматически настроится
- [ ] Уведомить пользователей о новом домене

## Откат (в случае проблем)
- [ ] Вернуться к старому серверу
- [ ] Восстановить базу данных из бэкапа
- [ ] Переключить DNS обратно

## Стоимость после миграции
- **App Platform**: $12-24/месяц (Basic/Professional)
- **PostgreSQL**: $15/месяц (1GB)
- **Spaces**: $5/месяц (250GB трафика)
- **Итого**: ~$32-44/месяц

## Контакты поддержки
- DigitalOcean Support: через тикет систему
- App Platform документация: docs.digitalocean.com/products/app-platform/