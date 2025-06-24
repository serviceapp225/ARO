#!/bin/bash

# Build script for mobile applications
set -e

echo "🚀 Building AutoBid mobile applications..."

# Build web assets
echo "📦 Building web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

echo "✅ Mobile build preparation complete!"
echo ""
echo "Next steps:"
echo "1. For Android: npx cap open android"
echo "2. For iOS: npx cap open ios"
echo ""
echo "📱 Publishing to stores:"
echo "• Android: Build APK/AAB in Android Studio"
echo "• iOS: Build IPA in Xcode"