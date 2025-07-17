#!/usr/bin/env node

// Скрипт для исправления проблемы с портами в deployment
// Принудительно устанавливает PORT=5000 для всех режимов

import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔧 Исправление проблемы с портами...');
console.log('📌 Принудительно устанавливаем PORT=5000 для всех режимов');

// Принудительно устанавливаем переменную окружения
process.env.PORT = '5000';
process.env.NODE_ENV = 'production';

console.log('✅ Переменные окружения установлены:');
console.log('   PORT =', process.env.PORT);
console.log('   NODE_ENV =', process.env.NODE_ENV);

// Запускаем сервер
const server = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000',
    NODE_ENV: 'production'
  }
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🔚 Сервер завершен с кодом ${code}`);
  process.exit(code);
});

// Обработка завершения процесса
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершаем сервер...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершаем сервер...');
  server.kill('SIGINT');
});