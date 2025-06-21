#!/usr/bin/env node

// Simple production starter that works with Replit deployment
const fs = require('fs');
const path = require('path');

// Check if built files exist
const distPath = path.join(__dirname, '..', 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
  console.error('Built files not found. Please run: npm run build');
  process.exit(1);
}

// Start the application
require(distPath);