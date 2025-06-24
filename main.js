const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting Auto Auction App...');

// Check if we have a production build
const hasBuild = fs.existsSync('./dist/index.js');

if (process.env.NODE_ENV === 'production') {
  if (!hasBuild) {
    console.log('Building for production...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
      console.error('Build failed, falling back to development mode');
      process.env.NODE_ENV = 'development';
    }
  }
  
  if (fs.existsSync('./dist/index.js')) {
    console.log('Starting production server...');
    require('./dist/index.js');
  } else {
    console.log('No build found, starting development server...');
    execSync('npm run dev', { stdio: 'inherit' });
  }
} else {
  console.log('Starting development server...');
  execSync('npm run dev', { stdio: 'inherit' });
}