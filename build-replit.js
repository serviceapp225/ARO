#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function buildForReplit() {
  console.log('Starting Replit-compatible build...');
  
  try {
    // Build frontend only with Vite
    await runCommand('npx', ['vite', 'build']);
    console.log('Frontend build completed');
    
    // Create production server file
    const productionServer = `
const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Secure middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'deny',
  index: false,
  redirect: false
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(503).json({ error: 'API temporarily unavailable' });
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

const server = createServer(app);
server.listen(PORT, '127.0.0.1', () => {
  console.log('Server running on port ' + PORT);
});
`;

    fs.writeFileSync('dist/index.js', productionServer);
    console.log('Created production server');
    
    // Create package.json for production
    const prodPackage = {
      "name": "autobid-production",
      "version": "1.0.0",
      "type": "commonjs",
      "main": "index.js",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.18.0"
      }
    };
    
    fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    console.log('Build completed successfully');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

buildForReplit();