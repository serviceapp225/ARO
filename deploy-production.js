#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for Replit deployment...');

try {
  // Step 1: Build frontend
  console.log('📦 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Copy production server to dist
  console.log('📋 Setting up production server...');
  fs.copyFileSync('production-server.js', 'dist/index.js');
  
  // Step 3: Create production package.json
  const prodPackageJson = {
    "name": "autobid-production",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.21.2"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  
  console.log('✅ Production build completed successfully!');
  console.log('📁 Files ready in dist/ directory');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}