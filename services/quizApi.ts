import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { getDeviceId } from './deviceId';
import { getLyricsQuestions as getLocalLyricsQuestions, markQuestionAsUsed, resetUsedQuestions } from '../data/lyrics';
import { getAudioQuestions as getLocalAudioQuestions, markAudioQuestionAsUsed, resetUsedAudioQuestions } from '../data/audio';
import { pickAudioApiCategoryForSession } from './categoryMap';

// Import AsyncStorage dynamically to avoid initialization issues
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  if (__DEV__) console.log('AsyncStorage not available:', error);
}

// Supabase configuration - use environment variables with fallbacks
const getSupabaseUrl = () => {
  try {
    // Try environment variable first (for production)
    if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
      return process.env.EXPO_PUBLIC_SUPABASE_URL;
    }
    // Try expo config (for development)
    if (Constants?.expoConfig?.extra?.SUPABASE_URL) {
      return Constants.expoConfig.extra.SUPABASE_URL;
    }
    // Try manifest
    if ((Constants as any)?.manifest?.extra?.SUPABASE_URL) {
      return (Constants as any).manifest.extra.SUPABASE_URL;
    }
    // Fallback hardcoded for development
    return 'https://gnsjnbwkmiqribcvpeeh.supabase.co';
  } catch (error) {
    if (__DEV__) console.log('Error reading SUPABASE_URL:', error);
    return 'https://gnsjnbwkmiqribcvpeeh.supabase.co';
  }
};

const getSupabaseKey = () => {
  try {
    // Try environment variable first (for production)
    if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    }
    // Try expo config (for development)
    if (Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY) {
      return Constants.expoConfig.extra.SUPABASE_ANON_KEY;
    }
    // Try manifest
    if ((Constants as any)?.manifest?.extra?.SUPABASE_ANON_KEY) {
      return (Constants as any).manifest.extra.SUPABASE_ANON_KEY;
    }
    // Fallback hardcoded for development
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduc2puYndrbWlxcmliY3ZwZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzkwNjgsImV4cCI6MjA3MTY1NTA2OH0.ad2mgHnVZAELxIVoJgc5NAoX_Ame5duw75P-oncLxEI';
  } catch (error) {
    if (__DEV__) console.log('Error reading SUPABASE_ANON_KEY:', error);
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduc2puYndrbWlxcmliY3ZwZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzkwNjgsImV4cCI6MjA3MTY1NTA2OH0.ad2mgHnVZAELxIVoJgc5NAoX_Ame5duw75P-oncLxEI';
  }
};

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseKey();

// Debug logging
if (__DEV__) {
  console.log('SUPABASE_URL:', SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);
  console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY.length);
}

// Only create Supabase client if credentials are provided
let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    if (__DEV__) console.log('Supabase client created successfully');
  } else {
    if (__DEV__) console.log('Supabase credentials missing');
  }
} catch (error) {
  if (__DEV__) console.log('Failed to create Supabase client:', error);
}

const API_BASE_URL: string = (Constants?.expoConfig?.extra as any)?.API_BASE_URL || (Constants as any)?.manifest?.extra?.API_BASE_URL || '';

type GetQuestionsParams = {
  category: string;
  type: 'song' | 'artist' | 'both';
  limit?: number;
};

export async function getQuestions(params: GetQuestionsParams & { deviceId?: string }) {
  if (__DEV__) console.log('Getting audio questions from Supabase:', params);

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Map the UI category to the correct audio category for the database
    const audioCategory = pickAudioApiCategoryForSession(params.category);
    if (__DEV__) console.log(`Mapped category '${params.category}' to audio category '${audioCategory}'`);

    let questions: any[] = [];
    let error: any = null;

    if (params.type === 'both') {
      // For 'both' type, query both tables and combine results
      const [songQuery, artistQuery] = await Promise.all([
        supabase
          .from('audio_questions')
          .select('*')
          .eq('category', audioCategory)
          .order('created_at', { ascending: false })
          .limit(params.limit || 10),
        supabase
          .from('artist_audio')
          .select('*')
          .eq('category', audioCategory)
          .order('created_at', { ascending: false })
          .limit(params.limit || 10)
      ]);

      if (songQuery.error) {
        error = songQuery.error;
      } else if (artistQuery.error) {
        error = artistQuery.error;
      } else {
        // Combine results from both tables
        questions = [...(songQuery.data || []), ...(artistQuery.data || [])];
        // Shuffle and limit the combined results
        questions = questions.sort(() => Math.random() - 0.5).slice(0, params.limit || 10);
      }
    } else {
      // For single question types, use the appropriate table
      let tableName: string;
      if (params.type === 'artist') {
        tableName = 'artist_audio';
      } else {
        tableName = 'audio_questions';
      }

      const { data, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .eq('category', audioCategory)
        .order('created_at', { ascending: false })
        .limit(params.limit || 10);

      questions = data || [];
      error = queryError;
    }

    if (error) {
      throw error;
    }

    if (!questions || questions.length === 0) {
      if (__DEV__) console.log(`No audio questions found for category: ${params.category}`);
      // Fallback to local data if Supabase has no questions
      if (__DEV__) console.log('Falling back to local audio questions...');
      return getLocalAudioQuestions(params);
    }

    // Transform the data to match the expected AudioQuestion interface
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      clip_id: q.clip_id,
      audio_url: q.audio_url,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      song_title: q.song_title,
      artist_name: q.artist_name,
      category: q.category,
    }));

    if (__DEV__) {
      console.log(`Loaded ${transformedQuestions.length} audio questions from Supabase for ${params.category}`);
      transformedQuestions.forEach((item, index) => {
        console.log(`Question ${index + 1}: ${item.id} - ${item.song_title} by ${item.artist_name}`);
      });
    }

    return transformedQuestions;
  } catch (error) {
    if (__DEV__) console.error('Failed to fetch audio questions from Supabase:', error);
    throw error;
  }
}

export function markQuestionAsUsedInSession(questionId: string, isLyricsMode: boolean = false): void {
  if (isLyricsMode) {
    markQuestionAsUsed(questionId);
  } else {
    markAudioQuestionAsUsed(questionId);
  }
}

export function resetUsedQuestionsInSession(): void {
  resetUsedQuestions();
  resetUsedAudioQuestions();
}

// ============================================================================
// LEGACY API FUNCTIONS - Replaced with Direct Supabase Queries
// ============================================================================

// DEPRECATED: Audio URLs are now stored directly in audio_questions table
export async function getClips(category: string, limit = 10, deviceId?: string) {
  console.warn('getClips() is deprecated. Audio URLs are now in the audio_questions table.');
  // You can get audio URLs directly from Supabase:
  // const { data } = await supabase.from('audio_questions').select('audio_url').eq('category', category).limit(limit);
  return [];
}

// REPLACED: Get categories directly from database
export async function getCategories() {
  console.warn('getCategories() is deprecated. Using direct Supabase query.');

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Get unique categories from both tables
    const { data: lyricsCategories, error: lyricsError } = await supabase
      .from('lyrics_questions')
      .select('category')
      .order('category');

    if (lyricsError) throw lyricsError;

    const { data: audioCategories, error: audioError } = await supabase
      .from('audio_questions')
      .select('category')
      .order('category');

    if (audioError) throw audioError;

    // Combine and deduplicate categories
    const allCategories = [...lyricsCategories, ...audioCategories];
    const uniqueCategories = [...new Set(allCategories.map(item => item.category))];

    return uniqueCategories.map(category => ({ id: category, name: category }));
  } catch (error) {
    console.error('Failed to get categories from Supabase:', error);
    // Fallback to hardcoded categories
    return [
      { id: 'afrobeats', name: 'Afrobeats' },
      { id: 'gospel', name: 'Gospel' },
      { id: 'highlife', name: 'Highlife' },
      { id: 'throwback', name: 'Throwback' },
      { id: 'blues', name: 'Blues' }
    ];
  }
}

// DEPRECATED: Use saveLeaderboardScore() instead - it works directly with Supabase
export async function submitScore(body: any) {
  console.warn('submitScore() is deprecated. Use saveLeaderboardScore() instead.');
  // This function is replaced by saveLeaderboardScore() which works directly with Supabase
  throw new Error('submitScore() is deprecated. Use saveLeaderboardScore() instead.');
}


// Lyrics Quiz API Functions
// Fetches lyrics questions from Supabase instead of local data

export async function getLyricsQuestions(params: {
  category: string;
  questionType: 'song' | 'artist' | 'both';
  limit: number;
  deviceId?: string;
}) {
  if (__DEV__) console.log('Getting lyrics questions from Supabase:', params);

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    let questions: any[] = [];
    let error: any = null;

    if (params.questionType === 'both') {
      // For 'both' type, query both tables and combine results
      const [songQuery, artistQuery] = await Promise.all([
        supabase
          .from('lyrics_questions')
          .select('*')
          .eq('category', params.category)
          .order('created_at', { ascending: false })
          .limit(params.limit || 10),
        supabase
          .from('artist_lyrics')
          .select('*')
          .eq('category', params.category)
          .order('created_at', { ascending: false })
          .limit(params.limit || 10)
      ]);

      if (songQuery.error) {
        error = songQuery.error;
      } else if (artistQuery.error) {
        error = artistQuery.error;
      } else {
        // Combine results from both tables
        questions = [...(songQuery.data || []), ...(artistQuery.data || [])];
        // Shuffle and limit the combined results
        questions = questions.sort(() => Math.random() - 0.5).slice(0, params.limit || 10);
      }
    } else {
      // For single question types, use the appropriate table
      let tableName: string;
      if (params.questionType === 'artist') {
        tableName = 'artist_lyrics';
      } else {
        tableName = 'lyrics_questions';
      }

      const { data, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .eq('category', params.category)
        .order('created_at', { ascending: false })
        .limit(params.limit || 10);

      questions = data || [];
      error = queryError;
    }

    if (error) {
      throw error;
    }

    if (!questions || questions.length === 0) {
      if (__DEV__) console.log(`No lyrics questions found for category: ${params.category}`);
      // Fallback to local data if Supabase has no questions
      if (__DEV__) console.log('Falling back to local lyrics questions...');
      return getLocalLyricsQuestions(params);
    }

    // Transform the data to match the expected LyricsQuestion interface
    const transformedQuestions = questions.map(q => {
      const rawLyrics = (q as any).lyrics;
      let lyricsArray: string[] = [];
      if (Array.isArray(rawLyrics)) {
        lyricsArray = rawLyrics.filter((line: any) => typeof line === 'string' && line.trim().length > 0);
      } else if (typeof rawLyrics === 'string') {
        const single = rawLyrics.trim();
        if (single.length > 0) lyricsArray = [single];
      } else if (rawLyrics && typeof rawLyrics === 'object') {
        // Some backends may return JSON string; try to parse safely
        try {
          const parsed = JSON.parse(String(rawLyrics));
          if (Array.isArray(parsed)) {
            lyricsArray = parsed.filter((line: any) => typeof line === 'string' && line.trim().length > 0);
          }
        } catch {}
      }

      return {
        id: q.id,
        lyrics: lyricsArray,
        question_type: q.question_type,
        correct_answer: q.correct_answer,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        song_title: q.song_title,
        artist_name: q.artist_name,
        category: q.category,
      };
    });

    if (__DEV__) {
      console.log(`Loaded ${transformedQuestions.length} lyrics questions from Supabase for ${params.category}`);
      transformedQuestions.forEach((item, index) => {
        console.log(`Lyrics Question ${index + 1}: ${item.id} - ${item.song_title} by ${item.artist_name}`);
        const lyricsText = Array.isArray(item.lyrics) ? item.lyrics.join(' ') : (typeof item.lyrics === 'string' ? item.lyrics : '');
        console.log(`Lyrics: ${lyricsText ? lyricsText.substring(0, 100) : ''}...`);
      });
    }

    // Persist to local cache for offline usage (with TTL enforcement)
    try {
      if (AsyncStorage) {
        const cacheKey = getLyricsCacheKey(params.category, params.questionType);
        const payload = { ts: Date.now(), data: transformedQuestions };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
        if (__DEV__) console.log('Saved lyrics questions to cache:', cacheKey);
      }
    } catch (e) {
      if (__DEV__) console.log('Failed to save lyrics cache:', e);
    }

    return transformedQuestions;
  } catch (error) {
    if (__DEV__) console.error('Failed to fetch lyrics questions from Supabase:', error);

    // Try to load from persistent cache before falling back
    try {
      if (AsyncStorage) {
        const cacheKey = getLyricsCacheKey(params.category, params.questionType);
        const stored = await AsyncStorage.getItem(cacheKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const data = Array.isArray(parsed?.data) ? parsed.data : [];
          const ts = typeof parsed?.ts === 'number' ? parsed.ts : 0;
          if (data.length > 0 && !isLyricsCacheExpired(ts)) {
            if (__DEV__) console.log('Loaded lyrics questions from cache:', cacheKey, `(${data.length})`);
            return data;
          }
        }
      }
    } catch (cacheError) {
      if (__DEV__) console.log('Failed to load lyrics cache:', cacheError);
    }

    // Final fallback to local bundled data
    if (__DEV__) console.log('Falling back to local lyrics questions...');
    return getLocalLyricsQuestions(params);
  }
}

function getLyricsCacheKey(category: string, questionType: 'song' | 'artist' | 'both'): string {
  return `lyricsCache:${category}:${questionType}`;
}

// Cache TTL utilities
const LYRICS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
function isLyricsCacheExpired(ts: number): boolean {
  if (!ts) return true;
  return Date.now() - ts > LYRICS_CACHE_TTL_MS;
}

// ============================================================================
// LEADERBOARD SYSTEM - Category Top 10 with Accumulative Scoring (All-Time)
// ============================================================================

interface LeaderboardEntry {
  id?: string;
  device_id: string;
  username?: string;
  afrobeats_score?: number;
  gospel_score?: number;
  highlife_score?: number;
  throwback_score?: number;
  blues_score?: number;
  created_at?: string;
  updated_at?: string;
  total_score?: number; // Calculated field
}

const LEADERBOARD_STORAGE_KEY = '@leaderboard_pending_scores';
const LOCAL_SCORES_KEY = '@local_leaderboard_scores';

// Local score tracking interface
interface LocalScoreData {
  [category: string]: {
    totalScore: number;
    gamesPlayed: number;
    averagePercentage: number;
    lastUpdated: string;
  };
}

// Get local accumulated scores for all categories
export async function getLocalScores(): Promise<LocalScoreData> {
  try {
    if (!AsyncStorage) {
      if (__DEV__) console.log('AsyncStorage not available');
      return {};
    }
    const stored = await AsyncStorage.getItem(LOCAL_SCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    if (__DEV__) console.log('Failed to get local scores:', error);
    return {};
  }
}

// Update local accumulated score for a category
async function updateLocalScore(category: string, score: number, percentage: number) {
  try {
    if (!AsyncStorage) {
      if (__DEV__) console.log('AsyncStorage not available for updateLocalScore');
      return;
    }

    const localScores = await getLocalScores();
    const current = localScores[category] || {
      totalScore: 0,
      gamesPlayed: 0,
      averagePercentage: 0,
      lastUpdated: new Date().toISOString()
    };

    // Calculate new averages
    const newGamesPlayed = current.gamesPlayed + 1;
    const newTotalScore = current.totalScore + score;
    const newAveragePercentage = ((current.averagePercentage * current.gamesPlayed) + percentage) / newGamesPlayed;

    localScores[category] = {
      totalScore: newTotalScore,
      gamesPlayed: newGamesPlayed,
      averagePercentage: Math.round(newAveragePercentage),
      lastUpdated: new Date().toISOString()
    };

    await AsyncStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(localScores));

    if (__DEV__) console.log('Updated local score for', category, ':', localScores[category]);
  } catch (error) {
    if (__DEV__) console.log('Failed to update local score:', error);
  }
}

// Get total score for a specific category
export async function getLocalScoreForCategory(category: string): Promise<{ totalScore: number; gamesPlayed: number; averagePercentage: number } | null> {
  try {
    const localScores = await getLocalScores();
    return localScores[category] || null;
  } catch (error) {
    if (__DEV__) console.log('Failed to get local score for category:', error);
    return null;
  }
}

// Get all local scores summary
export async function getLocalScoresSummary(): Promise<{
  totalScore: number;
  totalGames: number;
  categoriesPlayed: number;
  averagePercentage: number;
}> {
  try {
    const localScores = await getLocalScores();
    const categories = Object.keys(localScores);

    if (categories.length === 0) {
      return { totalScore: 0, totalGames: 0, categoriesPlayed: 0, averagePercentage: 0 };
    }

    let totalScore = 0;
    let totalGames = 0;
    let totalWeightedPercentage = 0;

    categories.forEach(category => {
      const data = localScores[category];
      totalScore += data.totalScore;
      totalGames += data.gamesPlayed;
      totalWeightedPercentage += data.averagePercentage * data.gamesPlayed;
    });

    const averagePercentage = totalGames > 0 ? Math.round(totalWeightedPercentage / totalGames) : 0;

    return {
      totalScore,
      totalGames,
      categoriesPlayed: categories.length,
      averagePercentage
    };
  } catch (error) {
    if (__DEV__) console.log('Failed to get local scores summary:', error);
    return { totalScore: 0, totalGames: 0, categoriesPlayed: 0, averagePercentage: 0 };
  }
}

// Save score locally first, then sync to Supabase
export async function saveLeaderboardScore(params: {
  category: string;
  mode: 'standard' | 'challenge';
  totalQuestions: number;
  score: number;
  percentage: number;
}) {
  try {
    const deviceId = await getDeviceId();

    // Update local accumulated scores for this category
    await updateLocalScore(params.category, params.score, params.percentage);

    // Sync to Supabase - update or create user record with accumulated category scores
    try {
      await syncScoreToSupabase(params.category, params.score);
    } catch (syncError) {
      if (__DEV__) console.log('Failed to sync score to Supabase, will retry later:', syncError);
      // Score will remain in local storage
    }

  } catch (error) {
    if (__DEV__) console.log('Failed to save leaderboard score:', error);
    throw error;
  }
}

// Save score to local storage
async function saveScoreLocally(scoreData: LeaderboardEntry) {
  try {
    if (!AsyncStorage) {
      if (__DEV__) console.log('AsyncStorage not available for saveScoreLocally');
      return;
    }

    const existingScores = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
    const scores = existingScores ? JSON.parse(existingScores) : [];

    scores.push(scoreData);
    await AsyncStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(scores));

    if (__DEV__) console.log('Score saved locally:', scoreData);
  } catch (error) {
    if (__DEV__) console.log('Failed to save score locally:', error);
    throw error;
  }
}

// Sync pending scores to Supabase
export async function syncPendingScoresToSupabase() {
  try {
    if (!AsyncStorage) {
      if (__DEV__) console.log('AsyncStorage not available for syncPendingScoresToSupabase');
      return;
    }

    const existingScores = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!existingScores) return;

    const scores: any[] = JSON.parse(existingScores);
    if (scores.length === 0) return;

    const syncedScores: any[] = [];
    const failedScores: any[] = [];

    for (const score of scores) {
      try {
        // Handle both old and new score formats
        let category = score.category;
        let scoreValue = score.score;

        // If category is an object (old format), extract the string
        if (typeof category === 'object' && category !== null) {
          // This shouldn't happen with current code, but handle it just in case
          category = Object.keys(category)[0] || 'afrobeats';
          scoreValue = score.category[category] || score.score || 0;
        }

        // Skip 'total' entries as they're computed, not stored
        if (category === 'total') {
          syncedScores.push(score); // Consider them synced
          continue;
        }

        await syncScoreToSupabase(category, scoreValue);
        syncedScores.push(score);
      } catch (error) {
        failedScores.push(score);
        if (__DEV__) console.log('Failed to sync score:', score, error);
      }
    }

    // Update local storage with only failed scores
    await AsyncStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(failedScores));

    if (__DEV__) console.log(`Synced ${syncedScores.length} scores, ${failedScores.length} failed`);

  } catch (error) {
    if (__DEV__) console.log('Failed to sync pending scores:', error);
  }
}

// Sync score to Supabase (update accumulated category scores per user)
async function syncScoreToSupabase(category: string, newScore: number) {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured. Please add valid SUPABASE_URL and SUPABASE_ANON_KEY to your app.json');
    }

    const deviceId = await getDeviceId();
    const categoryColumn = getCategoryColumn(category);

    if (!categoryColumn) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Get username if available
    const username = await getUsernameLocally();

    // First, check if user already has a record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('leaderboard_data')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw fetchError;
    }

    if (existingRecord) {
      // User exists, update the category score by adding the new score
      const currentScore = existingRecord[categoryColumn] || 0;
      const updatedScore = currentScore + newScore;

      const updateData: any = {
        [categoryColumn]: updatedScore,
        updated_at: new Date().toISOString()
      };

      // Include username if available and not already set
      if (username && !existingRecord.username) {
        updateData.username = username;
      }

      const { data, error } = await supabase
        .from('leaderboard_data')
        .update(updateData)
        .eq('device_id', deviceId);

      if (error) throw error;
      if (__DEV__) console.log(`Updated ${category} score for user ${deviceId}: ${currentScore} + ${newScore} = ${updatedScore}`);
      return data;
    } else {
      // User doesn't exist, create new record
      const insertData: any = {
        device_id: deviceId,
        [categoryColumn]: newScore
      };

      // Include username if available
      if (username) {
        insertData.username = username;
      }

      const { data, error } = await supabase
        .from('leaderboard_data')
        .insert(insertData);

      if (error) throw error;
      if (__DEV__) console.log(`Created new record for user ${deviceId} with ${category} score: ${newScore}${username ? ` and username: ${username}` : ''}`);
      return data;
    }
  } catch (error) {
    if (__DEV__) console.log('Supabase sync error:', error);
    throw error;
  }
}

// Helper function to map category names to column names
function getCategoryColumn(category: string): string | null {
  const columnMap: { [key: string]: string } = {
    'afrobeats': 'afrobeats_score',
    'gospel': 'gospel_score',
    'highlife': 'highlife_score',
    'throwback': 'throwback_score',
    'blues': 'blues_score',
    'blues-foreign': 'blues_score',
    'juju': 'highlife_score', // juju belongs to highlife category
    'nigerian-gospel': 'gospel_score',
    'nigerian-hip-hop': 'afrobeats_score',
    'nigerian-r&b': 'blues_score',
    'nigerian-folk': 'throwback_score' // throwback maps to nigerian-folk
  };
  return columnMap[category] || null;
}

// Fetch top 50 leaderboard for a specific category
export async function getCategoryLeaderboard(category: string, limit = 50): Promise<LeaderboardEntry[]> {
  try {
    if (!supabase) {
      if (__DEV__) console.log('Supabase not configured, returning empty leaderboard');
      return [];
    }

    const categoryColumn = getCategoryColumn(category);
    if (!categoryColumn) {
      if (__DEV__) console.log('Invalid category:', category);
      return [];
    }

    // Get users sorted by the specific category score
    const { data: allUsers, error } = await supabase
      .from('leaderboard_data')
      .select('*')
      .not(categoryColumn, 'is', null)
      .order(categoryColumn, { ascending: false })
      .limit(limit);

    if (error) {
      if (__DEV__) console.log('Category leaderboard query error:', error);
      return [];
    }

    if (!allUsers || allUsers.length === 0) {
      return [];
    }

    if (__DEV__) console.log(`${category} leaderboard from Supabase:`, allUsers);
    return allUsers;

  } catch (error) {
    if (__DEV__) console.log('Failed to fetch category leaderboard:', error);
    return [];
  }
}

// Get user's rank in a specific category
export async function getMyCategoryRank(category: string): Promise<{ rank: number; score: number } | null> {
  try {
    const deviceId = await getDeviceId();

    if (!supabase) {
      if (__DEV__) console.log('Supabase not configured, cannot get category rank');
      return null;
    }

    const categoryColumn = getCategoryColumn(category);
    if (!categoryColumn) {
      if (__DEV__) console.log('Invalid category for rank:', category);
      return null;
    }

    // Get all users' scores for this category
    const { data: allUsers, error } = await supabase
      .from('leaderboard_data')
      .select(`device_id, ${categoryColumn}`)
      .not(categoryColumn, 'is', null)
      .order(categoryColumn, { ascending: false });

    if (error) {
      if (__DEV__) console.log('Category rank query error:', error);
      return null;
    }

    if (!allUsers || allUsers.length === 0) {
      return null;
    }

    // Find current user's rank and score
    const currentUser = allUsers.find((user: any) => user.device_id === deviceId);
    if (!currentUser) {
      return null;
    }

    const rank = allUsers.findIndex((user: any) => user.device_id === deviceId) + 1;
    const score = currentUser[categoryColumn] || 0;

    if (__DEV__) console.log(`User ${category} rank:`, { rank, score });
    return { rank, score };

  } catch (error) {
    if (__DEV__) console.log('Failed to fetch category rank:', error);
    return null;
  }
}

// Fetch top 50 overall leaderboard (sum of all category scores per user)
export async function getOverallLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  try {
    if (!supabase) {
      if (__DEV__) console.log('Supabase not configured, returning empty leaderboard');
      return [];
    }

    // Get all user records and calculate total scores
    const { data: allUsers, error } = await supabase
      .from('leaderboard_data')
      .select('*');

    if (error) {
      if (__DEV__) console.log('Leaderboard query error:', error);
      return [];
    }

    if (!allUsers || allUsers.length === 0) {
      return [];
    }

    // Calculate total scores for each user
    const leaderboard = allUsers.map((user: any) => {
      const totalScore =
        (user.afrobeats_score || 0) +
        (user.gospel_score || 0) +
        (user.highlife_score || 0) +
        (user.throwback_score || 0) +
        (user.blues_score || 0);

      return {
        ...user,
        total_score: totalScore
      };
    });

    // Sort by total score descending and take top limit
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);

    if (__DEV__) console.log('Overall leaderboard from Supabase:', sortedLeaderboard);
    return sortedLeaderboard;

  } catch (error) {
    if (__DEV__) console.log('Failed to fetch overall leaderboard:', error);
    return [];
  }
}

// Get user's rank in overall leaderboard
export async function getMyOverallRank(): Promise<{ rank: number; score: number } | null> {
  try {
    const deviceId = await getDeviceId();

    if (!supabase) {
      if (__DEV__) console.log('Supabase not configured, cannot get user rank');
      return null;
    }

    // Get all user records and calculate ranks
    const { data: allUsers, error } = await supabase
      .from('leaderboard_data')
      .select('*');

    if (error) {
      if (__DEV__) console.log('Rank query error:', error);
      return null;
    }

    if (!allUsers || allUsers.length === 0) {
      return null;
    }

    // Calculate total scores for all users
    const userTotals = allUsers.map((user: any) => {
      const totalScore =
        (user.afrobeats_score || 0) +
        (user.gospel_score || 0) +
        (user.highlife_score || 0) +
        (user.throwback_score || 0) +
        (user.blues_score || 0);

      return {
        device_id: user.device_id,
        total_score: totalScore
      };
    });

    // Sort by total score descending
    const sortedUsers = userTotals.sort((a, b) => b.total_score - a.total_score);

    // Find current user
    const currentUser = sortedUsers.find(user => user.device_id === deviceId);
    if (!currentUser) {
      return null;
    }

    // Find user's rank
    const userRank = sortedUsers.findIndex(user => user.device_id === deviceId) + 1;

    if (__DEV__) console.log('User overall rank calculated:', { rank: userRank, score: currentUser.total_score });

    return { rank: userRank, score: currentUser.total_score };

  } catch (error) {
    if (__DEV__) console.log('Failed to fetch my overall rank:', error);
    return null;
  }
}

// Username management
const USERNAME_KEY = '@user_username';

// Save username locally
export async function saveUsernameLocally(username: string) {
  try {
    if (!AsyncStorage) return;
    await AsyncStorage.setItem(USERNAME_KEY, username);
    if (__DEV__) console.log('Username saved locally:', username);
  } catch (error) {
    if (__DEV__) console.log('Failed to save username locally:', error);
  }
}

// Get username from local storage
export async function getUsernameLocally(): Promise<string | null> {
  try {
    if (!AsyncStorage) return null;
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    return username;
  } catch (error) {
    if (__DEV__) console.log('Failed to get username locally:', error);
    return null;
  }
}

// Update username in Supabase
export async function updateUsernameInSupabase(username: string) {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const deviceId = await getDeviceId();

    // Check if user record exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('leaderboard_data')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw fetchError;
    }

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('leaderboard_data')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('device_id', deviceId);

      if (error) throw error;
      if (__DEV__) console.log('Username updated in Supabase for existing user');
    } else {
      // Create new record with just username
      const { error } = await supabase
        .from('leaderboard_data')
        .insert({ device_id: deviceId, username });

      if (error) throw error;
      if (__DEV__) console.log('Username saved in Supabase for new user');
    }
  } catch (error) {
    if (__DEV__) console.log('Failed to update username in Supabase:', error);
    throw error;
  }
}

// Get pending scores count (for debugging)
export async function getPendingScoresCount(): Promise<number> {
  try {
    if (!AsyncStorage) return 0;

    const existingScores = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!existingScores) return 0;

    const scores = JSON.parse(existingScores);
    return Array.isArray(scores) ? scores.length : 0;
  } catch (error) {
    return 0;
  }
}

// Clean up old pending scores (older than 30 days) and clear corrupted data
export async function cleanupOldPendingScores() {
  try {
    if (!AsyncStorage) return;

    const existingScores = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!existingScores) return;

    const scores: any[] = JSON.parse(existingScores);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter out corrupted entries and old entries
    const validScores = scores.filter(score => {
      // Remove entries with object categories or missing required fields
      if (typeof score.category === 'object' || !score.category || !score.score) {
        return false;
      }
      // Keep only recent entries
      if (!score.created_at) return false;
      const scoreDate = new Date(score.created_at);
      return scoreDate > thirtyDaysAgo;
    });

    if (validScores.length !== scores.length) {
      await AsyncStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(validScores));
      if (__DEV__) console.log(`Cleaned up ${scores.length - validScores.length} corrupted/old pending scores`);
    }

  } catch (error) {
    if (__DEV__) console.log('Failed to cleanup old scores:', error);
  }
}

