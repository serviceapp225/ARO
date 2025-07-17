#!/usr/bin/env node

/**
 * DEPLOYMENT FIX FOR REPLIT
 * 
 * This script solves the deployment issue by:
 * 1. Replacing the main dist/index.js file with the working CommonJS version
 * 2. Ensuring proper environment setup for deployment
 * 3. Handling port configuration correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing deployment configuration...');

// 1. Build the project if needed
if (!fs.existsSync('dist/index.cjs')) {
  console.log('🔨 Building deployment package...');
  execSync('node build-deployment.cjs', { stdio: 'inherit' });
}

// 2. Replace the main index.js with the working CommonJS version
if (fs.existsSync('dist/index.cjs')) {
  console.log('📄 Replacing dist/index.js with working CommonJS version...');
  
  // Since we can't change the .js extension due to ES module rules,
  // let's create a wrapper that runs the .cjs file
  const wrapperScript = `const { spawn } = require('child_process');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 DEPLOYMENT SERVER STARTING...');
console.log('📦 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);

// Run the actual CommonJS server
const server = spawn('node', [path.join(__dirname, 'index.cjs')], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  console.log('Server exited with code', code);
  process.exit(code);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});
`;

  fs.writeFileSync('dist/index.js', wrapperScript);
  console.log('✅ Created deployment wrapper for index.js');
}

// 3. Verify the deployment structure
console.log('🔍 Verifying deployment structure...');
const requiredFiles = [
  'dist/index.js',
  'dist/index.cjs', 
  'dist/autoauction.db',
  'dist/public/index.html'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('\n🎉 DEPLOYMENT READY!');
  console.log('📁 All required files are in place');
  console.log('🚀 You can now click "Deploy" in Replit');
  console.log('');
  console.log('📊 Deployment package contents:');
  console.log('  - dist/index.js (deployment wrapper)');
  console.log('  - dist/index.cjs (actual server)');
  console.log('  - dist/autoauction.db (database)');
  console.log('  - dist/public/ (frontend)');
} else {
  console.log('\n❌ DEPLOYMENT NOT READY');
  console.log('Some required files are missing');
  process.exit(1);
}