#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/react-native-screens/ios/bottom-tabs/RNSBottomTabsScreenComponentView.mm');

try {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('RNSBottomTabsScreen(void)') && !content.includes('RNSBottomTabsScreenCls(void)')) {
      content = content.replace(
        /Class<RCTComponentViewProtocol> RNSBottomTabsScreen\(void\)/g,
        'Class<RCTComponentViewProtocol> RNSBottomTabsScreenCls(void)'
      );
      // Make file writable
      fs.chmodSync(filePath, 0o644);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✓ Fixed RNSBottomTabsScreen function name');
    } else {
      console.log('✓ RNSBottomTabsScreen already fixed or not needed');
    }
  } else {
    console.log('⚠ RNSBottomTabsScreenComponentView.mm not found');
  }
} catch (error) {
  console.error('Error fixing RNSBottomTabsScreen:', error.message);
  process.exit(1);
}


