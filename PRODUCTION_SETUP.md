# 🚀 Production Setup Guide

## Environment Variables Setup

### 1. Create Environment Files

Create these files in your project root:

**`.env.local`** (for local development):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://gnsjnbwkmiqribcvpeeh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_BASE_URL=https://gnsjnbwkmiqribcvpeeh.supabase.co/functions/v1/quiz-api
```

**`.env.production`** (for production builds):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://gnsjnbwkmiqribcvpeeh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key_here
EXPO_PUBLIC_API_BASE_URL=https://gnsjnbwkmiqribcvpeeh.supabase.co/functions/v1/quiz-api
```

### 2. EAS Build Configuration

The app is configured with three build profiles:

- **development**: For development builds
- **preview**: For internal testing
- **production**: For app store submission

### 3. Build Commands

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to EAS
eas login

# Build for development
eas build --profile development --platform ios
eas build --profile development --platform android

# Build for preview/testing
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Build for production
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 4. App Store Configuration

Before submitting to app stores, update the following in `eas.json`:

- **iOS**: Update `appleId`, `ascAppId`, and `appleTeamId`
- **Android**: Add your Google Service Account key

### 5. Environment Variable Priority

The app checks for environment variables in this order:
1. `process.env.EXPO_PUBLIC_*` (environment variables)
2. `Constants.expoConfig.extra.*` (app.json)
3. `Constants.manifest.extra.*` (fallback)
4. Hardcoded values (development fallback)

## Security Notes

- Never commit `.env.local` or `.env.production` to version control
- Use different Supabase keys for development and production
- The `env.example` file shows the required format without sensitive data

## Production Checklist

- [ ] Create environment files with proper keys
- [ ] Test builds with `eas build --profile preview`
- [ ] Update app store credentials in `eas.json`
- [ ] Test production build before submission
- [ ] Verify all environment variables are working
- [ ] Test on physical devices
- [ ] Verify audio playback works correctly
- [ ] Test offline functionality

