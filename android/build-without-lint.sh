#!/bin/bash

# Build Android project without lint checks
# This script helps avoid lint issues with third-party modules

echo "Building Android project without lint checks..."

# Build debug version
echo "Building debug version..."
./gradlew assembleDebug -x lint

if [ $? -eq 0 ]; then
    echo "✅ Debug build successful!"
else
    echo "❌ Debug build failed!"
    exit 1
fi

# Build release version
echo "Building release version..."
./gradlew assembleRelease -x lint

if [ $? -eq 0 ]; then
    echo "✅ Release build successful!"
    echo "🎉 All builds completed successfully!"
else
    echo "❌ Release build failed!"
    exit 1
fi 