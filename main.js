// Direct production server for Replit Deployments
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Try to load the built server, fallback to basic server
let server;
try {
  server = require('./dist/index.js');
  console.log('Production server loaded');
} catch (error) {
  console.log('Fallback to basic server');
  
  // Basic fallback server
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/public/index.html'));
  });
  
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fallback server running on port ${PORT}`);
  });
}