#!/bin/bash

# Optimized Replit deployment script
echo "🚀 Starting Replit deployment..."

# Stop any existing processes
echo "Stopping existing processes..."
pkill -f "node.*dist/index.js" || true
pkill -f "tsx.*server/index.ts" || true

# Clean and build
echo "Cleaning build directory..."
rm -rf dist/

echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Check if built files exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ Built files not found"
    exit 1
fi

echo "Starting production server..."
NODE_ENV=production PORT=5000 node dist/index.js

echo "✅ Deployment completed"