#!/usr/bin/env node

// Универсальный стартовый скрипт для DigitalOcean
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== DigitalOcean Production Starter ===');
console.log('Working directory:', process.cwd());
console.log('Contents:', fs.readdirSync('.').join(', '));

// Определяем базовую директорию (DigitalOcean использует /workspace)
const baseDir = process.cwd().includes('/workspace') ? '/workspace' : '.';
console.log('Base directory:', baseDir);

// Возможные пути к production файлам (приоритет TypeScript)
const possiblePaths = [
  { path: `${baseDir}/server/production.ts`, command: 'npx tsx' },
  { path: './server/production.ts', command: 'npx tsx' },
  { path: '/workspace/server/production.ts', command: 'npx tsx' },
  { path: `${baseDir}/dist/production.js`, command: 'node' },
  { path: './dist/production.js', command: 'node' },
  { path: '/workspace/dist/production.js', command: 'node' },
  { path: `${baseDir}/server/production.js`, command: 'node' },
  { path: './server/production.js', command: 'node' },
  { path: '/workspace/server/production.js', command: 'node' },
  { path: `${baseDir}/production.js`, command: 'node' },
  { path: './production.js', command: 'node' },
  { path: '/workspace/production.js', command: 'node' }
];

let foundConfig = null;

for (const config of possiblePaths) {
  try {
    if (fs.existsSync(config.path)) {
      console.log(`✅ Found production file at: ${config.path}`);
      foundConfig = config;
      break;
    } else {
      console.log(`❌ Not found: ${config.path}`);
    }
  } catch (err) {
    console.log(`❌ Error checking ${config.path}:`, err.message);
  }
}

if (!foundConfig) {
  console.error('❌ ERROR: production file not found in any expected location');
  console.error('Available files in current directory:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => {
      const stat = fs.statSync(file);
      console.error(`  ${file} ${stat.isDirectory() ? '(dir)' : `(${stat.size} bytes)`}`);
    });
  } catch (err) {
    console.error('Cannot list files:', err.message);
  }
  process.exit(1);
}

console.log(`🚀 Starting server: ${foundConfig.command} ${foundConfig.path}`);

// Запускаем production файл с правильной командой
const args = foundConfig.command === 'npx tsx' 
  ? ['tsx', foundConfig.path] 
  : [foundConfig.path];

const child = spawn(foundConfig.command === 'npx tsx' ? 'npx' : 'node', args, {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code: ${code}`);
  process.exit(code);
});