// Main entry point for Replit Deployments
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Production environment
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 5000;

console.log('Starting Auto Auction Platform...');

// Check if we need to build
if (!fs.existsSync('./dist/index.js')) {
  console.log('Building application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Start the server
console.log('Loading production server...');
try {
  require('./dist/index.js');
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}