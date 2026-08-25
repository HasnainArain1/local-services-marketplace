import { Platform } from 'react-native';

const getBaseUrl = () => {
  // 1. Web browser
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:8000/api/v1`;
    }
    return 'http://localhost:8000/api/v1';
  }

  // 2. Native (Expo Go / Physical Device / Emulator)
  try {
    const Constants = require('expo-constants').default;
    
    // Check if user set a non-default custom URL in app.json (e.g. deployed backend)
    const configuredUrl = Constants?.expoConfig?.extra?.apiBaseUrl || Constants?.manifest?.extra?.apiBaseUrl;
    if (configuredUrl && !configuredUrl.includes('10.0.2.2') && !configuredUrl.includes('localhost')) {
      return configuredUrl;
    }

    // Auto-detect LAN IP from Expo host (e.g., 192.168.100.10)
    const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoGo?.debuggerHost || Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:8000/api/v1`;
      }
    }
  } catch (_) {
    // ignore
  }

  // 3. Fallback for Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  // 4. Default fallback
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

