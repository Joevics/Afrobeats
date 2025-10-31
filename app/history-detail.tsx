import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Music,
  FileText,
  Calendar,
  Trophy,
  Target,
  Clock,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// AdMob temporarily disabled for web compatibility
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Animated Starfield Background Component - Cosmic Theme (copied from homepage)
const StarField = () => {
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
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
        <AnimatedStar star={star} />
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

interface HistoryDetailParams {
  historyId: string;
}

interface QuestionDetail {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  isCorrect: boolean;
  songTitle?: string;
  artistName?: string;
  isLyricsMode?: boolean;
  lyrics?: string;
  audioUrl?: string;
}

interface HistoryEntry {
  id: string;
  category: string;
  difficulty: string;
  gameplay: string;
  quizMode: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  datePlayed: string;
  questions: QuestionDetail[];
}

export default function HistoryDetailScreen() {
  const params = useLocalSearchParams() as unknown as HistoryDetailParams;
  const [historyEntry, setHistoryEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHistoryEntry = async () => {
    try {
      const history = await AsyncStorage.getItem('gameHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        const entry = parsedHistory.find((h: HistoryEntry) => h.id === params.historyId);
        if (entry) {
          setHistoryEntry(entry);
        }
      }
    } catch (e) {
      if (__DEV__) console.log('Error loading history entry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryEntry();
  }, [params.historyId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'afrobeats': 'Afrobeats',
      'gospel': 'Gospel',
      'highlife': 'Highlife',
      'throwback': 'Throwback',
      'blues': 'Blues',
      'general': 'General',
    };
    return categoryMap[category] || category;
  };

  const getGameplayDisplayName = (gameplay: string) => {
    const gameplayMap: Record<string, string> = {
      'song': 'Song',
      'artist': 'Artist',
      'both': 'Both',
    };
    return gameplayMap[gameplay] || gameplay;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        {/* Animated Starfield Background */}
        <StarField />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
          {/* Bottom Safe Area */}
          <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!historyEntry) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        {/* Animated Starfield Background */}
        <StarField />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>History entry not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
          {/* Bottom Safe Area */}
          <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const correctQuestions = historyEntry.questions.filter(q => q.isCorrect);
  const incorrectQuestions = historyEntry.questions.filter(q => !q.isCorrect);

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Animated Starfield Background */}
      <StarField />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Top Banner Ad - Temporarily disabled */}
        {/* <View style={styles.bannerAdContainer}>
          <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View> */}

        <View style={styles.contentContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Game Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Trophy size={24} color="#FFD700" />
              <Text style={styles.summaryTitle}>Game Summary</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Score</Text>
                <Text style={styles.summaryValue}>{historyEntry.score}/{historyEntry.totalQuestions}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Accuracy</Text>
                <Text style={styles.summaryValue}>{historyEntry.accuracy}%</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Category</Text>
                <Text style={styles.summaryValue}>{getCategoryDisplayName(historyEntry.category)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Type</Text>
                <Text style={styles.summaryValue}>{getGameplayDisplayName(historyEntry.gameplay)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Mode</Text>
                <Text style={styles.summaryValue}>{historyEntry.quizMode === 'lyrics' ? 'Lyrics' : 'Audio'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDate(historyEntry.datePlayed)}</Text>
              </View>
            </View>
          </View>

          {/* Correct Questions */}
          {correctQuestions.length > 0 && (
            <View style={styles.questionsSection}>
              <View style={styles.sectionHeader}>
                <CheckCircle size={20} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Correct Answers ({correctQuestions.length})</Text>
              </View>
              {correctQuestions.map((question, index) => (
                <QuestionCard
                  question={question}
                  index={index}
                  delay={index * 100}
                />
              ))}
            </View>
          )}

          {/* Middle Banner Ad - Show if more than 5 questions total - Temporarily disabled */}
          {/* {historyEntry.questions.length > 5 && (
            <View style={styles.bannerAdContainer}>
              <BannerAd
                unitId={TestIds.BANNER}
                size={BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>
          )} */}

          {/* Incorrect Questions */}
          {incorrectQuestions.length > 0 && (
            <View style={styles.questionsSection}>
              <View style={styles.sectionHeader}>
                <XCircle size={20} color="#F44336" />
                <Text style={styles.sectionTitle}>Incorrect Answers ({incorrectQuestions.length})</Text>
              </View>
              {incorrectQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  delay={index * 100}
                />
              ))}
            </View>
          )}
          </ScrollView>
        </View>

        {/* Bottom Banner Ad - Temporarily disabled */}
        {/* <View style={styles.bannerAdContainer}>
          <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View> */}

        {/* Bottom Safe Area */}
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
      </SafeAreaView>
    </LinearGradient>
  );
}

interface QuestionCardProps {
  question: QuestionDetail;
  index: number;
  delay: number;
}

function QuestionCard({ question, index, delay }: QuestionCardProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1));
    opacity.value = withDelay(delay, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.questionCard, animatedStyle]}>
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionNumber}>Q{index + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>
        {question.isCorrect ? (
          <CheckCircle size={20} color="#4CAF50" />
        ) : (
          <XCircle size={20} color="#F44336" />
        )}
      </View>

      {question.songTitle && (
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{question.songTitle}</Text>
          {question.artistName && (
            <Text style={styles.artistName}>by {question.artistName}</Text>
          )}
        </View>
      )}

      {question.isLyricsMode && question.lyrics && (
        <View style={styles.lyricsContainer}>
          <View style={styles.lyricsHeader}>
            <FileText size={16} color="#64B5F6" />
            <Text style={styles.lyricsTitle}>Lyrics</Text>
          </View>
          {Array.isArray(question.lyrics) ? (
            question.lyrics.map((line, index) => (
              <Text key={index} style={styles.lyricsText}>{line}</Text>
            ))
          ) : (
            <Text style={styles.lyricsText}>{question.lyrics}</Text>
          )}
        </View>
      )}

      <View style={styles.optionsContainer}>
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctAnswer;
          const isUserAnswer = optionIndex === question.userAnswer;
          const isWrong = !question.isCorrect && isUserAnswer;

          return (
            <View
              key={optionIndex}
              style={[
                styles.option,
                isCorrect && styles.correctOption,
                isWrong && styles.wrongOption,
              ]}
            >
              <Text style={[
                styles.optionText,
                isCorrect && styles.correctOptionText,
                isWrong && styles.wrongOptionText,
              ]}>
                {String.fromCharCode(65 + optionIndex)}. {option}
              </Text>
              {isCorrect && <CheckCircle size={16} color="#4CAF50" />}
              {isWrong && <XCircle size={16} color="#F44336" />}
            </View>
          );
        })}
      </View>
    </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
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
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
  questionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  questionInfo: {
    flex: 1,
    marginRight: 10,
  },
  questionNumber: {
    color: '#64B5F6',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  songInfo: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    borderRadius: 8,
  },
  songTitle: {
    color: '#64B5F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 2,
  },
  lyricsContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    borderRadius: 8,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lyricsTitle: {
    color: '#64B5F6',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  lyricsText: {
    color: '#E3F2FD',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginTop: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  optionText: {
    color: '#B0BEC5',
    fontSize: 12,
    flex: 1,
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  wrongOptionText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  bottomSafeArea: {
    backgroundColor: 'transparent',
  },
  // Ad-related styles - Temporarily disabled
  // bannerAdContainer: {
  //   alignItems: 'center',
  //   marginVertical: 12,
  //   paddingHorizontal: 20,
  // },
});
