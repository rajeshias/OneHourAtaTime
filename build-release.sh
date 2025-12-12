#!/bin/bash

# Build Release APK for One Hour at a Time
# Usage: ./build-release.sh

echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

echo "📦 Building Release APK..."
cd android && ./gradlew assembleRelease && cd ..

echo "✅ Build complete!"
echo ""
echo "📍 APK Location:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📱 To install on device:"
echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
