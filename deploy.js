#!/usr/bin/env node

// Alternative deployment script for Replit compatibility
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Replit-compatible deployment...');

// Step 1: Build the application
console.log('📦 Building application...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed with code:', code);
    process.exit(1);
  }
  
  console.log('✅ Build completed successfully');
  
  // Step 2: Check if dist files exist
  const distPath = path.join(__dirname, 'dist', 'index.js');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Built files not found at:', distPath);
    process.exit(1);
  }
  
  console.log('✅ Built files verified');
  
  // Step 3: Start the production server
  console.log('🚀 Starting production server...');
  const serverProcess = spawn('node', [distPath], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  serverProcess.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });
  
  console.log('✅ Server started successfully');
});

buildProcess.on('error', (err) => {
  console.error('❌ Build process error:', err);
  process.exit(1);
});