#!/usr/bin/env node

// Production entry point for Replit deployment
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Запуск автоаукциона...');

// Установка переменных окружения
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

async function startApp() {
  try {
    // Проверка сборки
    if (!fs.existsSync('./dist/index.js')) {
      console.log('Выполнение сборки...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    console.log('Запуск сервера...');
    
    // Импорт и запуск
    require('./dist/index.js');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
    
    // Запасной вариант - прямой запуск без сборки
    console.log('Запуск в режиме разработки...');
    execSync('npm run dev', { stdio: 'inherit' });
  }
}

startApp();