#!/bin/bash

# Replit deployment script
echo "Deploying Auto Auction Platform..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Check if build exists
if [ ! -f "./dist/index.js" ]; then
    echo "Building application..."
    npm run build
fi

# Start production server
echo "Starting production server..."
node dist/index.js