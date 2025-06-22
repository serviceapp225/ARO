// Minimal production server optimized for Replit Deployments
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting deployment server...');

// Health checks for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Check if built application exists
if (fs.existsSync('./dist/index.js')) {
  console.log('Loading production build...');
  try {
    require('./dist/index.js');
    console.log('Production server loaded successfully');
  } catch (error) {
    console.error('Error loading production build:', error);
    startFallbackServer();
  }
} else {
  console.log('No production build found, starting fallback...');
  startFallbackServer();
}

function startFallbackServer() {
  // Static file serving
  if (fs.existsSync('./dist/public')) {
    app.use(express.static('./dist/public'));
  }
  
  // Basic routes
  app.get('*', (req, res) => {
    if (fs.existsSync('./dist/public/index.html')) {
      res.sendFile(path.resolve('./dist/public/index.html'));
    } else {
      res.json({ status: 'Server running', message: 'Auto Auction Platform' });
    }
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fallback server running on port ${PORT}`);
  });
}