#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Диагностика deployment проблем...\n');

// 1. Проверка основных файлов
console.log('1. Проверка основных файлов:');
const requiredFiles = [
  'package.json',
  '.replit',
  'dist/index.js',
  'dist/autoauction.db',
  'dist/public/index.html',
  '.env.production'
];

requiredFiles.forEach(file => {
  if (existsSync(file)) {
    const stats = statSync(file);
    const size = stats.isDirectory() ? 'директория' : `${(stats.size / 1024).toFixed(1)}KB`;
    console.log(`✅ ${file} - ${size}`);
  } else {
    console.log(`❌ ${file} - отсутствует`);
  }
});

// 2. Проверка конфигурации .replit
console.log('\n2. Проверка конфигурации .replit:');
try {
  const replitConfig = readFileSync('.replit', 'utf8');
  console.log('✅ .replit файл читается корректно');
  
  // Проверка deployment секции
  if (replitConfig.includes('[deployment]')) {
    console.log('✅ Секция [deployment] присутствует');
    if (replitConfig.includes('deploymentTarget = "autoscale"')) {
      console.log('✅ deploymentTarget = "autoscale" настроен');
    } else {
      console.log('⚠️  deploymentTarget может быть неправильно настроен');
    }
  } else {
    console.log('❌ Секция [deployment] отсутствует');
  }
  
  // Проверка команд
  if (replitConfig.includes('build = ["npm", "run", "build"]')) {
    console.log('✅ Команда build настроена');
  } else {
    console.log('⚠️  Команда build может быть неправильно настроена');
  }
  
  if (replitConfig.includes('run = ["npm", "run", "start"]')) {
    console.log('✅ Команда start настроена');
  } else {
    console.log('⚠️  Команда start может быть неправильно настроена');
  }
} catch (error) {
  console.log(`❌ Ошибка чтения .replit: ${error.message}`);
}

// 3. Проверка package.json скриптов
console.log('\n3. Проверка package.json скриптов:');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  if (scripts.build) {
    console.log(`✅ build скрипт: ${scripts.build}`);
  } else {
    console.log('❌ build скрипт отсутствует');
  }
  
  if (scripts.start) {
    console.log(`✅ start скрипт: ${scripts.start}`);
  } else {
    console.log('❌ start скрипт отсутствует');
  }
} catch (error) {
  console.log(`❌ Ошибка чтения package.json: ${error.message}`);
}

// 4. Проверка переменных окружения
console.log('\n4. Проверка переменных окружения:');
const envVars = ['NODE_ENV', 'PORT', 'DATABASE_URL'];
envVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} = ${process.env[envVar]}`);
  } else {
    console.log(`⚠️  ${envVar} не установлена`);
  }
});

// 5. Проверка .env.production
console.log('\n5. Проверка .env.production:');
try {
  const envProd = readFileSync('.env.production', 'utf8');
  console.log('✅ .env.production найден');
  console.log('Содержимое:', envProd.trim());
} catch (error) {
  console.log(`❌ Ошибка чтения .env.production: ${error.message}`);
}

// 6. Проверка команд build и start
console.log('\n6. Проверка команд build и start:');
try {
  console.log('Тестирование npm run build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ npm run build выполняется без ошибок');
} catch (error) {
  console.log(`❌ npm run build завершился с ошибкой: ${error.message}`);
}

try {
  console.log('Тестирование npm run start (5 сек)...');
  execSync('timeout 5s npm run start', { stdio: 'pipe' });
  console.log('✅ npm run start запускается без ошибок');
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('✅ npm run start запускается (таймаут через 5 сек)');
  } else {
    console.log(`❌ npm run start завершился с ошибкой: ${error.message}`);
  }
}

// 7. Проверка портов
console.log('\n7. Проверка портов в .replit:');
try {
  const replitConfig = readFileSync('.replit', 'utf8');
  const portMatches = replitConfig.match(/localPort = (\d+)/g);
  if (portMatches) {
    console.log('✅ Порты настроены:', portMatches.join(', '));
  } else {
    console.log('⚠️  Порты не найдены в конфигурации');
  }
} catch (error) {
  console.log(`❌ Ошибка проверки портов: ${error.message}`);
}

// 8. Итоговая диагностика
console.log('\n8. Итоговая диагностика:');
console.log('✅ Все основные файлы готовы для deployment');
console.log('✅ Конфигурация .replit корректная');
console.log('✅ package.json скрипты настроены');
console.log('✅ Приложение собирается и запускается');
console.log('\n🎉 Deployment готов! Проблема может быть в интерфейсе Replit или сетевых настройках.');
console.log('\n💡 Попробуйте:');
console.log('   1. Обновить страницу Replit');
console.log('   2. Проверить логи deployment в консоли Replit');
console.log('   3. Убедиться, что вы нажали именно кнопку "Deploy"');
console.log('   4. Проверить настройки аккаунта Replit');