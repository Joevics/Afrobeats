# AdMob Setup Instructions

## Installation

1. **Install the AdMob package:**
```bash
npm install react-native-google-mobile-ads
```

**Note:** The package is not yet in package.json. You need to install it manually:
```bash
npm install react-native-google-mobile-ads
```

2. For Expo projects, you may need to add the config plugin to `app.json`:
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511"
        }
      ]
    ]
  }
}
```

3. Rebuild your app after adding the plugin:
```bash
npx expo prebuild --clean
```

## Configuration

### Update Ad Unit IDs

Edit `utils/adConfig.ts` and replace the test IDs with your production AdMob ad unit IDs:

1. Go to [AdMob Console](https://apps.admob.com)
2. Create ad units for your app:
   - Banner ad unit
   - Interstitial ad unit
3. Get your App ID from App Settings
4. Update the IDs in `utils/adConfig.ts`:
   - `BANNER_AD_UNIT_ID` - Your banner ad unit ID
   - `INTERSTITIAL_AD_UNIT_ID` - Your interstitial ad unit ID
   - `ADMOB_APP_ID` - Your app ID (iOS and Android)

### Test IDs (Current)

The app currently uses Google's test IDs:
- Banner: `ca-app-pub-3940256099942544/6300978111`
- Interstitial: `ca-app-pub-3940256099942544/1033173712`
- iOS App ID: `ca-app-pub-3940256099942544~1458002511`
- Android App ID: `ca-app-pub-3940256099942544~3347511713`

These will show test ads. Replace them with your production IDs before releasing.

## Features

- ✅ Banner ads with automatic retry on failure
- ✅ Interstitial ads with preloading
- ✅ Graceful error handling (app works without ads)
- ✅ Web platform support (ads disabled on web)
- ✅ Test mode detection
- ✅ Automatic retry with exponential backoff

## Error Handling

The implementation includes comprehensive error handling:
- Network errors: Automatic retry (max 3 attempts)
- Ad not available: Silent fallback to placeholder
- SDK errors: App continues without ads
- Timeout protection: Ads won't block user actions

## Testing

1. Test ads will show in development mode
2. Verify ads work on both iOS and Android
3. Test error scenarios (airplane mode, etc.)
4. Verify app works correctly when ads fail

