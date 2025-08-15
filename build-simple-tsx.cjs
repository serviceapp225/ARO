const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DigitalOcean: TypeScript Build (tsx runtime)');

// 1. Собираем frontend через Vite
console.log('📦 Собираем frontend...');
execSync('npx vite build', { stdio: 'inherit' });

// 2. Создаем dist директорию если нет
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// 3. Копируем TypeScript файлы как есть (tsx runtime справится)
console.log('📋 Копируем TypeScript файлы...');
fs.copyFileSync('server/production.ts', 'dist/production.ts');
fs.copyFileSync('server/routes.ts', 'dist/routes.ts');

// 4. Создаем структуру server/ для DigitalOcean
if (!fs.existsSync('dist/server')) {
  fs.mkdirSync('dist/server', { recursive: true });
}
fs.copyFileSync('server/production.ts', 'dist/server/production.ts');
fs.copyFileSync('server/routes.ts', 'dist/server/routes.ts');

// 5. Копируем специальный package.json для DigitalOcean (с Vite в dependencies)
if (fs.existsSync('package.digitalocean.json')) {
  fs.copyFileSync('package.digitalocean.json', 'dist/package.json');
  console.log('✅ Используем package.digitalocean.json (Vite в dependencies)');
} else {
  fs.copyFileSync('package.json', 'dist/package.json');
  console.log('⚠️ Используем стандартный package.json');
}

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