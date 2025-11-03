import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Medal,
  Award,
  Share2,
  Calendar,
  TrendingUp,
  User,
  Check,
  Crown,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import ReportSongModal from '../components/ReportSongModal';
import { getOverallLeaderboard, getMyOverallRank, getCategoryLeaderboard, getMyCategoryRank, getUsernameLocally, saveUsernameLocally, updateUsernameInSupabase } from '../../services/quizApi';
import BannerAdComponent from '../../components/ads/BannerAdComponent';

const getCategoryColumn = (category: string): string => {
  const columnMap: { [key: string]: string } = {
    'afrobeats': 'afrobeats_score',
    'gospel': 'gospel_score',
    'highlife': 'highlife_score',
    'throwback': 'throwback_score',
    'blues': 'blues_score'
  };
  return columnMap[category] || 'afrobeats_score';
};

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  'overall',
  'afrobeats',
  'gospel',
  'highlife',
  'throwback',
  'blues'
];

const categoryLabels = {
  'overall': 'Overall',
  'afrobeats': 'AfroBeats',
  'gospel': 'Gospel',
  'highlife': 'Highlife',
  'throwback': 'Throwback',
  'blues': 'Global'
};

const getCategoryEmoji = (category: string) => {
  const emojis: { [key: string]: string } = {
    'overall': '🏆',
    'afrobeats': '🎵',
    'gospel': '🙏',
    'highlife': '🎷',
    'throwback': '📻',
    'blues': '🌍'
  };
  return emojis[category] || '🎵';
};

export default function LeaderboardScreen() {
  const [username, setUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [allLeaderboardData, setAllLeaderboardData] = useState<{ [key: string]: any[] }>({});
  const [allUserRanks, setAllUserRanks] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const crownAnimation = useSharedValue(0);
  const medalAnimation = useSharedValue(0);

  // Computed properties for current category
  const leaderboardData = allLeaderboardData[selectedCategory] || [];
  const currentUser = allUserRanks[selectedCategory] || null;

  // Check if user has username on mount
  useEffect(() => {
    const checkUsername = async () => {
      try {
        const storedUsername = await getUsernameLocally();
        if (storedUsername) {
          setUsername(storedUsername);
          setHasUsername(true);
        }
      } catch (error) {
        if (__DEV__) console.log('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    };

    checkUsername();
  }, []);

  // Load all leaderboard data once when username is available
  useEffect(() => {
    if (hasUsername) {
      loadAllLeaderboardData();
    }
  }, [hasUsername]);

  const loadAllLeaderboardData = async () => {
    try {
      setLoading(true);
      if (__DEV__) console.log('Loading all leaderboard data...');

      const newLeaderboardData: { [key: string]: any[] } = {};
      const newUserRanks: { [key: string]: any } = {};
      let hadAnyError = false;

      // Load all categories in parallel
      const loadPromises = CATEGORIES.map(async (category) => {
        try {
          if (category === 'overall') {
            const [leaderboard, myRank] = await Promise.all([
              getOverallLeaderboard(50),
              getMyOverallRank()
            ]);
            newLeaderboardData[category] = leaderboard || [];
            newUserRanks[category] = myRank;
          } else {
            const [leaderboard, myRank] = await Promise.all([
              getCategoryLeaderboard(category, 50),
              getMyCategoryRank(category)
            ]);
            newLeaderboardData[category] = leaderboard || [];
            newUserRanks[category] = myRank;
          }
          if (__DEV__) console.log(`${category} data loaded`);
        } catch (error) {
          if (__DEV__) console.log(`Error loading ${category}:`, error);
          newLeaderboardData[category] = [];
          newUserRanks[category] = null;
          // leave data empty on error
          hadAnyError = true;
        }
      });

      await Promise.all(loadPromises);

      setAllLeaderboardData(newLeaderboardData);
      setAllUserRanks(newUserRanks);

      if (__DEV__) console.log('All leaderboard data loaded successfully');
      // Simple alert if any category failed
      if (hadAnyError) {
        Alert.alert('Connection Required', 'Internet connection required to fetch leaderboard. Check your connection.');
      }

    } catch (error) {
      if (__DEV__) console.error('Error loading all leaderboard data:', error);
      // silent on total error, empty data already set below
      Alert.alert('Connection Required', 'Internet connection required to fetch leaderboard. Check your connection.');
      // Set empty data on error
      const emptyData = CATEGORIES.reduce((acc, category) => {
        acc[category] = [];
        return acc;
      }, {} as { [key: string]: any[] });

      const emptyRanks = CATEGORIES.reduce((acc, category) => {
        acc[category] = null;
        return acc;
      }, {} as { [key: string]: any });

      setAllLeaderboardData(emptyData);
      setAllUserRanks(emptyRanks);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    try {
      setSavingUsername(true);

      // Save locally first
      await saveUsernameLocally(username.trim());

      // Try to save to Supabase
      try {
        await updateUsernameInSupabase(username.trim());
      } catch (supabaseError) {
        if (__DEV__) console.log('Failed to save username to Supabase, but saved locally:', supabaseError);
        // Continue anyway since it's saved locally
      }

      setHasUsername(true);

    } catch (error) {
      if (__DEV__) console.log('Error saving username:', error);
      Alert.alert('Connection Error', 'Failed to save username. Please check your internet connection and try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleRefresh = async () => {
    if (hasUsername) {
      await loadAllLeaderboardData();
    }
  };

  const getCategoriesPlayed = (player: any) => {
    const categories = ['afrobeats_score', 'gospel_score', 'highlife_score', 'throwback_score', 'blues_score'];
    return categories.filter(cat => player[cat] && player[cat] > 0).length;
  };


  React.useEffect(() => {
    crownAnimation.value = withRepeat(
      withTiming(10, { duration: 2000 }),
      -1,
      true
    );
    medalAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${crownAnimation.value}deg` }],
  }));

  const medalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + medalAnimation.value * 0.1 }],
  }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankNumberText}>#{rank}</Text>
          </View>
        );
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#FFD700';
    if (rank <= 10) return '#8B5CF6';
    return '#6B7280';
  };

  const handleShare = async () => {
    if (!currentUser) return;
    try {
      await Share.share({
        message: `🎵 Just hit rank #${currentUser.rank} on AfroBeats Quiz with ${currentUser.score} points! Think you can beat my African music knowledge? 🌍 #AfroBeatsQuiz #AfricanMusic`,
        title: 'My AfroBeats Quiz Score',
      });
    } catch (error) {
      if (__DEV__) console.log('Error sharing:', error);
    }
  };

  // Show loading while checking username
  if (checkingUsername) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Checking username...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Show username input screen if user doesn't have username
  if (!hasUsername) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.usernameContainer}>
              <View style={styles.usernameHeader}>
                <User size={48} color="#8B5CF6" />
                <Text style={styles.usernameTitle}>Welcome to Leaderboards!</Text>
                <Text style={styles.usernameSubtitle}>
                  Choose a username to see how you rank against other African music fans
                </Text>
              </View>

              <View style={styles.usernameInputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.usernameInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor="#6B7280"
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  At least 3 characters. This will be visible to other players.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.usernameButton, savingUsername && styles.usernameButtonDisabled]}
                onPress={handleUsernameSubmit}
                disabled={savingUsername}
              >
                {savingUsername ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={20} color="#FFFFFF" />
                    <Text style={styles.usernameButtonText}>Continue to Leaderboards</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    );
  }

  // Show loading while fetching leaderboard data
  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading Leaderboard...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Show leaderboard with category sliders
  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={styles.safeArea}>
        <ReportSongModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
          email={'joevics.apps@gmail.com'}
          title={'Contact via Email'}
          subject={'Leaderboard Feedback/Suggestion'}
          defaultMessage={'Hello, I have feedback/suggestions about the leaderboard.'}
        />
        {/* Static Header */}
        <View style={styles.header}>
          <Animated.View style={crownStyle}>
            <Crown size={32} color="#FFD700" />
          </Animated.View>
          <Text style={styles.title}>{categoryLabels[selectedCategory as keyof typeof categoryLabels]} Leaderboard</Text>
          <Text style={styles.subtitle}>
            {selectedCategory === 'overall'
              ? 'Top players across all categories'
              : `Top players in ${categoryLabels[selectedCategory as keyof typeof categoryLabels].toLowerCase()}`
            }
          </Text>
          <Text
            onPress={() => setShowContactModal(true)}
            style={{ marginTop: 8, color: '#8B5CF6', fontWeight: '700', textDecorationLine: 'underline' }}
          >
            Report/Suggest via Email
          </Text>
        </View>

        {/* Static Category Selector - Horizontal Swipe */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            pagingEnabled={false}
            decelerationRate="fast"
            snapToInterval={120}
            snapToAlignment="start"
          >
            {CATEGORIES.map((category) => (
            <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryEmoji}>
                  {getCategoryEmoji(category)}
                </Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.selectedCategoryButtonText,
                  ]}
                >
                  {categoryLabels[category as keyof typeof categoryLabels]}
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>

        {/* Scrollable Content - Everything below category selector */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Ad - Top */}
          <View style={styles.bannerAdContainer}>
            <BannerAdComponent 
              style={styles.bannerAd}
              refreshInterval={35}
            />
          </View>

          {/* Your Rank Card */}
          {currentUser ? (
            <View style={styles.userRankCard}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.userRankGradient}
              >
                <View style={styles.userRankContent}>
                  <View style={styles.userRankLeft}>
                    <Text style={styles.userAvatar}>{'🎯'}</Text>
                    <View style={styles.userRankInfo}>
                      <Text style={styles.userRankName}>{username}</Text>
                      <Text style={styles.userRankPosition}>Rank #{currentUser.rank || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.userRankRight}>
                    <Text style={styles.userRankScore}>{currentUser.score || 0}</Text>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                      <Share2 size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.userRankStats}>
                  <View style={styles.userRankStat}>
                    <Text style={styles.userRankStatValue}>{currentUser.rank || 'N/A'}</Text>
                    <Text style={styles.userRankStatLabel}>Rank</Text>
                  </View>
                  <View style={styles.userRankStat}>
                    <Text style={styles.userRankStatValue}>{currentUser.score || 0}</Text>
                    <Text style={styles.userRankStatLabel}>Score</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.noRankCard}>
              <Text style={styles.noRankText}>No rank yet</Text>
              <Text style={styles.noRankSubtext}>Play some games to get ranked in this category!</Text>
            </View>
          )}

          {/* Top 3 Podium */}
          {leaderboardData.length >= 3 && (
            <View style={styles.podiumContainer}>
              <Text style={styles.sectionTitle}>Top 3 Champions</Text>
              <View style={styles.podium}>
                {/* Second Place */}
                <Animated.View style={[styles.podiumPlace, styles.secondPlace, medalStyle]}>
                  <Text style={styles.podiumAvatar}>{leaderboardData[1]?.avatar || '🥈'}</Text>
                  <View style={[styles.podiumRank, { backgroundColor: '#C0C0C0' }]}>
                    <Text style={styles.podiumRankText}>2</Text>
                  </View>
                  <Text style={styles.podiumName}>{leaderboardData[1]?.name || 'Player 2'}</Text>
                  <Text style={styles.podiumScore}>{leaderboardData[1]?.score || 0}</Text>
                </Animated.View>

                {/* First Place */}
                <Animated.View style={[styles.podiumPlace, styles.firstPlace, crownStyle]}>
                  <Text style={styles.podiumAvatar}>{leaderboardData[0]?.avatar || '👑'}</Text>
                  <View style={[styles.podiumRank, { backgroundColor: '#FFD700' }]}>
                    <Text style={styles.podiumRankText}>1</Text>
                  </View>
                  <Text style={styles.podiumName}>{leaderboardData[0]?.name || 'Player 1'}</Text>
                  <Text style={styles.podiumScore}>{leaderboardData[0]?.score || 0}</Text>
                </Animated.View>

                {/* Third Place */}
                <Animated.View style={[styles.podiumPlace, styles.thirdPlace, medalStyle]}>
                  <Text style={styles.podiumAvatar}>{leaderboardData[2]?.avatar || '🥉'}</Text>
                  <View style={[styles.podiumRank, { backgroundColor: '#CD7F32' }]}>
                    <Text style={styles.podiumRankText}>3</Text>
                  </View>
                  <Text style={styles.podiumName}>{leaderboardData[2]?.name || 'Player 3'}</Text>
                  <Text style={styles.podiumScore}>{leaderboardData[2]?.score || 0}</Text>
                </Animated.View>
              </View>
            </View>
          )}

          {/* Full Leaderboard */}
          <View style={styles.fullLeaderboard}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'overall' ? 'Full Rankings' : `${categoryLabels[selectedCategory as keyof typeof categoryLabels]} Rankings`}
            </Text>
            {leaderboardData.length > 0 ? (
              leaderboardData.map((player, index) => (
                <React.Fragment key={player.device_id || index}>
                  <View style={styles.playerCard}>
                  <View style={styles.playerRank}>
                    {getRankIcon(index + 1)}
                  </View>
                  <Text style={styles.playerAvatar}>{'🎵'}</Text>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.username || 'Anonymous Player'}</Text>
                    {selectedCategory === 'overall' && (
                    <View style={styles.playerStats}>
                        <Text style={styles.playerStat}>{getCategoriesPlayed(player)} categories</Text>
                    </View>
                    )}
                  </View>
                  <Text style={[styles.playerScore, { color: getRankColor(index + 1) }]}>
                    {selectedCategory === 'overall' ? (player.total_score || 0) : (player[getCategoryColumn(selectedCategory)] || 0)}
                  </Text>
                </View>

                  {/* Show banner ad after every 5th player */}
                  {(index + 1) % 5 === 0 && (
                    <View style={styles.bannerAdContainer}>
                      <BannerAdComponent 
                        style={styles.bannerAd}
                        refreshInterval={50}
                      />
                    </View>
                  )}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No data for this category yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to play and set the leaderboard!</Text>
              </View>
            )}
          </View>

          {/* Weekly Reset Notice */}
          <View style={styles.resetNotice}>
            <Calendar size={16} color="#9CA3AF" />
            <Text style={styles.resetNoticeText}>
              Leaderboard resets monthly. Last day of the month at 12:00 AM.
            </Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  userRankCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userRankGradient: {
    padding: 20,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  userRankInfo: {
    flex: 1,
  },
  userRankName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  userRankPosition: {
    fontSize: 14,
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  userRankRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  userRankScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  userRankStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  userRankStat: {
    alignItems: 'center',
  },
  userRankStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  userRankStatLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  podiumContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
  },
  podiumPlace: {
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    minWidth: 100,
  },
  firstPlace: {
    marginBottom: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondPlace: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Inter-Bold',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
  },
  fullLeaderboard: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  playerCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    fontFamily: 'Inter-SemiBold',
  },
  playerAvatar: {
    fontSize: 24,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  playerStat: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  resetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  resetNoticeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 16,
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
  noRankCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  noRankText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  noRankSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  // Username input screen styles
  usernameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  usernameHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  usernameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  usernameSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  usernameInputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  usernameInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  inputHint: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  usernameButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  usernameButtonDisabled: {
    opacity: 0.6,
  },
  usernameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  // Category selector styles
  categoryContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  categoryScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  selectedCategoryButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
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