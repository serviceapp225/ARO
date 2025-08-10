# Руководство по миграции приложения на DigitalOcean

## Полная инфраструктура DigitalOcean

### ✅ Настроенная инфраструктура:
- **PostgreSQL**: `autobid-production` кластер в Amsterdam (AMS3) - $15.15/месяц
- **Spaces**: `autobid-storage` в Amsterdam (AMS3) - $5/месяц  
- **VPS**: `Sms-proxy` IP 188.166.61.86, 4GB RAM - $24/месяц ✅
- **Итого**: $44.15/месяц

### 🎯 План миграции:
- **Приложение** → VPS `Sms-proxy` (полная миграция с Replit)
- **База данных** → PostgreSQL DigitalOcean
- **Изображения** → Spaces DigitalOcean  
- **SMS** → продолжает работать через тот же VPS

### 📋 Данные для настройки VPS:

#### 1. PostgreSQL подключение:
```env
DATABASE_URL=postgresql://doadmin:ВАШ_ПАРОЛЬ@autobid-production-do-user-24204575-0.m.db.ondigitalocean.com:25060/autobid_db?sslmode=require
```

#### 2. DigitalOcean Spaces:
```env
DO_SPACES_ENDPOINT=ams3.digitaloceanspaces.com
DO_SPACES_BUCKET=autobid-storage
DO_SPACES_ACCESS_KEY=ВАШ_ACCESS_KEY
DO_SPACES_SECRET_KEY=ВАШ_SECRET_KEY
DO_SPACES_CDN_ENDPOINT=https://autobid-storage.ams3.cdn.digitaloceanspaces.com
```

## Пошаговая миграция:

### Шаг 1: Подготовка VPS
1. **VPS готов**: 4GB RAM ✅
2. **Подключение к VPS**: `ssh root@188.166.61.86`

### Шаг 2: Установка приложения
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs git

# Клонирование репозитория
git clone ВАШ_РЕПОЗИТОРИЙ_URL autobid-tj
cd autobid-tj

# Установка зависимостей  
npm install

# Создание .env файла
cp .env.production.do .env
```

### Шаг 3: Настройка переменных окружения
```bash
nano .env
```

**Заполнить:**
- `DATABASE_URL` - строка подключения PostgreSQL
- `DO_SPACES_ACCESS_KEY` - Access Key от Spaces
- `DO_SPACES_SECRET_KEY` - Secret Key от Spaces
- `SESSION_SECRET` - уникальный секрет сессий

### Шаг 4: Инициализация базы данных
```bash
# Применение схемы к новой PostgreSQL БД
npm run db:push
```

### Шаг 5: Миграция изображений в Spaces
```bash
# Запуск скрипта миграции изображений
node server/scripts/migrateToSpaces.js
```

### Шаг 6: Сборка и запуск
```bash
# Сборка приложения
npm run build

# Запуск в production режиме
npm start
```

### Шаг 7: Настройка домена
1. **DNS запись**: `autobid.tj` → `188.166.61.86`
2. **Nginx конфигурация** (если необходимо)
3. **SSL сертификат** через Let's Encrypt

## Преимущества DigitalOcean инфраструктуры:

### 🚀 Производительность:
- **Managed PostgreSQL**: автоматические бэкапы, масштабирование
- **Spaces CDN**: быстрая доставка изображений по всему миру
- **Amsterdam датацентр**: оптимальная локация для СНГ

### 🔒 Безопасность:
- **Trusted Sources**: доступ к PostgreSQL только с VPS IP
- **Encrypted connections**: SSL/TLS для всех соединений
- **Automatic backups**: ежедневные бэкапы PostgreSQL

### 💰 Стоимость:
- **Фиксированная цена**: $44/месяц за полную инфраструктуру
- **Без комиссий**: за трафик и хранение (в лимитах Spaces)
- **Масштабируемость**: легкое увеличение мощности при росте

## Мониторинг и обслуживание:

### 📊 Мониторинг:
- **PostgreSQL**: метрики в панели DigitalOcean
- **Spaces**: статистика использования  
- **VPS**: мониторинг ресурсов

### 🛠️ Обслуживание:
- **PostgreSQL**: автоматические обновления
- **Backups**: автоматические ежедневные бэкапы
- **SSL certificates**: автообновление

## Rollback план:

### В случае проблем:
1. **Сохранить данные**: экспорт PostgreSQL
2. **Восстановить VPS**: из бэкапа или переустановка  
3. **Переключить DNS**: на резервный сервер
4. **Импорт данных**: в резервную БД

## Тестирование после миграции:

### ✅ Чек-лист:
- [ ] Подключение к PostgreSQL работает
- [ ] Загрузка/отображение изображений через Spaces
- [ ] SMS уведомления работают
- [ ] WebSocket соединения стабильны
- [ ] Все функции аукциона работают
- [ ] Производительность удовлетворительная

### 🔧 Инструменты тестирования:
```bash
# Тест подключения к PostgreSQL
npm run test:db

# Тест загрузки в Spaces  
npm run test:storage

# Тест SMS API
npm run test:sms
```

Готовы начинать миграцию?