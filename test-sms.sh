#!/bin/bash
# Тест SMS через VPS прокси
# Использование: ./test-sms.sh НОМЕР_ТЕЛЕФОНА "СООБЩЕНИЕ"

PHONE=${1:-"992903331332"}
MESSAGE=${2:-"Тест SMS от AUTOBID.TJ"}

echo "Тестируем SMS на номер: $PHONE"
echo "Сообщение: $MESSAGE"

# Простой хеш пароля
SIMPLE_HASH=$(echo -n "oson2024" | sha256sum | cut -d" " -f1)
echo "Простой хеш пароля: $SIMPLE_HASH"

echo ""
echo "=== ТЕСТ 1: Простой хеш пароля ==="
curl -X POST http://188.166.61.86:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d "{
    \"login\": \"zarex\",
    \"hash\": \"$SIMPLE_HASH\",
    \"sender\": \"OsonSMS\",
    \"to\": \"$PHONE\",
    \"text\": \"$MESSAGE\"
  }" \
  --connect-timeout 10

echo ""
echo ""
echo "=== ТЕСТ 2: Предоставленный хеш ==="
curl -X POST http://188.166.61.86:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d "{
    \"login\": \"zarex\",
    \"hash\": \"a6d5d8b47551199899862d6d768a4cb1\",
    \"sender\": \"OsonSMS\",
    \"to\": \"$PHONE\",
    \"text\": \"$MESSAGE\"
  }" \
  --connect-timeout 10

echo ""

