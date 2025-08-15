#!/usr/bin/env node

// Финальный скрипт сборки для DigitalOcean App Platform
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 DigitalOcean: Начинаем финальную сборку...');

// 1. Сборка фронтенда
console.log('📦 Собираем frontend...');
execSync('npx vite build --config vite.digitalocean.mjs', { stdio: 'inherit' });

// 2. Копируем production.ts в dist как production.js
console.log('📋 Копируем server файл...');
const serverContent = fs.readFileSync('server/production.ts', 'utf8');

// Тщательная очистка TypeScript синтаксиса
const jsContent = serverContent
  // Убираем все TypeScript типы и аннотации
  .replace(/import type .+?;/g, '')
  .replace(/: \s*Express\b/g, '')
  .replace(/: \s*express\.[A-Za-z]+/g, '')
  .replace(/: \s*NextFunction/g, '')
  .replace(/: \s*Request/g, '')  
  .replace(/: \s*Response/g, '')
  .replace(/: \s*Error/g, '')
  .replace(/: \s*string/g, '')
  .replace(/: \s*number/g, '')
  .replace(/: \s*boolean/g, '')
  .replace(/ as string/g, '')
  .replace(/ as number/g, '')
  .replace(/\(\s*req:\s*[^,)]+,\s*res:\s*[^,)]+,\s*next:\s*[^)]+\)/g, '(req, res, next)')
  .replace(/\(\s*err:\s*[^,)]+,\s*req:\s*[^,)]+,\s*res:\s*[^,)]+,\s*next:\s*[^)]+\)/g, '(err, req, res, next)');

// Создаем dist директорию если нет
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Сохраняем как JS файл
fs.writeFileSync('dist/production.js', jsContent);

// 3. Копируем необходимые файлы
console.log('📂 Копируем вспомогательные файлы...');

// Копируем routes если есть (компилированная версия не нужна, tsx справится)
if (fs.existsSync('server/routes.ts')) {
  fs.copyFileSync('server/routes.ts', 'dist/routes.ts');
}

console.log('✅ Сборка завершена!');
console.log('📁 Структура dist:');
const distFiles = fs.readdirSync('dist', { withFileTypes: true });
distFiles.forEach(file => {
  if (file.isFile()) {
    const stats = fs.statSync(path.join('dist', file.name));
    console.log(`   ${file.name} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`   ${file.name}/ (папка)`);
  }
});