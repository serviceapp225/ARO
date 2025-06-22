// Production entry point for Replit Deployments
process.env.NODE_ENV = 'production';

const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting Auto Auction Production Server...');

// Build if needed
if (!fs.existsSync('./dist/index.js')) {
  console.log('Building application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed, starting development server...');
    execSync('npm run dev', { stdio: 'inherit' });
    return;
  }
}

// Start production server
console.log('Starting production server...');
require('./dist/index.js');