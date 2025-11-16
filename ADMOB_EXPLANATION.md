# AdMob Setup Explanation

## 🎯 Quick Answer: You Just Need IDs, NOT Ad Design!

**You do NOT need to design ads.** AdMob automatically serves ads from Google's ad network. You just need to:
1. Get your Ad Unit IDs from AdMob Console
2. Replace the test IDs in `utils/adConfig.ts`
3. That's it! Ads will automatically appear.

---

## 📱 How AdMob Works

### What AdMob Does:
- **Automatically serves ads** from Google's ad network
- **Matches ads to your users** based on their interests
- **Handles all ad creative** (images, videos, text) - you don't design anything
- **Optimizes ad performance** automatically
- **Pays you** when users interact with ads

### What You Need to Do:
1. **Create ad units** in AdMob Console (just click buttons, no design needed)
2. **Copy the IDs** that AdMob gives you
3. **Paste them** into your code
4. **Done!** Ads will appear automatically

---

## 🔧 Step-by-Step: Getting Your AdMob IDs

### Step 1: Complete AdMob Registration
Since you started yesterday, make sure:
- [ ] Account is fully verified
- [ ] Payment information is set up
- [ ] Your app is added to AdMob Console

### Step 2: Create Ad Units in AdMob Console

1. **Go to AdMob Console:** https://apps.admob.com
2. **Select your app** (or create it if not done)
3. **Click "Ad units"** in the left menu
4. **Click "Add ad unit"**

#### Create Banner Ad Unit:
- **Ad format:** Banner
- **Ad unit name:** "Banner Ad" (or any name you like)
- **Click "Create"**
- **Copy the Ad Unit ID** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

#### Create Interstitial Ad Unit:
- **Ad format:** Interstitial
- **Ad unit name:** "Interstitial Ad"
- **Click "Create"**
- **Copy the Ad Unit ID**

### Step 3: Get Your App ID

1. **In AdMob Console, go to "Apps"**
2. **Click on your app**
3. **Look for "App ID"** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
4. **You'll have separate App IDs for iOS and Android**

---

## 📝 Where to Put Your IDs

### File 1: `utils/adConfig.ts`

Replace these lines:

```typescript
// Banner Ad Unit ID
export const BANNER_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Test ID
  : 'YOUR_PRODUCTION_BANNER_AD_UNIT_ID_HERE'; // ← Paste your banner ID here

// Interstitial Ad Unit ID
export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712' // Test ID
  : 'YOUR_PRODUCTION_INTERSTITIAL_AD_UNIT_ID_HERE'; // ← Paste your interstitial ID here

// App IDs
export const ADMOB_APP_ID = __DEV__
  ? Platform.select({
      ios: 'ca-app-pub-3940256099942544~1458002511', // Test ID
      android: 'ca-app-pub-3940256099942544~3347511713', // Test ID
      default: '',
    })
  : Platform.select({
      ios: 'YOUR_IOS_APP_ID_HERE', // ← Paste your iOS App ID here
      android: 'YOUR_ANDROID_APP_ID_HERE', // ← Paste your Android App ID here
      default: '',
    });
```

### File 2: `app.json`

Update the plugin section (lines 53-59):

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "YOUR_ANDROID_APP_ID_HERE", // ← Paste Android App ID
    "iosAppId": "YOUR_IOS_APP_ID_HERE" // ← Paste iOS App ID
  }
]
```

---

## 🎨 About Ad Design

### You DON'T Need To:
- ❌ Design ad graphics
- ❌ Create ad content
- ❌ Write ad copy
- ❌ Choose ad colors
- ❌ Design ad layouts

### AdMob Automatically:
- ✅ Serves relevant ads to your users
- ✅ Matches ad style to your app (when possible)
- ✅ Shows different ad types (images, videos, text)
- ✅ Optimizes which ads perform best
- ✅ Handles all ad creative

### What You CAN Customize (Optional):
- **Ad placement** (where in your app) - ✅ Already done!
- **Ad size** (banner, large banner, etc.) - ✅ Already configured!
- **Ad frequency** (how often to show) - Can be adjusted in AdMob Console
- **Block certain ad categories** - Can be done in AdMob Console

---

## 📊 Ad Types You'll See

### Banner Ads (Already Implemented):
- **Standard banner:** 320x50 pixels
- **Large banner:** 320x100 pixels
- **Medium rectangle:** 300x250 pixels
- Automatically served by AdMob

### Interstitial Ads (Already Implemented):
- **Full-screen ads** shown between content
- **Video ads** or **image ads**
- Automatically served by AdMob

---

## ⚠️ Important Notes

### Test vs Production IDs:
- **Test IDs** (currently in code): Show test ads, no revenue
- **Production IDs** (what you'll add): Show real ads, generate revenue

### Privacy Policy Required:
- AdMob **requires** a privacy policy URL
- Must be publicly accessible
- Must mention data collection for ads
- Add this in AdMob Console under "App settings"

### Ad Review:
- After adding your IDs, Google reviews your app
- Usually takes 1-2 days
- Ads may not show immediately
- Test ads will show during review period

---

## 🚀 Quick Start Checklist

1. [ ] Complete AdMob account setup
2. [ ] Add your app to AdMob Console
3. [ ] Create Banner ad unit → Copy ID
4. [ ] Create Interstitial ad unit → Copy ID
5. [ ] Get App ID (iOS) → Copy ID
6. [ ] Get App ID (Android) → Copy ID
7. [ ] Update `utils/adConfig.ts` with all IDs
8. [ ] Update `app.json` plugin with App IDs
9. [ ] Add Privacy Policy URL in AdMob Console
10. [ ] Rebuild app
11. [ ] Test on device
12. [ ] Submit for review in AdMob

---

## 💡 Pro Tips

1. **Start with test IDs** (current setup) - perfect for development
2. **Switch to production IDs** only when ready to launch
3. **One ad unit per ad type** is enough - you can reuse the same ID everywhere
4. **AdMob learns** - performance improves over time as it learns your users
5. **Monitor in AdMob Console** - see which ads perform best

---

## ❓ Common Questions

**Q: Do I need different ad units for each screen?**
A: No! You can use the same Banner ad unit ID everywhere. Same for Interstitial.

**Q: Can I customize how ads look?**
A: Limited customization. AdMob controls the creative, but you control placement and size (already done).

**Q: Will ads show immediately?**
A: After review (1-2 days), yes. During review, test ads may show.

**Q: What if I want to change ad placement later?**
A: Just move the `<BannerAdComponent>` in your code - no need to change IDs.

**Q: Can I block certain types of ads?**
A: Yes, in AdMob Console under "Blocking controls" you can block categories.

---

## 📞 Need Help?

- AdMob Help: https://support.google.com/admob
- AdMob Console: https://apps.admob.com
- Your code is ready - just swap the IDs!

