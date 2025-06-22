// Simple production starter that works with current package.json
import { spawn } from 'child_process';
import fs from 'fs';

console.log('AutoAuction Production Launcher');

// Check if production server exists
if (fs.existsSync('production-server.js')) {
  console.log('Starting production server...');
  const server = spawn('node', ['production-server.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('error', (err) => {
    console.error('Failed to start production server:', err);
    process.exit(1);
  });
} else {
  console.log('Production server not found, falling back to dist/index.js');
  const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}