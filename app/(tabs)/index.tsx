import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { initializeQuestionCaches } from '../../services/quizApi';
import {
  Play,
  Zap,
  X,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  FadeInUp,
  FadeInDown,
  SlideInUp,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Dropdown Component with Modal
const Dropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select...',
}: {
  label: string;
  options: { id: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedOption = options.find(opt => opt.id === selectedValue);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.dropdownWrapper}>
        <Pressable
          style={styles.dropdownButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedOption?.label || placeholder}
          </Text>
          <Text style={styles.dropdownArrow}>
            ▼
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.modalOption,
                  selectedValue === option.id && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  setIsModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.id && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Animated Starfield Background Component - Cosmic Theme
const StarField = () => {
  const stars = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
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

const AnimatedStar = ({ star }: { star: any }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Twinkling effect with scale animation
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0.3, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ),
        -1,
        true
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
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

// Compact Card Component with Press Effects
const Card = ({
  icon,
  label,
  isSelected,
  onPress,
  delay = 0,
  isCategory = false
}: {
  icon?: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  delay?: number;
  isCategory?: boolean;
}) => {
  const scale = useSharedValue(1);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 750 }),
          withTiming(1, { duration: 750 })
        ),
        -1
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardPressable}
      >
        <Animated.View
          style={[
            isCategory ? styles.categoryCard : styles.card,
            isSelected && (isCategory ? styles.selectedCategoryCard : styles.selectedCard),
            animatedStyle,
          ]}
        >
          {icon && <Text style={isCategory ? styles.categoryCardIcon : styles.cardIcon}>{icon}</Text>}
          <Text
            style={isCategory ? styles.categoryCardLabel : styles.cardLabel}
            numberOfLines={isCategory ? 2 : undefined}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const categories = [
  { id: 'afrobeats', icon: '🎵', label: 'Afrobeats' },
  { id: 'gospel', icon: '✝️', label: 'Gospel' },
  { id: 'highlife', icon: '🥁', label: 'Highlife' },
  { id: 'throwback', icon: '📻', label: 'Throwback' },
  { id: 'blues', icon: '🌍', label: 'Global' },
];

const gameTypes = [
  { id: 'song', icon: '🎤', label: 'Song' },
  { id: 'artist', icon: '👤', label: 'Artist' },
  { id: 'both', icon: '📝', label: 'Both' },
];


const quizModes = [
  { id: 'audio', icon: '🎵', label: 'Audio' },
  { id: 'lyrics', icon: '📝', label: 'Lyrics' },
];

const difficulties = [
  { id: 'easy', label: 'Normal' },
  { id: 'hard', label: 'Challenge' },
];

// Question count is now fixed at 10

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('afrobeats');
  const [selectedGameType, setSelectedGameType] = useState('song');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  // Question count is fixed at 10
  const [speedMode, setSpeedMode] = useState(false);
  const [selectedQuizMode, setSelectedQuizMode] = useState('audio');

  // Animation values
  const musicIconFloat = useSharedValue(0);
  const startButtonScale = useSharedValue(1);

  // Floating animation for music icon
  useEffect(() => {
    musicIconFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(0, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ),
      -1,
      true
    );
  }, []);

  // Prefetch questions cache on app launch (lyrics playable offline)
  useEffect(() => {
    initializeQuestionCaches().catch(() => {});
  }, []);

  const musicIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: musicIconFloat.value }],
  }));

  const startButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: startButtonScale.value }],
  }));

  const handleStartGame = () => {
    startButtonScale.value = withSpring(0.95, {}, () => {
      startButtonScale.value = withSpring(1);
    });

    // Navigate to game screen with selected options
    router.push({
      pathname: '/game',
      params: {
        category: selectedCategory,
        gameplay: selectedGameType,
        difficulty: selectedDifficulty === 'easy' ? 'easy' : 'hard',
        speedMode: speedMode.toString(),
        count: '10',
        quizMode: selectedQuizMode,
      },
    });
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Animated Starfield Background */}
      <StarField />

      <SafeAreaView style={styles.safeAreaAbsolute}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.headerAbsolute}>
            <Animated.Text style={[styles.musicIcon, musicIconStyle]}>🎵</Animated.Text>
            <Text style={styles.title}>AfroBeats Quiz</Text>
            <Text style={styles.subtitle}>Test Your Knowledge of African Music</Text>
          </Animated.View>

        {/* Choose Category */}
        <Animated.View entering={SlideInUp.delay(200)} style={styles.sectionAbsolute}>
            <Text style={styles.sectionTitle}>🎵 Choose Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((category, index) => (
                <Card
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  isSelected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  delay={index * 100}
                  isCategory={true}
                />
              ))}
            </ScrollView>
          </Animated.View>


        {/* Game Settings */}
        <Animated.View entering={SlideInUp.delay(300)} style={styles.settingsSectionAbsolute}>
            <Text style={styles.settingsTitle}>⚙️ Game Settings</Text>

            {/* Quiz Mode inside Game Settings */}
            <View style={styles.quizModeInSettings}>
              <Text style={styles.quizModeTitle}>Quiz Mode</Text>
              <View style={styles.radioButtonContainer}>
                {quizModes.map((mode, index) => (
                  <Pressable
                    key={mode.id}
                    style={styles.radioButtonRow}
                    onPress={() => setSelectedQuizMode(mode.id)}
                  >
                    <View style={styles.radioButton}>
                      {selectedQuizMode === mode.id && <View style={styles.radioButtonSelected} />}
                    </View>
                    <Text style={styles.radioButtonLabel}>{mode.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.dropdownsRow}>
              {/* Game Type Dropdown */}
              <View style={styles.dropdownWrapperFlex}>
                <Dropdown
                  label="Game Type"
                  options={gameTypes}
                  selectedValue={selectedGameType}
                  onSelect={setSelectedGameType}
                />
              </View>

              {/* Difficulty Dropdown */}
              <View style={styles.dropdownWrapperFlex}>
                <Dropdown
                  label="Difficulty"
                  options={difficulties}
                  selectedValue={selectedDifficulty}
                  onSelect={setSelectedDifficulty}
                />
              </View>
            </View>
          </Animated.View>

        {/* Speed Mode */}
        <Animated.View entering={SlideInUp.delay(500)} style={styles.speedModeAbsolute}>
          <Pressable
            style={styles.speedModePressable}
            onPress={() => setSpeedMode(!speedMode)}
          >
            <Text style={[styles.speedModeText, speedMode && styles.speedModeTextActive]}>
              Speed Mode
            </Text>
            <View style={[styles.toggleSwitch, speedMode && styles.toggleSwitchActive]}>
              <View style={[styles.toggleCircle, speedMode && styles.toggleCircleActive]} />
            </View>
          </Pressable>
        </Animated.View>

        {/* Start Button */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.startButtonAbsolute}>
          <Pressable onPress={handleStartGame} style={styles.startButtonPressable}>
            <Animated.View style={[styles.startButton, startButtonStyle]}>
              <LinearGradient
                colors={['#8a2be2', '#9d4edd']}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>
                  <Text style={styles.playIcon}>▶</Text>
                  <Text> Start Game</Text>
                </Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Disclaimer - Below start button */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
          Disclaimer: All Music belongs to respective owners. Short previews are solely for educational purposes only.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  safeAreaAbsolute: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    position: 'relative', // Allow absolute positioning of children
  },
  musicIcon: {
    fontSize: 32,
    marginBottom: 5,
    color: '#8B5CF6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(138, 43, 226, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    color: '#b8b8d1',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    gap: 10,
    paddingHorizontal: 4,
  },
  gameTypeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  splitSection: {
    flexDirection: 'row',
    gap: 10,
  },
  splitItem: {
    flex: 1,
  },
  difficultySection: {
    flex: 1.5, // More space for difficulty (longer text)
  },
  questionsSection: {
    flex: 1, // Less space for questions
  },
  smallGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  questionBox: {
    flex: 1,
    minWidth: 60,
    maxWidth: 80,
  },
  cardPressable: {
    marginHorizontal: 2,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    minHeight: 50,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    minWidth: 80,
    height: 65, // Fixed height for uniformity
  },
  selectedCard: {
    borderColor: '#8a2be2',
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  selectedCategoryCard: {
    borderColor: '#8a2be2',
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryCardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryCardLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 14,
  },
  speedModeInSettings: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  speedModePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  speedModeText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  speedModeTextActive: {
    color: '#ffd700',
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4B5563',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#F59E0B',
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 16 }],
  },
  startButtonPressable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  playIcon: {
    marginRight: 8,
  },
  disclaimerContainer: {
    position: 'absolute',
    bottom: 20, // Moved up closer to bottom menu
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  disclaimerText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  radioButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8a2be2',
  },
  radioButtonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  gameTypeSection: {
    flex: 1,
  },
  separator: {
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginHorizontal: 8,
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownArrow: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  // Layout Styles
    settingsSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 32, // Increased spacing
      marginTop: -10, // Move whole container up
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.8)',
      shadowColor: '#8a2be2',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  quizModeInSettings: {
    marginBottom: 20,
  },
  quizModeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: 8, // Reduced gap
  },
  dropdownWrapperFlex: {
    flex: 0.45, // Reduced width further
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(15, 12, 41, 0.95)',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 100,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  modalOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderColor: '#8a2be2',
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  // Absolute Positioning Styles
  headerAbsolute: {
    position: 'absolute',
    top: 35,
    left: 15,
    right: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionAbsolute: {
    position: 'absolute',
    top: 195, // Moved up 10px (205px - 10px = 195px)
    left: 15,
    right: 15,
  },
  settingsSectionAbsolute: {
    position: 'absolute',
    top: 325,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 12,
  },
  speedModeAbsolute: {
    position: 'absolute',
    top: 575, // Moved up 10px (585px - 10px = 575px)
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButtonAbsolute: {
    position: 'absolute',
    bottom: 58, // Moved up 20px (38px + 20px = 58px from bottom)
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});