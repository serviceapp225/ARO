# 🚀 Полная версия AutoBid.TJ - Развертывание

## 📦 Доступные архивы

| Файл | Размер | Описание |
|------|--------|----------|
| `autobid-small.tar.gz` | **58KB** | Основные файлы (рекомендуется для первого запуска) |
| `autobid-full.tar.gz` | **~3MB** | Полная версия со всеми ресурсами |

## 🎯 РЕКОМЕНДУЕМЫЙ ПЛАН РАЗВЕРТЫВАНИЯ

### Этап 1: Быстрый запуск (5 мин)
```bash
# Скачать небольшой архив (58KB)
# autobid-small.tar.gz содержит:
# - dist/index.js (основной файл приложения)
# - package.json (зависимости)
# - .env.production (конфигурация)
# - deploy-digitalocean.sh (скрипт развертывания)
```

### Этап 2: SSH развертывание
```bash
# 1. Подключиться к VPS
ssh root@188.166.61.86

# 2. Создать директорию
mkdir -p ~/autobid-tj && cd ~/autobid-tj

# 3. Загрузить файл на VPS (выберите способ):
```

**Способ A: SCP (если архив скачался)**
```bash
# На локальном компьютере:
scp autobid-small.tar.gz root@188.166.61.86:~/autobid-tj/

# На VPS:
tar -xzf autobid-small.tar.gz
```

**Способ B: Wget (если файл в облаке)**
```bash
# Загрузите архив в Google Drive/Dropbox
# Получите прямую ссылку
wget "прямая-ссылка" -O autobid-small.tar.gz
tar -xzf autobid-small.tar.gz
```

**Способ C: Создать файлы вручную**
```bash
# Если ничего не работает, создать файлы на VPS прямо из консоли
# (см. MANUAL_VPS_DEPLOYMENT.md)
```

### Этап 3: Запуск на VPS
```bash
# Установить Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Запустить скрипт развертывания
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh

# Или запустить вручную:
npm install --production
sudo cp .env.production /root/autobid-tj/.env
node dist/index.js
```

## 🔧 Автоматический скрипт развертывания

Файл `deploy-digitalocean.sh` выполнит все автоматически:
- Установит зависимости
- Настроит systemd службу
- Настроит nginx прокси
- Запустит приложение
- Настроит автозапуск

## 📋 После развертывания

**Проверьте работу:**
- http://188.166.61.86 - основное приложение
- http://188.166.61.86/health - проверка здоровья
- http://188.166.61.86:3000/api/health - SMS сервис

**Полезные команды:**
```bash
# Просмотр логов
sudo journalctl -u autobid -f

# Перезапуск
sudo systemctl restart autobid

# Статус
sudo systemctl status autobid
```

## 🚀 Полная версия (autobid-full.tar.gz)

После успешного запуска базовой версии можно обновиться до полной:

```bash
# Скачать полную версию
wget "ссылка-на-полную-версию" -O autobid-full.tar.gz

# Остановить текущее приложение
sudo systemctl stop autobid

# Распаковать полную версию
tar -xzf autobid-full.tar.gz

# Перезапустить
sudo systemctl start autobid
```

## 🎯 Итоговый результат

После развертывания получите:
- ✅ Рабочее приложение на http://188.166.61.86
- ✅ Автоматический запуск при перезагрузке сервера  
- ✅ SMS уведомления через прокси
- ✅ База данных PostgreSQL
- ✅ Nginx обратный прокси
- ✅ Systemd управление службами

**Время развертывания:** 5-15 минут в зависимости от способа загрузки файлов.