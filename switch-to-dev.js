#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

try {
  // Восстанавливаем development конфигурацию
  if (fs.existsSync('.replit.dev.backup')) {
    fs.copyFileSync('.replit.dev.backup', '.replit');
    console.log('✅ Восстановлена development конфигурация');
    console.log('🔧 Теперь можно работать в development режиме');
    console.log('');
    console.log('📋 Development режим:');
    console.log('   - Порт 5000 для разработки');
    console.log('   - Все 3 порта активны');
    console.log('   - Hot reload включен');
  } else {
    console.log('❌ Резервная копия .replit.dev.backup не найдена');
    console.log('💡 Создайте файл .replit.dev.backup с development конфигурацией');
  }
} catch (error) {
  console.error('❌ Ошибка:', error.message);
}