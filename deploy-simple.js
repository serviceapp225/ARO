#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Simple Replit deployment build...');

try {
  // Build frontend only
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Create a minimal production entry point
  const productionEntry = `import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

console.log('AutoAuction Production Server Starting...');
console.log('Port:', PORT);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API fallback
app.all('/api/*', (req, res) => {
  res.status(503).json({ 
    error: 'API unavailable in production build',
    message: 'Use development mode for full API access' 
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Server running on port \${PORT}\`);
});`;

  // Write the production entry
  fs.writeFileSync('dist/index.js', productionEntry);
  
  // Create minimal package.json for production
  const prodPackage = {
    "name": "autobid-production",
    "type": "module",
    "main": "index.js",
    "dependencies": {
      "express": "^4.21.2"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
  
  console.log('✅ Simple production build completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}