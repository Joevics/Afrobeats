import { Platform } from 'react-native';
import { ADMOB_APP_ID, isWeb, isMobile } from '../utils/adConfig';

// Dynamic import to handle web platform gracefully
let mobileAds: any;
let BannerAdSize: any;
let TestIds: any;
let InterstitialAd: any;
let AdsConsent: any;
let AdsConsentStatus: any;

// Only import on mobile platforms
if (!isWeb && Platform.OS !== 'web') {
  try {
    const adsModule = require('react-native-google-mobile-ads');
    mobileAds = adsModule.default;
    BannerAdSize = adsModule.BannerAdSize;
    TestIds = adsModule.TestIds;
    InterstitialAd = adsModule.InterstitialAd;
    AdsConsent = adsModule.AdsConsent;
    AdsConsentStatus = adsModule.AdsConsentStatus;
  } catch (error) {
    if (__DEV__) console.warn('AdMob module not available:', error);
  }
}

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize AdMob SDK
 * Should be called once at app startup
 */
export async function initializeAdMob(): Promise<void> {
  // Skip initialization on web
  if (isWeb) {
    if (__DEV__) console.log('AdMob: Skipping initialization on web platform');
    return;
  }

  // Check if module is available
  if (!mobileAds) {
    if (__DEV__) console.warn('AdMob: Module not available');
    return;
  }

  // Return if already initialized
  if (isInitialized) {
    if (__DEV__) console.log('AdMob: Already initialized');
    return;
  }

  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const appId = ADMOB_APP_ID?.[Platform.OS as 'ios' | 'android'];
      
      if (!appId) {
        if (__DEV__) console.warn('AdMob: No app ID configured for platform:', Platform.OS);
        return;
      }

      if (__DEV__) console.log('AdMob: Initializing with app ID:', appId);
      
      await mobileAds().initialize();
      
      isInitialized = true;
      if (__DEV__) console.log('AdMob: Initialization successful');
    } catch (error) {
      if (__DEV__) console.error('AdMob: Initialization failed:', error);
      // Don't throw - allow app to continue without ads
      isInitialized = false;
    }
  })();

  return initializationPromise;
}

/**
 * Check if AdMob is initialized
 */
export function isAdMobInitialized(): boolean {
  return isInitialized && isMobile;
}

/**
 * Request ads consent (GDPR/CCPA compliance)
 * This is optional but recommended for EU users
 */
export async function requestAdsConsent(): Promise<AdsConsentStatus> {
  if (isWeb || !isInitialized) {
    return AdsConsentStatus.UNKNOWN;
  }

  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();
    
    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
      const formResult = await AdsConsent.showForm();
      return formResult.status;
    }
    
    return consentInfo.status;
  } catch (error) {
    if (__DEV__) console.error('AdMob: Consent request failed:', error);
    return AdsConsentStatus.UNKNOWN;
  }
}

/**
 * Preload an interstitial ad
 */
export async function preloadInterstitial(adUnitId: string): Promise<InterstitialAd | null> {
  if (isWeb || !isInitialized || !InterstitialAd) {
    return null;
  }

  try {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    await interstitial.load();
    
    if (__DEV__) console.log('AdMob: Interstitial preloaded successfully');
    return interstitial;
  } catch (error) {
    if (__DEV__) console.error('AdMob: Failed to preload interstitial:', error);
    return null;
  }
}

/**
 * Show an interstitial ad
 */
export async function showInterstitial(interstitial: InterstitialAd | null): Promise<boolean> {
  if (isWeb || !interstitial) {
    return false;
  }

  try {
    const isLoaded = await interstitial.loaded();
    
    if (!isLoaded) {
      if (__DEV__) console.log('AdMob: Interstitial not loaded, attempting to load...');
      await interstitial.load();
      return false;
    }

    await interstitial.show();
    if (__DEV__) console.log('AdMob: Interstitial shown successfully');
    return true;
  } catch (error) {
    if (__DEV__) console.error('AdMob: Failed to show interstitial:', error);
    return false;
  }
}

// Export ad components and constants
export { BannerAdSize, TestIds };

// Re-export for convenience (will be undefined on web)
export const getBannerAdSize = () => BannerAdSize;
export const getTestIds = () => TestIds;

