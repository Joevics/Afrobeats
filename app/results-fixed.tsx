import React from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Trophy, Home, RotateCcw, Share2, CircleCheck as CheckCircle, Circle as XCircle, Star, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { getLeaderboard, getMyRank } from '../services/quizApi';
import { pickApiCategoryForSession } from '../services/categoryMap';
import { getDeviceId } from '../services/deviceId';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ResultsParams {
  score: string;
  totalQuestions: string;
  category: string;
  difficulty: string;
  gameplay: string;
  quizMode: string;
  answers: string;
}

const motivationalMessages = {
  perfect: [
    "🏆 Absolutely Legendary! You're the NaijaBeats Champion!",
    "🎵 Perfect Score! Your Nigerian music knowledge is unmatched!",
    "👑 Flawless Victory! You know your Nigerian music inside out!"
  ],
  excellent: [
    "🔥 Outstanding Performance! You're a true Nigerian music expert!",
    "⚡ Incredible! Your music knowledge is seriously impressive!",
    "🌟 Superb! You really know your Nigerian hits!"
  ],
  good: [
    "🎯 Great job! You're getting the hang of Nigerian music!",
    "👍 Well done! Keep practicing to improve even more!",
    "💪 Good effort! You're on the right track!"
  ],
  needsImprovement: [
    "📚 Keep learning! Every expert was once a beginner!",
    "🎵 Don't give up! Nigerian music is worth exploring!",
    "💡 Practice makes perfect! Try again soon!"
  ]
};

export default function ResultsScreen() {
  const params = useLocalSearchParams() as ResultsParams;
  
  const score = parseInt(params.score);
  const totalQuestions = parseInt(params.totalQuestions);
  const accuracy = Math.round((score / totalQuestions) * 100);
  
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
      const quizModeText = params.quizMode === 'lyrics' ? 'Lyrics' : 'Audio';
      const message = `🎵 Just scored ${score}/${totalQuestions} (${accuracy}%) in AfronBeats ${quizModeText} Quiz!\n\nCategory: ${params.category}\nType: ${params.gameplay}\n\nCan you beat my score? 🏆`;
      
      await Share.share({
        message,
        title: 'AfronBeats Quiz Score',
      });
    } catch (error) {
      if (__DEV__) console.log('Error sharing:', error);
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoHome}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <Animated.View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}</Text>
              <Text style={styles.totalText}>/{totalQuestions}</Text>
            </Animated.View>
            <Text style={styles.accuracyText}>{accuracy}% Accuracy</Text>
            <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
          </View>

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
            {answers.map((answer, index) => {
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

          {/* Action Buttons */}
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
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 30,
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
});
