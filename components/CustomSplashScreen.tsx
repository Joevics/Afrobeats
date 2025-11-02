import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Animated Star Component
const AnimatedStar = ({ star }: { star: { id: number; x: number; y: number; size: number; delay: number } }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0.3, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ),
        -1,
        true
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(1, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ),
        -1,
        true
      );
    }, star.delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
        },
        animatedStyle,
      ]}
    />
  );
};

// Starfield Background
const StarField = () => {
  const stars = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3000,
    }))
  ).current;

  return (
    <View style={styles.starField}>
      {stars.map((star) => (
        <AnimatedStar key={star.id} star={star} />
      ))}
    </View>
  );
};

interface CustomSplashScreenProps {
  onFinish?: () => void;
}

export default function CustomSplashScreen({ onFinish }: CustomSplashScreenProps) {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const musicNote1 = useSharedValue(0);
  const musicNote2 = useSharedValue(0);
  const musicNote3 = useSharedValue(0);

  useEffect(() => {
    // Logo animation - scale and rotate
    logoScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }));
    logoRotation.value = withDelay(200, withSpring(360, { damping: 15, stiffness: 80 }));

    // Title animation - fade in and slide up
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));

    // Music notes animation - bounce
    musicNote1.value = withDelay(800, withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    ));
    musicNote2.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    ));
    musicNote3.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      false
    ));

    // Auto-finish after minimum display time (optional)
    if (onFinish) {
      const timer = setTimeout(() => {
        onFinish();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onFinish]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const note1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: musicNote1.value * -15 }],
    opacity: 0.7 + musicNote1.value * 0.3,
  }));

  const note2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: musicNote2.value * -15 }],
    opacity: 0.7 + musicNote2.value * 0.3,
  }));

  const note3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: musicNote3.value * -15 }],
    opacity: 0.7 + musicNote3.value * 0.3,
  }));

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <StarField />
      
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logoEmoji}>🎵</Text>
        </Animated.View>

        {/* Music Notes Animation */}
        <View style={styles.notesContainer}>
          <Animated.Text style={[styles.musicNote, note1Style]}>♪</Animated.Text>
          <Animated.Text style={[styles.musicNote, note2Style]}>♫</Animated.Text>
          <Animated.Text style={[styles.musicNote, note3Style]}>♪</Animated.Text>
        </View>

        {/* App Title */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.appTitle}>AfroBeats Quiz</Text>
          <Text style={styles.appSubtitle}>Test Your Knowledge</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, note1Style]} />
            <Animated.View style={[styles.dot, note2Style]} />
            <Animated.View style={[styles.dot, note3Style]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  logoEmoji: {
    fontSize: 60,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  musicNote: {
    fontSize: 32,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
});


