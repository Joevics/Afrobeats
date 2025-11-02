import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface BannerAdComponentProps {
  style?: ViewStyle;
  refreshInterval?: number;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  style, 
  refreshInterval = 35 
}) => {
  // Placeholder banner ad - will be replaced with actual AdMob later
  // This prevents errors for now
  return (
    <View style={[styles.container, style]}>
      {/* Placeholder ad space - actual AdMob will go here */}
      <View style={styles.placeholder} />
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
});

export default BannerAdComponent;


