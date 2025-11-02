import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';

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
  useEffect(() => {
    if (visible) {
      // Simulate ad loading and show
      // In production, this will load actual AdMob interstitial
      // For now, auto-close after 1 second to prevent blocking
      const timer = setTimeout(() => {
        if (onAdClosed) {
          onAdClosed();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [visible, onAdClosed]);

  if (!visible) return null;

  // Placeholder interstitial ad - will be replaced with actual AdMob later
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onAdClosed}
    >
      <View style={styles.container}>
        <View style={styles.adContainer}>
          {/* Placeholder ad content - actual AdMob will go here */}
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
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
  adContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InterstitialAdComponent;


