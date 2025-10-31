import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Trophy, Home, RotateCcw, Share2, CircleCheck as CheckCircle, Circle as XCircle, Star, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { pickApiCategoryForSession } from '../services/categoryMap';
import { getDeviceId } from '../services/deviceId';
// AdMob temporarily disabled for web compatibility
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Shareable Result Card Component
const ShareableResultCard = ({
  score,
  totalQuestions,
  accuracy,
  category,
  difficulty,
  speedMode,
  totalBonusPoints,
  maxPossibleScore
}: {
  score: number;
  totalQuestions: number;
  accuracy: number;
  category: string;
  difficulty: string;
  speedMode: boolean;
  totalBonusPoints: number;
  maxPossibleScore: number;
}) => {
  return (
    <View style={shareCardStyles.container}>
      {/* Header */}
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={shareCardStyles.header}>
        <Text style={shareCardStyles.appTitle}>AfroBeats Quiz</Text>
        <Text style={shareCardStyles.quizComplete}>Quiz Complete!</Text>
      </LinearGradient>

      {/* Score Display */}
      <View style={shareCardStyles.scoreSection}>
        <View style={shareCardStyles.scoreCircle}>
          <Text style={shareCardStyles.scoreText}>{score}</Text>
          <Text style={shareCardStyles.scoreMax}>/{maxPossibleScore}</Text>
        </View>
        <Text style={shareCardStyles.accuracyText}>{accuracy}% Accuracy</Text>
        {speedMode && totalBonusPoints > 0 && (
          <Text style={shareCardStyles.bonusText}>⚡ Speed Bonus: +{totalBonusPoints} points</Text>
        )}
      </View>

      {/* Game Details */}
      <View style={shareCardStyles.detailsSection}>
        <View style={shareCardStyles.detailRow}>
          <Text style={shareCardStyles.detailLabel}>Category:</Text>
          <Text style={shareCardStyles.detailValue}>{category}</Text>
        </View>
        <View style={shareCardStyles.detailRow}>
          <Text style={shareCardStyles.detailLabel}>Difficulty:</Text>
          <Text style={shareCardStyles.detailValue}>{difficulty}</Text>
        </View>
        <View style={shareCardStyles.detailRow}>
          <Text style={shareCardStyles.detailLabel}>Mode:</Text>
          <Text style={shareCardStyles.detailValue}>
            {speedMode ? 'Speed Mode' : 'Normal Mode'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={shareCardStyles.footer}>
        <Text style={shareCardStyles.footerText}>Test your African music knowledge!</Text>
        <Text style={shareCardStyles.footerHashtag}>#AfroBeatsQuiz</Text>
      </View>
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

interface ResultsParams {
  score: string;
  totalQuestions: string;
  category: string;
  difficulty: string;
  gameplay: string;
  quizMode: string;
  speedMode: string;
  answers: string;
  accuracy: string;
}

const motivationalMessages = {
  perfect: [
    "🏆 Absolutely Legendary! You're the AfroBeats Champion!",
    "🎵 Perfect Score! Your African music knowledge is unmatched!",
    "👑 Flawless Victory! You know your African music inside out!"
  ],
  excellent: [
    "🔥 Outstanding Performance! You're a true African music expert!",
    "⚡ Incredible! Your music knowledge is seriously impressive!",
    "🌟 Superb! You really know your African hits!"
  ],
  good: [
    "🎯 Great job! You're getting the hang of African music!",
    "👍 Well done! Keep practicing to improve even more!",
    "💪 Good effort! You're on the right track!"
  ],
  needsImprovement: [
    "📚 Keep learning! Every expert was once a beginner!",
    "🎵 Don't give up! African music is worth exploring!",
    "💡 Practice makes perfect! Try again soon!"
  ]
};

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as unknown as ResultsParams;
  const viewShotRef = useRef<ViewShot>(null);
  
  const score = parseInt(params.score);
  const totalQuestions = parseInt(params.totalQuestions);
  const accuracy = parseInt(params.accuracy || '0');
  
  // Parse answers to ensure we have all questions
  let answers = [];
  try {
    answers = JSON.parse(params.answers || '[]');
  } catch (e) {
    if (__DEV__) console.log('Error parsing answers:', e);
    answers = [];
  }

  // Ensure we have the correct number of answers
  if (answers.length !== totalQuestions) {
    if (__DEV__) console.log(`Warning: Expected ${totalQuestions} answers, got ${answers.length}`);
    // Fill missing answers with null
    while (answers.length < totalQuestions) {
      answers.push(null);
    }
  }

  // Calculate bonus points from speed mode
  const isSpeedMode = params.speedMode === 'true';
  const isHardMode = params.difficulty === 'hard';
  const totalBonusPoints = answers.reduce((total, answer) => {
    if (answer && answer.speedBonus) {
      return total + answer.speedBonus;
    }
    return total;
  }, 0);

  // Calculate maximum possible score
  const basePointsPerQuestion = isHardMode ? 2 : 1;
  const speedBonusPerQuestion = isSpeedMode ? (isHardMode ? 1 : 0.5) : 0;
  const maxPossibleScore = totalQuestions * (basePointsPerQuestion + speedBonusPerQuestion);

  const getMotivationalMessage = () => {
    if (accuracy === 100) {
      return motivationalMessages.perfect[Math.floor(Math.random() * motivationalMessages.perfect.length)];
    } else if (accuracy >= 80) {
      return motivationalMessages.excellent[Math.floor(Math.random() * motivationalMessages.excellent.length)];
    } else if (accuracy >= 60) {
      return motivationalMessages.good[Math.floor(Math.random() * motivationalMessages.good.length)];
    } else {
      return motivationalMessages.needsImprovement[Math.floor(Math.random() * motivationalMessages.needsImprovement.length)];
    }
  };

  const handleShare = async () => {
    try {
      if (!viewShotRef.current) {
        if (__DEV__) console.log('ViewShot ref not available');
        return;
      }

      // Capture the shareable card as an image
      const imageUri = await viewShotRef.current.capture();

      await Share.share({
        url: imageUri,
        title: 'AfroBeats Quiz - Test Your African Music Knowledge!',
        message: 'Check out my AfroBeats Quiz score! Can you beat it?',
      });
    } catch (error) {
      if (__DEV__) console.log('Error sharing:', error);
      // Fallback to text sharing if image capture fails
      try {
        const fallbackMessage = `🎵 I just scored ${score}/${maxPossibleScore} (${accuracy}%) in AfroBeats Quiz!

🌍 Discover the rich musical heritage of Africa
🎤 Test your knowledge of African music legends
🎶 From Afrobeats to Gospel, Highlife to Blues

Can you beat my score? Download AfroBeats Quiz! 🏆

#AfroBeats #AfricanMusic #MusicQuiz`;

        await Share.share({
          message: fallbackMessage,
          title: 'AfroBeats Quiz - Test Your African Music Knowledge!',
        });
      } catch (fallbackError) {
        if (__DEV__) console.log('Fallback sharing also failed:', fallbackError);
      }
    }
  };

  const handlePlayAgain = () => {
    router.replace({
      pathname: '/',
      params: {
        category: params.category,
        gameplay: params.gameplay,
        difficulty: params.difficulty,
        quizMode: params.quizMode,
      }
    });
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Animated Starfield Background */}
      <StarField />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoHome}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
        </View>

        <View style={styles.contentContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <Animated.View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}</Text>
              <Text style={styles.totalText}>/{maxPossibleScore}</Text>
            </Animated.View>
            <Text style={styles.accuracyText}>{accuracy}% Accuracy</Text>
            {isSpeedMode && totalBonusPoints > 0 && (
              <Text style={styles.bonusText}>⚡ Speed Bonus: +{totalBonusPoints} points</Text>
            )}
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>

          {/* Banner Ad 1 - Temporarily disabled */}
          {/* <View style={styles.bannerAdContainer}>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View> */}

          {/* Game Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Game Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Category</Text>
                <Text style={styles.summaryValue}>{params.category}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Type</Text>
                <Text style={styles.summaryValue}>{params.gameplay}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Difficulty</Text>
                <Text style={styles.summaryValue}>{params.difficulty}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quiz Type</Text>
                <Text style={styles.summaryValue}>{params.quizMode === 'lyrics' ? 'Lyrics' : 'Audio'}</Text>
              </View>
            </View>
          </View>

          {/* Question Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Question Breakdown</Text>
            {answers.map((answer: any, index: number) => {
              if (!answer) {
                return (
                  <View key={index} style={styles.questionItem}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>Q{index + 1}</Text>
                      <Text style={styles.questionStatus}>No Answer</Text>
                    </View>
                  </View>
                );
              }

              return (
                <View key={index} style={styles.questionItem}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>Q{index + 1}</Text>
                    {answer.isCorrect ? (
                      <CheckCircle size={20} color="#4CAF50" />
                    ) : (
                      <XCircle size={20} color="#F44336" />
                    )}
                  </View>
                  <View style={styles.answerDetails}>
                    <Text style={styles.answerText}>
                      Your Answer: {String.fromCharCode(65 + answer.selectedAnswer)}. {answer.selectedOption}
                    </Text>
                    {!answer.isCorrect && (
                      <Text style={styles.correctAnswerText}>
                        Correct: {String.fromCharCode(65 + answer.correctAnswer)}. {answer.correctOption}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Banner Ad 2 */}
          {/* Banner Ad 2 - Temporarily disabled */}
          {/* <View style={styles.bannerAdContainer}>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View> */}

          {/* Extra bottom padding so content isn't hidden behind fixed buttons */}
          <View style={{ height: 120 + insets.bottom }} />
          </ScrollView>
        </View>

        {/* Bottom Safe Area */}
        <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']} />
      </SafeAreaView>

      {/* Fixed Action Buttons */}
      <SafeAreaView edges={['bottom']} style={[styles.fixedActionBar, { paddingBottom: 10 + insets.bottom }]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#fff" />
            <Text style={styles.buttonText}>Share Score</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
            <RotateCcw size={20} color="#fff" />
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Hidden Shareable Card for Image Capture */}
      <View style={{ position: 'absolute', top: -1000, left: -1000 }}>
        <ViewShot
          ref={viewShotRef}
          options={{
            format: 'jpg',
            quality: 0.9,
            result: 'tmpfile',
          }}
        >
          <ShareableResultCard
            score={score}
            totalQuestions={totalQuestions}
            accuracy={accuracy}
            category={params.category}
            difficulty={params.difficulty}
            speedMode={isSpeedMode}
            totalBonusPoints={totalBonusPoints}
            maxPossibleScore={maxPossibleScore}
          />
        </ViewShot>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: '#0f0c29', // Dark background to match gradient
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  totalText: {
    color: '#B0BEC5',
    fontSize: 18,
  },
  accuracyText: {
    color: '#64B5F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  bonusText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  motivationalText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  breakdownTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  questionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    color: '#64B5F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionStatus: {
    color: '#B0BEC5',
    fontSize: 12,
  },
  answerDetails: {
    marginTop: 5,
  },
  answerText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  correctAnswerText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fixedActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#0f0c29',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 181, 246, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
  },
  playAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  // Ad-related styles - Temporarily disabled
  // bannerAdContainer: {
  //   alignItems: 'center',
  //   marginVertical: 12,
  //   paddingHorizontal: 20,
  // },
});

const shareCardStyles = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  quizComplete: {
    fontSize: 16,
    color: '#e0e7ff',
    fontFamily: 'Inter-Medium',
  },
  scoreSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  scoreMax: {
    fontSize: 14,
    color: '#e0e7ff',
    fontFamily: 'Inter-Medium',
  },
  accuracyText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 14,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  footerHashtag: {
    fontSize: 12,
    color: '#8B5CF6',
    fontFamily: 'Inter-Bold',
  },
});
