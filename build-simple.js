#!/usr/bin/env node

// Simplified build script for Replit deployment compatibility
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building for Replit deployment...');

try {
  // Step 1: Build frontend with Vite
  console.log('Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Create simple server bundle without esbuild complications
  console.log('Creating server bundle...');
  
  // Create simplified server entry point
  const serverEntry = `
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from './server/routes.js';
import { initializeDatabaseWithSampleData } from './server/initDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(join(__dirname, 'dist/public')));

// Initialize and start server
async function start() {
  await initializeDatabaseWithSampleData();
  const server = await registerRoutes(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

start().catch(console.error);
`;

  fs.writeFileSync('dist/server-simple.js', serverEntry);
  
  // Copy necessary files
  execSync('cp -r server dist/', { stdio: 'inherit' });
  execSync('cp -r shared dist/', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  console.log('Use: node dist/server-simple.js to start');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}