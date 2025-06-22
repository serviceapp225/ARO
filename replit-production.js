#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import express from 'express';
import { createServer } from 'http';

console.log('🚀 Запуск Replit продакшн деплоя...');

// Настройки продакшн окружения
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 5000;

// Функция для остановки существующих процессов
function killExistingProcesses() {
  try {
    execSync('pkill -f "tsx.*server/index"', { stdio: 'ignore' });
  } catch (e) {
    // Процессы не найдены - это нормально
  }
}

// Основная функция деплоя
async function deploy() {
  try {
    console.log('Остановка существующих процессов...');
    killExistingProcesses();
    
    console.log('Проверка собранных файлов...');
    if (!existsSync('./dist/index.js')) {
      console.log('Собранные файлы не найдены, выполняю сборку...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    console.log('Запуск продакшн сервера...');
    
    // Импорт и запуск собранного сервера
    const serverModule = await import('./dist/index.js');
    
    console.log(`✅ Продакшн сервер запущен на порту ${PORT}`);
    console.log(`🌐 Приложение доступно по адресу: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    
  } catch (error) {
    console.error('❌ Ошибка деплоя:', error.message);
    
    // Фоллбэк - запуск без сборки
    console.log('Попытка запуска без пересборки...');
    try {
      const fallbackModule = await import('./dist/index.js');
      console.log('✅ Сервер запущен в режиме фоллбэк');
    } catch (fallbackError) {
      console.error('❌ Критическая ошибка:', fallbackError.message);
      process.exit(1);
    }
  }
}

// Запуск деплоя
deploy();