#!/usr/bin/env node

// Универсальный стартовый скрипт для DigitalOcean
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== DigitalOcean Production Starter ===');
console.log('Working directory:', process.cwd());
console.log('Contents:', fs.readdirSync('.').join(', '));

// Возможные пути к production.js
const possiblePaths = [
  './production.js',
  './dist/production.js',
  '/workspace/production.js',
  '/workspace/dist/production.js'
];

let foundPath = null;

for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      console.log(`✅ Found production.js at: ${testPath}`);
      foundPath = testPath;
      break;
    } else {
      console.log(`❌ Not found: ${testPath}`);
    }
  } catch (err) {
    console.log(`❌ Error checking ${testPath}:`, err.message);
  }
}

if (!foundPath) {
  console.error('❌ ERROR: production.js not found in any expected location');
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

console.log(`🚀 Starting server: node ${foundPath}`);

// Запускаем production.js
const child = spawn('node', [foundPath], {
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