import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { 
  INTERSTITIAL_AD_UNIT_ID, 
  isWeb, 
  isMobile,
  MAX_AD_RETRY_ATTEMPTS,
  AD_RETRY_DELAY,
} from '../../utils/adConfig';
import { isAdMobInitialized, preloadInterstitial, showInterstitial, TestIds } from '../../services/adManager';

interface InterstitialAdComponentProps {
  onAdClosed?: () => void;
  onAdFailed?: () => void;
  visible?: boolean;
}

const InterstitialAdComponent: React.FC<InterstitialAdComponentProps> = ({ 
  onAdClosed,
  onAdFailed,
  visible = true
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use test ID in development, production ID otherwise
  const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID;

  // Load interstitial ad when component mounts or becomes visible
  useEffect(() => {
    if (!visible) {
      // Clean up when not visible
      if (interstitialRef.current) {
        try {
          interstitialRef.current.removeAllListeners();
        } catch (e) {
          // Ignore cleanup errors
        }
        interstitialRef.current = null;
      }
      setIsReady(false);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Skip on web or if AdMob not initialized
    if (isWeb || !isMobile || !isAdMobInitialized()) {
      if (__DEV__) console.log('InterstitialAd: Skipping on web or AdMob not initialized');
      // Auto-close after short delay to not block user
      timeoutRef.current = setTimeout(() => {
        if (onAdClosed) onAdClosed();
      }, 500);
      return;
    }

    loadInterstitial();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [visible]);

  const loadInterstitial = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setIsReady(false);

      // Set a timeout for loading (max 5 seconds)
      loadTimeoutRef.current = setTimeout(() => {
        if (!isReady && !hasError) {
          if (__DEV__) console.log('InterstitialAd: Load timeout, proceeding without ad');
          handleAdFailed();
        }
      }, 5000);

      // Preload the ad
      const interstitial = await preloadInterstitial(adUnitId);
      
      if (!interstitial) {
        handleAdFailed();
        return;
      }

      interstitialRef.current = interstitial;

      // Set up event listeners
      const unsubscribeLoaded = interstitial.addAdEventListener('loaded', () => {
        if (__DEV__) console.log('InterstitialAd: Ad loaded');
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        setIsReady(true);
        setIsLoading(false);
        setHasError(false);
        retryCountRef.current = 0;
        
        // Auto-show when ready
        showAd();
      });

      const unsubscribeError = interstitial.addAdEventListener('error', (error) => {
        if (__DEV__) console.error('InterstitialAd: Ad error:', error);
        handleAdFailed();
      });

      const unsubscribeClosed = interstitial.addAdEventListener('closed', () => {
        if (__DEV__) console.log('InterstitialAd: Ad closed');
        setIsShowing(false);
        setIsReady(false);
        if (onAdClosed) {
          onAdClosed();
        }
        // Clean up
        if (interstitialRef.current) {
          try {
            interstitialRef.current.removeAllListeners();
          } catch (e) {
            // Ignore cleanup errors
          }
          interstitialRef.current = null;
        }
      });

      // Try to load if not already loaded
      const loaded = await interstitial.loaded();
      if (loaded) {
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        setIsReady(true);
        setIsLoading(false);
        showAd();
      } else {
        // Wait for load event
        await interstitial.load();
      }

    } catch (error) {
      if (__DEV__) console.error('InterstitialAd: Load error:', error);
      handleAdFailed();
    }
  };

  const showAd = async () => {
    if (!interstitialRef.current || isShowing) return;

    try {
      setIsShowing(true);
      const shown = await showInterstitial(interstitialRef.current);
      
      if (!shown) {
        if (__DEV__) console.log('InterstitialAd: Failed to show, proceeding without ad');
        handleAdFailed();
      }
    } catch (error) {
      if (__DEV__) console.error('InterstitialAd: Show error:', error);
      handleAdFailed();
    }
  };

  const handleAdFailed = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsLoading(false);
    setIsReady(false);
    setHasError(true);
    setIsShowing(false);

    // Retry logic
    if (retryCountRef.current < MAX_AD_RETRY_ATTEMPTS) {
      const delay = AD_RETRY_DELAY * Math.pow(2, retryCountRef.current);
      retryCountRef.current += 1;
      
      if (__DEV__) console.log(`InterstitialAd: Retrying in ${delay}ms (attempt ${retryCountRef.current}/${MAX_AD_RETRY_ATTEMPTS})`);
      
      setTimeout(() => {
        loadInterstitial();
      }, delay);
    } else {
      // Max retries reached, proceed without ad
      if (__DEV__) console.log('InterstitialAd: Max retries reached, proceeding without ad');
      if (onAdFailed || onAdClosed) {
        // Auto-close after short delay
        timeoutRef.current = setTimeout(() => {
          if (onAdFailed) onAdFailed();
          if (onAdClosed) onAdClosed();
        }, 500);
      }
    }
  };

  if (!visible) return null;

  // On web or if AdMob not initialized, show minimal loading then close
  if (isWeb || !isMobile || !isAdMobInitialized()) {
    return null; // Don't show modal, just proceed
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (onAdClosed) onAdClosed();
      }}
    >
      <View style={styles.container}>
        {(isLoading || !isReady) && !hasError && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading ad...</Text>
          </View>
        )}
        
        {hasError && retryCountRef.current >= MAX_AD_RETRY_ATTEMPTS && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Ad unavailable</Text>
            <Text style={styles.errorSubtext}>Continuing...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  errorSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});

export default InterstitialAdComponent;
