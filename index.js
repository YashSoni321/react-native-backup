/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// CRITICAL: These logs use emoji to stand out
// In Bridgeless mode, logs may only appear in DevTools (press 'j' in Metro)
console.log('🚀🚀🚀 [index.js] SCRIPT STARTING 🚀🚀🚀');
console.warn('🚀🚀🚀 [index.js] WARNING TEST 🚀🚀🚀');
console.error('🚀🚀🚀 [index.js] ERROR TEST 🚀🚀🚀');

// Enable all logs and warnings to debug
LogBox.ignoreAllLogs(false);
LogBox.ignoreLogs([]);
console.log('🚀 [index.js] LogBox configured - all logs enabled');

console.log('🚀 [index.js] About to register app component:', appName);
AppRegistry.registerComponent(appName, () => {
  console.log('🚀🚀🚀 [index.js] ========================================');
  console.log('🚀🚀🚀 [index.js] Component factory CALLED');
  console.log('🚀🚀🚀 [index.js] About to return App component');
  console.log('🚀🚀🚀 [index.js] ========================================');
  return App;
});

console.log('🚀 [index.js] AppRegistry.registerComponent completed');
