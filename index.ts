import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress expo-av deprecation warnings early, before app initialization
LogBox.ignoreLogs([
  '[expo-av]: Expo AV has been deprecated and will be removed in SDK 54.',
]);

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === 'string' && first.includes('[expo-av]: Expo AV has been deprecated')) {
    return;
  }
  originalWarn(...args);
};

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
