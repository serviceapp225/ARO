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

// 3. Конвертируем routes.ts в routes.js
console.log('📂 Конвертируем routes.ts в routes.js...');

if (fs.existsSync('server/routes.ts')) {
  const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
  const routesJs = routesContent
    // Убираем import type декларации полностью
    .replace(/import type .+?;/g, '')
    .replace(/import\s*{[^}]*type\s+[^}]*}/g, (match) => {
      return match.replace(/,?\s*type\s+\w+/g, '').replace(/{\s*,/, '{').replace(/,\s*}/, '}');
    })
    // Убираем все типы из импортов
    .replace(/,\s*type\s+\w+/g, '')
    .replace(/type\s+\w+\s*,/g, '')
    // Убираем все аннотации типов
    .replace(/: \s*[A-Z][a-zA-Z]*(\[\])?/g, '')
    .replace(/: \s*[a-z][a-zA-Z]*(\[\])?/g, '')  
    .replace(/: \s*\w+\.\w+/g, '')
    .replace(/ as \w+/g, '')
    .replace(/\(\s*\w+:\s*[^,)]+,\s*\w+:\s*[^,)]+,\s*\w+:\s*[^)]+\)/g, (match) => {
      const params = match.slice(1, -1).split(',').map(p => p.split(':')[0].trim());
      return `(${params.join(', ')})`;
    });

  fs.writeFileSync('dist/routes.js', routesJs);
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