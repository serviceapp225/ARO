#!/usr/bin/env node

// Fast deployment script for Replit
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('Starting fast deployment...');

// Skip build if dist exists and is recent
const fs = require('fs');
const { spawn } = require('child_process');

function checkDistExists() {
  try {
    const distStat = fs.statSync('./dist/index.js');
    const age = Date.now() - distStat.mtime.getTime();
    return age < 5 * 60 * 1000; // Less than 5 minutes old
  } catch (e) {
    return false;
  }
}

async function startServer() {
  console.log('Starting production server...');
  
  const server = spawn('node', ['./dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', PORT: '5000' }
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
  
  console.log('Production server started on port 5000');
}

if (checkDistExists()) {
  console.log('Using existing build...');
  startServer();
} else {
  console.log('Building application...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  
  build.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error('Build failed');
      process.exit(1);
    }
  });
}