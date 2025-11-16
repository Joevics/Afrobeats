import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import ErrorBoundary from '../components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/CustomSplashScreen';
import { initializeAdMob } from '../services/adManager';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide native splash first
      SplashScreen.hideAsync();
      // Then hide custom splash after a brief moment for smooth transition
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 500);
    }
  }, [fontsLoaded, fontError]);

  // Initialize AdMob on app startup
  useEffect(() => {
    initializeAdMob().catch((error) => {
      if (__DEV__) console.error('Failed to initialize AdMob:', error);
      // Don't block app startup if AdMob fails
    });
  }, []);

  // Show custom splash screen while loading
  if (showCustomSplash || (!fontsLoaded && !fontError)) {
    return <CustomSplashScreen onFinish={() => setShowCustomSplash(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0c29' }}>
      <ErrorBoundary>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0c29' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: '#1F2937' } }} />
          <Stack.Screen 
            name="game" 
            options={{ 
              presentation: 'fullScreenModal',
              contentStyle: { backgroundColor: '#111827' },
            }} 
          />
          <Stack.Screen 
            name="results" 
            options={{ 
              presentation: 'fullScreenModal',
              contentStyle: { backgroundColor: '#0f0c29' },
            }} 
          />
          <Stack.Screen name="+not-found" options={{ contentStyle: { backgroundColor: '#0f0c29' } }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#111827" />
      </ErrorBoundary>
    </View>
  );
}