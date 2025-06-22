#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

console.log('🚀 Auto Auction Production Server Starting...');

const app = express();
const port = process.env.PORT || 5000;

// Check if we have static build
const staticPath = path.join(__dirname, 'dist-static');
const hasStaticBuild = fs.existsSync(staticPath);

console.log('Static build available:', hasStaticBuild);
console.log('Static path:', staticPath);

if (hasStaticBuild) {
  // Serve static files
  app.use(express.static(staticPath));
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'static', timestamp: new Date().toISOString() });
  });
  
  // SPA routing - serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Static server running on port ${port}`);
    console.log(`   Visit: http://localhost:${port}`);
  });
} else {
  console.log('No static build found, building now...');
  
  const build = spawn('npx', ['vite', 'build', '--outDir', 'dist-static'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  build.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Build completed, restarting...');
      process.exit(0); // Let process manager restart
    } else {
      console.log('❌ Build failed, serving fallback page');
      
      app.get('*', (req, res) => {
        res.send(`
          <html>
            <head><title>Auto Auction - Building</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>Auto Auction App</h1>
              <p>Application is building... Please refresh in a moment.</p>
              <script>setTimeout(() => window.location.reload(), 10000);</script>
            </body>
          </html>
        `);
      });
      
      app.listen(port, '0.0.0.0', () => {
        console.log(`⏳ Fallback server on port ${port}`);
      });
    }
  });
}