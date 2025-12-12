#!/bin/bash

# Build Release AAB (Android App Bundle) for One Hour at a Time
# Required for Google Play Console submissions
# Usage: ./build-bundle.sh

echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

echo "📦 Building Release AAB (Android App Bundle)..."
cd android && ./gradlew bundleRelease && cd ..

echo "✅ Build complete!"
echo ""
echo "📍 AAB Location:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📤 To upload to Google Play Console:"
echo "   1. Go to https://play.google.com/console"
echo "   2. Select your app"
echo "   3. Go to Production > Create new release"
echo "   4. Upload: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "💡 Note: AAB files are required by Google Play (APK no longer accepted)"
