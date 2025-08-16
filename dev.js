#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Запускаем tsx в режиме watch для сервера
const serverPath = path.join(__dirname, 'server', 'index.ts');
console.log('🚀 Запускаем сервер разработки...');
console.log('📍 Файл сервера:', serverPath);

const tsxProcess = spawn('npx', ['tsx', 'watch', serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

tsxProcess.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
});

tsxProcess.on('exit', (code) => {
  console.log(`🔄 Сервер завершил работу с кодом: ${code}`);
});

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n👋 Завершение работы...');
  tsxProcess.kill('SIGINT');
  process.exit(0);
});