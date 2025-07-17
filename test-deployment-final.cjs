#!/usr/bin/env node

// Финальный тест готовности к deployment
console.log("🚀 ТЕСТ ГОТОВНОСТИ К DEPLOYMENT - AUTOBID.TJ");
console.log("=" .repeat(50));

// Проверка переменных окружения
console.log("📋 Проверка переменных окружения:");
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'не установлено'}`);
console.log(`PORT: ${process.env.PORT || 'не установлено'}`);

// Проверка наличия файлов
const fs = require('fs');
const path = require('path');

console.log("\n📁 Проверка файлов:");
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html',
  'dist/autoauction.db',
  'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Проверка размера файлов
console.log("\n📊 Размер файлов:");
try {
  const serverSize = fs.statSync('dist/index.js').size;
  const dbSize = fs.statSync('dist/autoauction.db').size;
  const publicSize = fs.statSync('dist/public/index.html').size;
  
  console.log(`Сервер: ${(serverSize / 1024).toFixed(1)}KB`);
  console.log(`База данных: ${(dbSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Фронтенд: ${(publicSize / 1024).toFixed(1)}KB`);
  
  const totalSize = serverSize + dbSize + publicSize;
  console.log(`Общий размер: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
} catch (error) {
  console.log("❌ Ошибка при проверке размеров файлов");
}

// Проверка package.json
console.log("\n📦 Проверка package.json:");
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ start команда: ${packageJson.scripts.start}`);
  console.log(`✅ build команда: ${packageJson.scripts.build}`);
} catch (error) {
  console.log("❌ Ошибка при чтении package.json");
}

// Проверка .replit конфигурации
console.log("\n⚙️ Проверка .replit конфигурации:");
try {
  const replitConfig = fs.readFileSync('.replit', 'utf8');
  const hasDeployment = replitConfig.includes('[deployment]');
  const hasPortConfig = replitConfig.includes('localPort = 3000');
  
  console.log(`${hasDeployment ? '✅' : '❌'} Deployment конфигурация`);
  console.log(`${hasPortConfig ? '✅' : '❌'} Порт 3000 настроен`);
} catch (error) {
  console.log("❌ Ошибка при чтении .replit");
}

// Итоговый статус
console.log("\n" + "=" .repeat(50));
if (allFilesExist) {
  console.log("🎉 ГОТОВО К DEPLOYMENT!");
  console.log("Следующие шаги:");
  console.log("1. Убедитесь что PORT=3000 в production");
  console.log("2. Нажмите кнопку 'Deploy' в Replit");
  console.log("3. Дождитесь завершения deployment");
  console.log("4. Проверьте работу на deployment URL");
} else {
  console.log("❌ НЕ ГОТОВО К DEPLOYMENT");
  console.log("Исправьте отсутствующие файлы перед deployment");
}

console.log("\n🔗 Для диагностики используйте:");
console.log("- /api/health - Health check");
console.log("- /api/database-status - Статус БД");
console.log("=" .repeat(50));