#!/bin/bash

# Script to configure Xcode for React Native development

echo "🔍 Finding Xcode installation..."

# Find Xcode.app
XCODE_PATH=$(find /Applications -name "Xcode*.app" -maxdepth 1 | head -1)

if [ -z "$XCODE_PATH" ]; then
    echo "❌ Xcode not found in /Applications"
    echo "Please install Xcode from the App Store or specify the path manually"
    exit 1
fi

echo "✅ Found Xcode at: $XCODE_PATH"

# Check if we need sudo
if [ "$EUID" -eq 0 ]; then
    xcode-select --switch "$XCODE_PATH"
else
    echo "🔐 This requires sudo privileges. Please enter your password:"
    sudo xcode-select --switch "$XCODE_PATH"
fi

# Verify
echo ""
echo "🔍 Verifying Xcode configuration..."
xcodebuild -version

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Xcode is configured correctly!"
    echo "You can now run: npm run ios"
else
    echo ""
    echo "❌ Xcode configuration failed. Please check the error above."
    exit 1
fi


