#!/bin/bash
set -e

echo "🏗️ Building application for DigitalOcean deployment..."

# Clean and create directories
rm -rf dist/
mkdir -p dist/public

# Build frontend (Vite builds to client/dist/public due to config)
echo "📦 Building frontend..."
NODE_OPTIONS="--max-old-space-size=4096" npx vite build

# Copy frontend files to correct location
echo "📁 Copying frontend files..."
cp -r client/dist/public/* dist/public/

# Build production server
echo "🚀 Building production server..."
npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Production build completed successfully!"
echo "📁 Files created:"
echo "  - dist/public/ (frontend assets)"
echo "  - dist/production.js (backend server)"
echo ""
echo "🚀 Ready for DigitalOcean deployment!"
echo "   Use: node dist/production.js"