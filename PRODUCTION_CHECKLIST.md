# Production Readiness Checklist

## ✅ Completed Features
- [x] Game freeze fix (1-minute auto-advance)
- [x] Game continuation (pause/resume)
- [x] AdMob integration (banner & interstitial)
- [x] Error handling for ads
- [x] Audio caching
- [x] Question caching
- [x] History tracking

## 🔴 Critical Issues to Fix Before Production

### 1. AdMob Configuration
**Status:** ⚠️ Using test IDs - MUST be replaced
**Location:** `utils/adConfig.ts`
**Action Required:**
- Replace test IDs with your production AdMob IDs
- Update `app.json` plugin with production app IDs

### 2. Console Logs in Production
**Status:** ⚠️ Many `console.log` statements present
**Impact:** Performance and security concern
**Files Affected:** All app files
**Action Required:**
- Remove or wrap all `console.log` in `__DEV__` checks
- Keep only critical error logging in production

### 3. Hardcoded Credentials
**Status:** ⚠️ Supabase credentials in `app.json`
**Location:** `app.json` lines 89-91
**Action Required:**
- Move to environment variables
- Use EAS Secrets for production builds

### 4. AdMob App IDs in app.json
**Status:** ⚠️ Using test IDs
**Location:** `app.json` lines 56-57
**Action Required:**
- Replace with production app IDs from AdMob Console

## 🟡 Important Considerations

### 5. Error Boundaries
**Status:** ✅ Present (`ErrorBoundary` in `_layout.tsx`)
**Note:** Ensure it catches all critical errors

### 6. Network Error Handling
**Status:** ✅ Good - has retry logic and fallbacks
**Note:** Test offline scenarios

### 7. App Store Requirements
**Status:** ⚠️ Review needed
**Checklist:**
- [ ] Privacy Policy URL (required for ads)
- [ ] Terms of Service
- [ ] App Store screenshots
- [ ] App Store description
- [ ] Age rating
- [ ] Data collection disclosure (for AdMob)

### 8. Performance
**Status:** ✅ Good
- Audio preloading implemented
- Question caching implemented
- Lazy loading where appropriate

### 9. Security
**Status:** ⚠️ Needs attention
- [ ] Move sensitive keys to environment variables
- [ ] Review API endpoint security
- [ ] Ensure no sensitive data in logs

## 📋 Pre-Launch Tasks

### AdMob Setup
1. Complete AdMob account registration
2. Create ad units in AdMob Console:
   - 1 Banner ad unit
   - 1 Interstitial ad unit
3. Get App ID from AdMob Console
4. Update `utils/adConfig.ts` with production IDs
5. Update `app.json` plugin with production app IDs

### Testing
1. Test on real devices (iOS & Android)
2. Test ad loading and display
3. Test error scenarios (airplane mode, etc.)
4. Test game continuation feature
5. Test all game modes (audio, lyrics, different difficulties)

### App Store Preparation
1. Prepare screenshots
2. Write app description
3. Set up privacy policy (required for AdMob)
4. Configure age rating
5. Prepare promotional materials

### Code Cleanup
1. Remove all `console.log` statements (or wrap in `__DEV__`)
2. Remove TODO comments
3. Review and clean up unused code
4. Update version numbers if needed

## 🚀 Deployment Steps

1. **Update AdMob IDs:**
   - Edit `utils/adConfig.ts`
   - Edit `app.json` plugin section

2. **Clean up console logs:**
   - Search for `console.log` and remove/wrap

3. **Move credentials to EAS Secrets:**
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
   ```

4. **Build for production:**
   ```bash
   eas build --profile production --platform android
   eas build --profile production --platform ios
   ```

5. **Submit to stores:**
   - Google Play Console
   - Apple App Store Connect

