const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DigitalOcean: TypeScript Build (tsx runtime)');

// 1. Собираем frontend через Vite
console.log('📦 Собираем frontend...');
execSync('npx vite build --config vite.digitalocean.mjs', { stdio: 'inherit' });

// 2. Создаем dist директорию если нет
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// 3. Копируем TypeScript файлы как есть (tsx runtime справится)
console.log('📋 Копируем TypeScript файлы...');
fs.copyFileSync('server/production.ts', 'dist/production.ts');
fs.copyFileSync('server/routes.ts', 'dist/routes.ts');

// 4. Копируем package.json для зависимостей
fs.copyFileSync('package.json', 'dist/package.json');

console.log('✅ TypeScript сборка завершена!');
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