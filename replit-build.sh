#!/bin/bash
set -e

echo "Building for Replit deployment..."

# Clean and create directories
rm -rf dist/
mkdir -p dist/public

# Build frontend with minimal options
echo "Building frontend..."
NODE_OPTIONS="--max-old-space-size=4096" npx vite build --outDir dist/public

# Create minimal production server
cat > dist/index.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create minimal package.json
cat > dist/package.json << 'EOF'
{
  "name": "autobid-replit",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": { "express": "^4.18.0" }
}
EOF

echo "Replit build completed successfully!"
echo "Deploy with: cd dist && npm install && npm start"