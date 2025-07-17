#!/usr/bin/env node

// Исправленная версия production сборки для решения проблем deployment
import { execSync } from 'child_process';
import { copyFileSync, existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import path from 'path';

console.log('🚀 Исправленная сборка для Replit deployment...\n');

try {
  // 1. Очистка dist папки
  console.log('1. Очистка dist папки...');
  execSync('rm -rf dist', { stdio: 'inherit' });
  mkdirSync('dist', { recursive: true });

  // 2. Сборка фронтенда
  console.log('2. Сборка фронтенда...');
  execSync('vite build', { stdio: 'inherit' });

  // 3. Создание TypeScript конфигурации для production
  console.log('3. Создание TypeScript конфигурации...');
  const tsConfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ES2020",
      "moduleResolution": "node",
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "strict": false,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": false,
      "outDir": "./dist",
      "rootDir": "./",
      "baseUrl": ".",
      "paths": {
        "@shared/*": ["./shared/*"]
      }
    },
    "include": [
      "server/**/*",
      "shared/**/*"
    ],
    "exclude": [
      "node_modules",
      "dist",
      "client"
    ]
  };
  
  writeFileSync('tsconfig.production.json', JSON.stringify(tsConfig, null, 2));

  // 4. Создание исправленной версии server/index.ts без TypeScript ошибок
  console.log('4. Создание исправленной версии сервера...');
  const serverCode = `
import express from "express";
import compression from "compression";
import { registerRoutes } from "./routes.js";
import { initializeDatabaseWithSampleData } from "./initDatabase.js";
import { createTables } from "./createTables.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
const envPath = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Включаем компрессию
app.use(compression({
  threshold: 0,
  level: 6
}));

// Заголовки кэширования
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=60');
  } else if (req.path.match(/\\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация базы данных
async function initializeDatabase() {
  try {
    await createTables();
    await initializeDatabaseWithSampleData();
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
  }
}

// Регистрация роутов
registerRoutes(app);

// Fallback для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 Сервер запущен на порту \${PORT}\`);
    console.log(\`🌍 Доступен по адресу: http://0.0.0.0:\${PORT}\`);
    console.log(\`📊 Режим: \${process.env.NODE_ENV || 'production'}\`);
  });
}

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer().catch(console.error);
`;

  writeFileSync('server/index.production.js', serverCode);

  // 5. Компиляция TypeScript в JavaScript
  console.log('5. Компиляция TypeScript...');
  try {
    execSync('npx tsc -p tsconfig.production.json --outDir dist --module ES2020 --target ES2020 --moduleResolution node', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  TypeScript ошибки проигнорированы, используем esbuild...');
    
    // Альтернативная сборка с esbuild
    execSync('npx esbuild server/index.production.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  }

  // 6. Копирование базы данных
  console.log('6. Копирование базы данных...');
  if (existsSync('autoauction.db')) {
    copyFileSync('autoauction.db', 'dist/autoauction.db');
    console.log('✅ База данных скопирована');
  } else {
    console.log('⚠️  База данных не найдена');
  }

  // 7. Создание package.json для production
  console.log('7. Создание package.json для production...');
  const prodPackage = {
    "name": "autoauction-production",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "compression": "^1.7.4",
      "better-sqlite3": "^8.7.0"
    }
  };
  
  writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

  // 8. Создание .env файла для production
  console.log('8. Создание .env файла...');
  const envContent = `NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:./autoauction.db
`;
  writeFileSync('dist/.env', envContent);

  // 9. Очистка временных файлов
  console.log('9. Очистка временных файлов...');
  if (existsSync('tsconfig.production.json')) {
    execSync('rm tsconfig.production.json');
  }
  if (existsSync('server/index.production.js')) {
    execSync('rm server/index.production.js');
  }

  // 10. Проверка результата
  console.log('10. Проверка результата...');
  execSync('ls -la dist/', { stdio: 'inherit' });
  
  console.log('\n✅ Исправленная сборка завершена успешно!');
  console.log('\n📋 Для запуска в production:');
  console.log('   cd dist/');
  console.log('   PORT=3000 NODE_ENV=production node index.js');
  
} catch (error) {
  console.error('❌ Ошибка сборки:', error.message);
  process.exit(1);
}