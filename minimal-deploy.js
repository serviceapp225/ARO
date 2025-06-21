import { execSync } from 'child_process';
import fs from 'fs';

console.log('Creating minimal Replit deployment...');

// Build frontend with optimized settings
execSync('npx vite build --minify=false --sourcemap=false', { stdio: 'inherit' });

// Create ultra-simple production server
const serverCode = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log('Server ready on port', PORT));`;

fs.writeFileSync('dist/index.js', serverCode);
fs.writeFileSync('dist/package.json', JSON.stringify({
  name: 'autobid-minimal',
  main: 'index.js',
  dependencies: { express: '*' }
}, null, 2));

console.log('Minimal deployment ready in dist/');