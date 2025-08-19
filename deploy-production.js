#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🚀 Starting production deployment...');

// Step 1: Build frontend
console.log('📦 Building frontend...');
const buildFrontend = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildFrontend.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed');
  
  // Step 2: Build backend
  console.log('🔧 Building backend...');
  const buildBackend = spawn('npx', [
    'esbuild', 
    'server/index.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outfile=dist/server.js'
  ], { stdio: 'inherit' });
  
  buildBackend.on('close', (backendCode) => {
    if (backendCode !== 0) {
      console.error('❌ Backend build failed');
      process.exit(1);
    }
    
    console.log('✅ Backend build completed');
    
    // Step 3: Start production server
    console.log('🚀 Starting production server...');
    
    // Check if server file exists
    if (!existsSync('./dist/server.js')) {
      console.error('❌ Server file not found at ./dist/server.js');
      process.exit(1);
    }
    
    // Set production environment and start server
    process.env.NODE_ENV = 'production';
    const server = spawn('node', ['dist/server.js'], { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    server.on('close', (serverCode) => {
      console.log(`Server exited with code ${serverCode}`);
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
  });
});