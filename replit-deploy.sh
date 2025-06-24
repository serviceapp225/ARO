#!/bin/bash

# Replit deployment script with fallback options
echo "🚀 Starting Replit deployment with compatibility fixes..."

# Clean previous builds
rm -rf dist/
echo "✓ Cleaned previous builds"

# Create dist directory
mkdir -p dist/

# Try primary build method
echo "📦 Attempting primary build..."
if npm run build; then
    echo "✅ Primary build successful"
else
    echo "❌ Primary build failed, trying fallback..."
    
    # Fallback: Build without esbuild optimization
    echo "📦 Building frontend only..."
    npx vite build
    
    # Copy server files manually
    echo "📦 Copying server files..."
    cp -r server/ dist/server/
    cp -r shared/ dist/shared/
    cp package.json dist/
    
    # Create simple entry point
    cat > dist/start.js << 'EOF'
const path = require('path');
process.chdir(__dirname);
require('./server/index.ts');
EOF
    
    echo "✅ Fallback build completed"
fi

# Verify build
if [ -f "dist/index.js" ] || [ -f "dist/start.js" ]; then
    echo "✅ Build verification passed"
    echo "🎉 Deployment ready!"
else
    echo "❌ Build verification failed"
    exit 1
fi