#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if production build exists
const distPath = path.join(__dirname, 'dist', 'index.js');
const hasProductionBuild = fs.existsSync(distPath);

console.log('🚀 Auto Auction App Starting...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Has production build:', hasProductionBuild);

if (process.env.NODE_ENV === 'production' && hasProductionBuild) {
  // Production mode - run built version
  console.log('🎯 Starting production server...');
  const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('exit', (code) => {
    console.log(`Production server exited with code ${code}`);
    process.exit(code);
  });
} else {
  // Development mode or no build - run with tsx
  console.log('🔧 Starting development server...');
  
  // Build first if in production but no build exists
  if (process.env.NODE_ENV === 'production' && !hasProductionBuild) {
    console.log('📦 Building for production...');
    const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    
    build.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Build successful, starting production server...');
        const server = spawn('node', ['dist/index.js'], {
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        
        server.on('exit', (exitCode) => {
          process.exit(exitCode);
        });
      } else {
        console.error('❌ Build failed, starting development server...');
        startDevelopment();
      }
    });
  } else {
    startDevelopment();
  }
}

function startDevelopment() {
  const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  dev.on('exit', (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
}