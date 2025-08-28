#!/usr/bin/env node
// Автоматическое копирование offline файлов после сборки

import fs from 'fs';
import path from 'path';

const sourceDir = 'public';
const targetDir = 'dist/public';

const filesToCopy = ['offline.html', 'sw.js'];

console.log('🔄 Копируем offline файлы в production build...');

for (const file of filesToCopy) {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Скопирован: ${file}`);
  } else {
    console.warn(`⚠️  Файл не найден: ${sourcePath}`);
  }
}

console.log('✨ Копирование offline файлов завершено');