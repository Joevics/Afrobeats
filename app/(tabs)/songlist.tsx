import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Search, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InterstitialAdComponent from '../../components/ads/InterstitialAdComponent';
import BannerAdComponent from '../../components/ads/BannerAdComponent';

interface SavedSong {
  id: string;
  songTitle: string;
  artist: string;
  category: string;
  dateAdded: string;
}

export default function SongListScreen() {
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'spotify' | 'google', songTitle: string, artist: string } | null>(null);

  useEffect(() => {
    loadSavedSongs();
  }, []);

  const loadSavedSongs = async () => {
    try {
      const songs = await AsyncStorage.getItem('savedSongs');
      if (songs) {
        const parsed: SavedSong[] = JSON.parse(songs);
        const sorted = Array.isArray(parsed)
          ? [...parsed].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
          : [];
        setSavedSongs(sorted);
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading saved songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSong = async (songId: string) => {
    try {
      const updatedSongs = savedSongs.filter(song => song.id !== songId);
      setSavedSongs(updatedSongs);
      await AsyncStorage.setItem('savedSongs', JSON.stringify(updatedSongs));
    } catch (error) {
      if (__DEV__) console.error('Error removing song:', error);
    }
  };

  const handleSpotifySearch = async (songTitle: string, artist: string) => {
    // Show ad first, then open Spotify
    setPendingAction({ type: 'spotify', songTitle, artist });
    setShowInterstitialAd(true);
  };

  const handleGoogleSearch = async (songTitle: string, artist: string) => {
    // Show ad first, then open Google search
    setPendingAction({ type: 'google', songTitle, artist });
    setShowInterstitialAd(true);
  };

  const handleAdClosed = async () => {
    setShowInterstitialAd(false);
    if (pendingAction) {
      // Execute pending action after ad closes
      const { type, songTitle, artist } = pendingAction;
      
      if (type === 'spotify') {
        const raw = `${songTitle} ${artist}`.trim();
        const encoded = encodeURIComponent(raw);
        // Try multiple Spotify app-only schemes; no web fallback
        const candidates = [
          `spotify:search:${encoded}`,
          `spotify://search?q=${encoded}`,
        ];

        let opened = false;
        for (const url of candidates) {
          try {
            await Linking.openURL(url);
            opened = true;
            break;
          } catch {}
        }

        if (!opened) {
          Alert.alert('Spotify app not found', 'Use web search option');
        }
      } else if (type === 'google') {
        const query = encodeURIComponent(`${songTitle} ${artist} download`);
        const googleUrl = `https://www.google.com/search?q=${query}`;
        
        try {
          await Linking.openURL(googleUrl);
        } catch (error) {
          Alert.alert('Error', 'Could not open Google search');
        }
      }
      
      setPendingAction(null);
    }
  };

  const confirmRemove = (song: SavedSong) => {
    Alert.alert(
      'Remove Song',
      `Remove "${song.songTitle}" by ${song.artist} from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeSong(song.id) },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Afrobeats': return '🎵';
      case 'Gospel': return '✝️';
      case 'Highlife & Fuji': return '🥁';
      case 'Throwback Naija': return '📻';
      case 'Trending Hits': return '🔥';
      case 'General': return '🎶';
      default: return '🎵';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
        <View style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Ionicons name="musical-notes" size={48} color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading your songs...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

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
            <Ionicons name="heart" size={32} color="#8B5CF6" />
            <Text style={styles.title}>My Song List</Text>
            <Text style={styles.subtitle}>
              {savedSongs.length} {savedSongs.length === 1 ? 'song' : 'songs'} saved
            </Text>
          </View>

          {/* Banner Ad - Top */}
          {savedSongs.length > 0 && (
            <View style={styles.bannerAdContainer}>
              <BannerAdComponent 
                style={styles.bannerAd}
                refreshInterval={35}
              />
            </View>
          )}

          {savedSongs.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes" size={64} color="#4B5563" />
              <Text style={styles.emptyTitle}>No Songs Saved Yet</Text>
              <Text style={styles.emptyDescription}>
                Start playing quizzes and save songs you discover to build your personal collection!
              </Text>
            </View>
          ) : (
            /* Songs List */
            <View style={styles.songsContainer}>
              {savedSongs.map((song, index) => (
                <React.Fragment key={song.id}>
                  <View style={styles.songCard}>
                  <View style={styles.songHeader}>
                    <View style={styles.songInfo}>
                      <Text style={styles.categoryIcon}>{getCategoryIcon(song.category)}</Text>
                      <View style={styles.songDetails}>
                        <Text style={styles.songTitle} numberOfLines={1}>
                          {song.songTitle}
                        </Text>
                        <Text style={styles.artistName} numberOfLines={1}>
                          {song.artist}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.songMeta}>
                      <Text style={styles.dateAdded}>{formatDate(song.dateAdded)}</Text>
                    </View>
                  </View>

                  <View style={styles.songActions}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{song.category}</Text>
                    </View>
                    
                    <View style={styles.actionIcons}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleSpotifySearch(song.songTitle, song.artist)}
                      >
                        <Image 
                          source={require('../../assets/images/spotify-logo.png')} 
                          style={styles.spotifyLogo}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleGoogleSearch(song.songTitle, song.artist)}
                      >
                        <Search size={16} color="#FFFFFF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => confirmRemove(song)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                  {/* Show banner ad after every 5th song */}
                  {(index + 1) % 5 === 0 && (
                    <View style={styles.bannerAdContainer}>
                      <BannerAdComponent 
                        style={styles.bannerAd}
                        refreshInterval={50}
                      />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Interstitial Ad */}
      {showInterstitialAd && (
        <InterstitialAdComponent
          visible={showInterstitialAd}
          onAdClosed={handleAdClosed}
          onAdFailed={handleAdClosed}
        />
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  songsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  songCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  songMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dateAdded: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  removeButton: {
    padding: 4,
  },
  songActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontFamily: 'Inter-Medium',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotifyLogo: {
    width: 32,
    height: 32,
  },
  bannerAdContainer: {
    marginVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerAd: {
    width: '100%',
  },
});