import { Platform } from 'react-native';

/**
 * AdMob Configuration
 * 
 * Replace these test IDs with your actual AdMob ad unit IDs for production.
 * 
 * Test IDs (from Google AdMob documentation):
 * - Banner: ca-app-pub-3940256099942544/6300978111 (Android/iOS)
 * - Interstitial: ca-app-pub-3940256099942544/1033173712 (Android/iOS)
 * 
 * To get your production IDs:
 * 1. Go to AdMob Console (https://apps.admob.com)
 * 2. Create ad units for your app
 * 3. Replace the IDs below
 */

// Check if running on web
export const isWeb = Platform.OS === 'web';

// Check if running on mobile (iOS or Android)
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Banner Ad Unit IDs
export const BANNER_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Google test ID
  : 'ca-app-pub-3940256099942544/6300978111'; // TODO: Replace with your production banner ad unit ID

// Interstitial Ad Unit IDs
export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712' // Google test ID
  : 'ca-app-pub-3940256099942544/1033173712'; // TODO: Replace with your production interstitial ad unit ID

// AdMob App ID (required for initialization)
// Get this from AdMob Console under App Settings
export const ADMOB_APP_ID = __DEV__
  ? Platform.select({
      ios: 'ca-app-pub-3940256099942544~1458002511', // iOS test app ID
      android: 'ca-app-pub-3940256099942544~3347511713', // Android test app ID
      default: '',
    })
  : Platform.select({
      ios: '', // TODO: Replace with your iOS production app ID
      android: '', // TODO: Replace with your Android production app ID
      default: '',
    });

// Ad refresh interval (in seconds)
export const BANNER_REFRESH_INTERVAL = 35;

// Maximum retry attempts for ad loading
export const MAX_AD_RETRY_ATTEMPTS = 3;

// Retry delay in milliseconds
export const AD_RETRY_DELAY = 2000;

