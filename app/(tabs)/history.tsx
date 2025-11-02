import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  Calendar,
  Trophy,
  Clock,
  Music,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BannerAdComponent from '../../components/ads/BannerAdComponent';
// AdMob temporarily disabled for web compatibility
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function HistoryScreen() {
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      // Set a maximum loading time of 1 second
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 1000);
      });

      const loadPromise = AsyncStorage.getItem('gameHistory');

      const result = await Promise.race([loadPromise, timeoutPromise]);

      if (result === 'timeout') {
        if (__DEV__) console.log('History loading timed out, using empty array');
        setGameHistory([]);
      } else if (result) {
        const parsedHistory = JSON.parse(result);
        if (__DEV__) console.log('Loaded history:', parsedHistory);
        setGameHistory(parsedHistory);
      } else {
        setGameHistory([]);
      }
    } catch (e) {
      if (__DEV__) console.log('Error loading history:', e);
      setGameHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Reload history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  if (loading) {
    return (
      <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
        <View style={styles.safeArea}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#9CA3AF' }}>Loading history...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

const mockGameHistory = [
  {
    id: '1',
    date: '2024-01-15',
    category: 'Afrobeats',
    gameplay: 'Both Title & Artist',
    difficulty: 'Hard',
    score: 180,
    rank: '#12',
    questionsCorrect: 9,
    totalQuestions: 10,
    timeSpent: '8:45',
  },
  {
    id: '2',
    date: '2024-01-14',
    category: 'Gospel',
    gameplay: 'Song Title Only',
    difficulty: 'Easy',
    score: 120,
    rank: '#28',
    questionsCorrect: 12,
    totalQuestions: 15,
    timeSpent: '12:30',
  },
  {
    id: '3',
    date: '2024-01-13',
    category: 'Throwback Naija',
    gameplay: 'Artist Name Only',
    difficulty: 'Hard',
    score: 160,
    rank: '#15',
    questionsCorrect: 8,
    totalQuestions: 10,
    timeSpent: '7:20',
  },
  {
    id: '4',
    date: '2024-01-12',
    category: 'Trending Hits',
    gameplay: 'Both Title & Artist',
    difficulty: 'Easy',
    score: 140,
    rank: '#22',
    questionsCorrect: 14,
    totalQuestions: 15,
    timeSpent: '15:45',
  },
  {
    id: '5',
    date: '2024-01-11',
    category: 'General',
    gameplay: 'Song Title Only',
    difficulty: 'Hard',
    score: 200,
    rank: '#8',
    questionsCorrect: 10,
    totalQuestions: 10,
    timeSpent: '6:30',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Challenge':
    case 'Hard':
      return '#EF4444';
    case 'Normal':
    case 'Easy':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Afrobeats':
      return '🎵';
    case 'Gospel':
      return '✝️';
    case 'Highlife & Fuji':
      return '🥁';
    case 'Blues':
      return '🎸';
    case 'Throwback':
      return '📻';
    case 'General':
      return '🎶';
    default:
      return '🎵';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

  const totalGames = gameHistory.length;
  const totalScore = gameHistory.reduce((sum, game) => sum + (game.score || 0), 0);
  const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  const bestScore = gameHistory.length > 0 ? Math.max(...gameHistory.map((game) => game.score || 0)) : 0;

  return (
    <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Game History</Text>
            <Text style={styles.subtitle}>Your musical journey so far</Text>
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

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{totalGames}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={24} color="#10B981" />
              <Text style={styles.statValue}>{averageScore}</Text>
              <Text style={styles.statLabel}>Avg. Score</Text>
            </View>
          </View>

          {/* Banner Ad - Top */}
          {gameHistory.length > 0 && (
            <View style={styles.bannerAdContainer}>
              <BannerAdComponent 
                style={styles.bannerAd}
                refreshInterval={35}
              />
            </View>
          )}

          {/* Games List */}
          <View style={styles.gamesContainer}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {gameHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No games played yet</Text>
                <Text style={styles.emptyStateSubtext}>Start playing to see your history!</Text>
              </View>
            ) : (
              gameHistory.map((game, index) => {
              // Map the saved data structure to display format
              const correctAnswers = game.answers ? game.answers.filter((a: any) => a.isCorrect).length : 0;
              const accuracy = game.accuracy || Math.round((correctAnswers / game.totalQuestions) * 100);
              const datePlayed = game.datePlayed || game.date;

              // Create array of components with banner ads every 5 items
              const components = [];

              // Add game card
              components.push(
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => router.push({
                    pathname: '/history-detail',
                    params: { historyId: game.id }
                  })}
                >
                  <View style={styles.gameHeader}>
                    <View style={styles.gameInfo}>
                      <Text style={styles.categoryIcon}>{getCategoryIcon(game.category)}</Text>
                      <View style={styles.gameDetails}>
                        <Text style={styles.categoryName}>{game.category}</Text>
                        <Text style={styles.gameplayMode}>
                          {game.gameplay} • {game.quizMode === 'lyrics' ? '📝 Lyrics' : '🎵 Audio'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gameRank}>
                      <Text style={[styles.rankText, { color: getDifficultyColor(game.difficulty) }]}>
                        #{index + 1}
                      </Text>
                      <Text style={styles.scoreText}>{game.score || 0} pts</Text>
                    </View>
                  </View>

                  <View style={styles.gameStats}>
                    <View style={styles.gameStatItem}>
                      <Calendar size={16} color="#9CA3AF" />
                      <Text style={styles.gameStatText}>{formatDate(datePlayed)}</Text>
                    </View>
                    <View style={styles.gameStatItem}>
                      <Music size={16} color="#9CA3AF" />
                      <Text style={styles.gameStatText}>
                        {correctAnswers}/{game.totalQuestions}
                      </Text>
                    </View>
                    <View style={styles.gameStatItem}>
                      <Clock size={16} color="#9CA3AF" />
                      <Text style={styles.gameStatText}>{game.difficulty}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(game.difficulty) }]}>
                        {game.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Accuracy Bar */}
                  <View style={styles.accuracyContainer}>
                    <Text style={styles.accuracyLabel}>Accuracy</Text>
                    <View style={styles.accuracyBar}>
                      <View
                        style={[
                          styles.accuracyFill,
                          {
                            width: `${accuracy}%`,
                            backgroundColor: getDifficultyColor(game.difficulty),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.accuracyPercentage}>
                      {accuracy}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );

              // Add banner ad every 5 items
              if ((index + 1) % 5 === 0 && index < gameHistory.length - 1) {
                components.push(
                  <View key={`banner-${index}`} style={styles.bannerAdContainer}>
                    <BannerAdComponent 
                      style={styles.bannerAd}
                      refreshInterval={50}
                    />
                  </View>
                );
              }

              return components;
            }).flat()
            )}
          </View>
        </ScrollView>
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
    paddingTop: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  gamesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  gameCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    // Add subtle shadow for clickable feel
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  gameDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  gameplayMode: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  gameRank: {
    alignItems: 'flex-end',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  scoreText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  gameStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameStatText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accuracyLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    minWidth: 60,
  },
  accuracyBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 2,
  },
  accuracyPercentage: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  bannerAdContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  bannerAd: {
    width: '100%',
  },
});