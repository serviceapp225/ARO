# Демонстрация системы уведомлений о сообщениях

## Обзор
Система реализует стандартное поведение уведомлений в мессенджерах:
- Красный значок с цифрой 1 появляется при наличии непрочитанных сообщений
- Значок исчезает (показывает 0) после посещения страницы сообщений
- Система поддерживает оба тестовых пользователя

## Поддерживаемые пользователи
- **Пользователь ID 3**: +992 (11) 111-11-11
- **Пользователь ID 4**: +992 (90) 333-13-32

## API Endpoints для демонстрации

### 1. Проверка количества непрочитанных сообщений
```bash
# Для пользователя ID 3
curl -X GET http://localhost:5000/api/messages/unread-count/3

# Для пользователя ID 4  
curl -X GET http://localhost:5000/api/messages/unread-count/4
```

### 2. Имитация посещения страницы сообщений
```bash
# Пользователь ID 3 посетил страницу сообщений
curl -X POST http://localhost:5000/api/demo/mark-messages-visited \
  -H "Content-Type: application/json" \
  -d '{"userId": 3}'

# Пользователь ID 4 посетил страницу сообщений
curl -X POST http://localhost:5000/api/demo/mark-messages-visited \
  -H "Content-Type: application/json" \
  -d '{"userId": 4}'
```

### 3. Имитация нового сообщения (сброс счетчика)
```bash
# Сбрасывает флаги для всех пользователей - как будто пришло новое сообщение
curl -X POST http://localhost:5000/api/demo/send-test-message \
  -H "Content-Type: application/json"
```

### 4. Полный сброс демонстрации
```bash
# Возвращает систему в исходное состояние
curl -X POST http://localhost:5000/api/demo/reset-demo \
  -H "Content-Type: application/json"
```

## Полный цикл тестирования

### Тест 1: Базовый цикл уведомлений
```bash
# 1. Сброс демонстрации
curl -X POST http://localhost:5000/api/demo/reset-demo -H "Content-Type: application/json"

# 2. Проверка - должно показать 1 (красный значок)
curl -X GET http://localhost:5000/api/messages/unread-count/3
# Ожидаемый результат: {"count":1}

# 3. Имитация посещения страницы
curl -X POST http://localhost:5000/api/demo/mark-messages-visited \
  -H "Content-Type: application/json" \
  -d '{"userId": 3}'

# 4. Проверка - должно показать 0 (значок исчезает)
curl -X GET http://localhost:5000/api/messages/unread-count/3
# Ожидаемый результат: {"count":0}
```

### Тест 2: Имитация нового сообщения
```bash
# 1. Имитация нового сообщения
curl -X POST http://localhost:5000/api/demo/send-test-message -H "Content-Type: application/json"

# 2. Проверка для обоих пользователей - должно показать 1
curl -X GET http://localhost:5000/api/messages/unread-count/3
curl -X GET http://localhost:5000/api/messages/unread-count/4
# Ожидаемый результат для обоих: {"count":1}
```

### Тест 3: Независимость пользователей
```bash
# 1. Сброс демонстрации
curl -X POST http://localhost:5000/api/demo/reset-demo -H "Content-Type: application/json"

# 2. Только пользователь ID 3 посещает страницу
curl -X POST http://localhost:5000/api/demo/mark-messages-visited \
  -H "Content-Type: application/json" \
  -d '{"userId": 3}'

# 3. Проверка: пользователь 3 - 0, пользователь 4 - 1
curl -X GET http://localhost:5000/api/messages/unread-count/3  # {"count":0}
curl -X GET http://localhost:5000/api/messages/unread-count/4  # {"count":1}
```

## Ожидаемые результаты в логах

### При показе красного значка:
```
✅ ДЕМО: Показываем 1 непрочитанное сообщение для пользователя 3 (не заходил на страницу)
```

### При скрытии значка:
```
✅ ДЕМО: Показываем 0 непрочитанных сообщений для пользователя 3 (заходил на страницу)
```

### При сбросе демонстрации:
```
🔄 ДЕМО: Сброшен флаг посещения для всех пользователей - красные значки снова появятся
```

## Интеграция с фронтендом

В реальном приложении:
1. Компонент TopHeader.tsx автоматически запрашивает `/api/messages/unread-count/:userId` каждую секунду
2. Страница Messages.tsx вызывает `/api/demo/mark-messages-visited` при загрузке
3. Красный значок появляется/исчезает автоматически на основе полученных данных

## Статус
✅ Демонстрационная система работает для обоих пользователей (ID 3 и ID 4)
✅ Полный цикл уведомлений протестирован и работает корректно
✅ Система готова для демонстрации функциональности