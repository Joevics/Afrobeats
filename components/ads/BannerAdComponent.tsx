import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Platform, ActivityIndicator } from 'react-native';
import { 
  BANNER_AD_UNIT_ID, 
  isWeb, 
  isMobile, 
  BANNER_REFRESH_INTERVAL,
  MAX_AD_RETRY_ATTEMPTS,
  AD_RETRY_DELAY,
} from '../../utils/adConfig';
import { isAdMobInitialized, BannerAdSize, TestIds } from '../../services/adManager';

// Dynamic import to handle web platform gracefully
let BannerAd: any;

if (!isWeb && Platform.OS !== 'web') {
  try {
    const adsModule = require('react-native-google-mobile-ads');
    BannerAd = adsModule.BannerAd;
  } catch (error) {
    if (__DEV__) console.warn('BannerAd component not available:', error);
  }
}

interface BannerAdComponentProps {
  style?: ViewStyle;
  refreshInterval?: number;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  style, 
  refreshInterval = BANNER_REFRESH_INTERVAL 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adKeyRef = useRef(0); // Force re-render on retry

  // Use test ID in development, production ID otherwise
  const adUnitId = __DEV__ ? TestIds.BANNER : BANNER_AD_UNIT_ID;

  // Skip ads on web or if AdMob not initialized
  if (isWeb || !isMobile || !isAdMobInitialized()) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  const handleAdLoaded = () => {
    if (__DEV__) console.log('BannerAd: Ad loaded successfully');
    setIsLoaded(true);
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
  };

  const handleAdFailedToLoad = (error: any) => {
    if (__DEV__) console.error('BannerAd: Failed to load:', error);
    setIsLoaded(false);
    setIsLoading(false);
    setHasError(true);

    // Retry logic with exponential backoff
    if (retryCount < MAX_AD_RETRY_ATTEMPTS) {
      const delay = AD_RETRY_DELAY * Math.pow(2, retryCount);
      if (__DEV__) console.log(`BannerAd: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_AD_RETRY_ATTEMPTS})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        adKeyRef.current += 1; // Force re-render
        setIsLoading(true);
      }, delay);
    } else {
      if (__DEV__) console.log('BannerAd: Max retry attempts reached, showing placeholder');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Reset error state when retrying
  useEffect(() => {
    if (retryCount > 0) {
      setHasError(false);
    }
  }, [retryCount]);

  return (
    <View style={[styles.container, style]}>
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
      
      {hasError && retryCount >= MAX_AD_RETRY_ATTEMPTS && (
        <View style={styles.placeholder} />
      )}

      {(!hasError || retryCount < MAX_AD_RETRY_ATTEMPTS) && BannerAd && (
        <BannerAd
          key={adKeyRef.current}
          unitId={adUnitId}
          size={BannerAdSize?.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  placeholder: {
    width: '100%',
    height: 50,
    backgroundColor: '#374151',
    borderRadius: 4,
    opacity: 0.3,
  },
  loadingContainer: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BannerAdComponent;
