# DigitalOcean SQLite Fix

## Проблема

При деплое в DigitalOcean возникает ошибка компиляции пакета `better-sqlite3`:

```
npm error code 1
npm error path /app/node_modules/better-sqlite3
npm error command failed
```

## Причина

- `better-sqlite3` требует компиляции C++ кода
- В DigitalOcean отсутствуют build инструменты (Python, make, g++)
- В production должен использоваться только PostgreSQL

## Решение

### 1. Файлы созданы:

- **`package.digitalocean.json`** - версия без SQLite зависимостей
- **`package.digitalocean.minimal.json`** - минимальная версия без проблемных пакетов
- **`build-digitalocean.sh`** - скрипт автоматической сборки
- **Обновленный `Dockerfile`** - использует минимальный production package.json

### 2. Изменения в зависимостях:

**Убрано из production:**
- `better-sqlite3` и `@types/better-sqlite3`
- `@replit/vite-plugin-cartographer` (не найден в npm)
- `@replit/vite-plugin-runtime-error-modal` (Replit-специфичный)
- `@tailwindcss/vite` (alpha версия)
- `start`, `run`, `build` (deprecated пакеты)

**Минимальная версия включает только:**
- Основные runtime зависимости
- React и UI компоненты
- PostgreSQL драйвер
- Express сервер

### 3. Как деплоить в DigitalOcean:

```bash
# Запустить автоматическую сборку
./build-digitalocean.sh

# Или вручную:
cp package.digitalocean.json package.json
npm install
npm run build
```

### 4. Архитектура базы данных:

- **Development:** SQLite (быстро, локально)
- **Production:** PostgreSQL (надежно, масштабируемо)

## Результат

✅ Компиляция в DigitalOcean проходит без ошибок
✅ Приложение использует только PostgreSQL в production
✅ Development окружение работает с SQLite как прежде
✅ Автоматизированная сборка через скрипт

## Дополнительная информация

Предупреждения о deprecated пакетах не критичны:
- `wrench@1.3.9` - заменен на `fs-extra`
- `start@5.1.0` - deprecated
- `querystring@0.2.0` - заменен на `URLSearchParams`

Основная проблема была именно с компиляцией `better-sqlite3`.