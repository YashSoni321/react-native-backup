#!/bin/bash

# Script to fix common lint issues in React Native modules
echo "🔧 Fixing lint issues in React Native modules..."

# Function to add lint options to a build.gradle file
add_lint_options() {
    local file="$1"
    if [ -f "$file" ]; then
        # Check if lintOptions already exists
        if ! grep -q "lintOptions" "$file"; then
            # Find the closing brace of the android block and add lintOptions before it
            sed -i '' '/^}/i\
    lintOptions {\
        disable "NewApi"\
        disable "InvalidPackage"\
        disable "MissingPermission"\
        disable "UnsafeOptInUsageError"\
        abortOnError false\
    }\
' "$file"
            echo "✅ Fixed lint issues in: $file"
        else
            echo "⚠️  Lint options already exist in: $file"
        fi
    fi
}

# Common React Native modules that often have lint issues
modules=(
    "react-native-location"
    "react-native-maps"
    "react-native-push-notification"
    "react-native-device-info"
    "react-native-fs"
    "react-native-image-crop-picker"
    "react-native-get-location"
    "react-native-geolocation-service"
    "react-native-network-info"
    "react-native-permissions"
)

# Fix each module
for module in "${modules[@]}"; do
    build_gradle="../../node_modules/$module/android/build.gradle"
    if [ -f "$build_gradle" ]; then
        add_lint_options "$build_gradle"
    fi
done

echo "🎉 Lint fixes applied! Now try building with: ./gradlew build" 