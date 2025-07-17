#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 DEPLOYMENT DEBUG для Replit');

// Создаем debug версию сервера с детальными логами
const serverCode = `
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

console.log('🚀 НАЧАЛО DEPLOYMENT СЕРВЕРА');
console.log('Node версия:', process.version);
console.log('Платформа:', process.platform);
console.log('Рабочая директория:', process.cwd());
console.log('PORT из env:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Проверяем файлы
const checkFiles = () => {
  const files = ['autoauction.db', 'public/index.html', '.env'];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log('✅ Файл найден:', file);
    } else {
      console.log('❌ Файл не найден:', file);
    }
  });
};

checkFiles();

// Импортируем оригинальный сервер
console.log('📥 Импортируем оригинальный сервер...');
`;

// Читаем оригинальный index.js
const originalServer = fs.readFileSync('dist/index.js', 'utf8');

// Создаем debug версию
const debugServer = serverCode + originalServer;

// Сохраняем debug версию
fs.writeFileSync('dist/index-debug.js', debugServer);

// Обновляем package.json для debug
const pkg = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
pkg.scripts.start = 'node index-debug.js';
fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

console.log('✅ Создана debug версия сервера');
console.log('✅ Обновлен package.json');
console.log('');
console.log('🎯 ИНСТРУКЦИИ:');
console.log('1. Теперь при deployment будут видны детальные логи');
console.log('2. Нажмите кнопку Deploy в Replit');
console.log('3. Если возникнут ошибки, они будут видны в логах deployment');
console.log('4. Пришлите мне логи, если появятся ошибки');
console.log('');
console.log('📋 Теперь приложение готово к deployment с детальными логами!');