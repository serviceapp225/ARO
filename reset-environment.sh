#!/bin/bash

echo "🔄 Resetting environment after rollback..."

# Kill existing processes
pkill -f "tsx server" || true
pkill -f "node.*dev" || true

echo "✅ Environment reset complete"
echo "Run 'npm run dev' to restart with fresh database"