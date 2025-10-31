import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Play, Pause, SkipForward, SkipBack, Home, Volume2, CircleCheck as CheckCircle, Circle as XCircle, Plus } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { getQuestions, saveLeaderboardScore, syncPendingScoresToSupabase, cleanupOldPendingScores, getLyricsQuestions, markQuestionAsUsedInSession, resetUsedQuestionsInSession } from '../services/quizApi';
import { pickApiCategoryForSession } from '../services/categoryMap';
import { getDeviceId } from '../services/deviceId';
import { useAudioCache } from '../hooks/useAudioCache';
// AdMob temporarily disabled for web compatibility
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

interface ApiQuestion {
  id: string;
  clip_id?: string;
  audio_url: string;
  question_type: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  song_title?: string;
  artist_name?: string;
  category?: string;
}

interface LyricsApiQuestion {
  id: string;
  lyrics: string[];
  question_type: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  song_title?: string;
  artist_name?: string;
  category?: string;
}

interface GameQuestion {
  id: string;
  clipId?: string;
  audioUrl?: string;
  lyrics?: string[];
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  artistName?: string;
  songTitle?: string;
  isLyricsMode?: boolean;
}

export default function GameScreen() {
  const params = useLocalSearchParams() as {
    category: string;
    gameplay: string;
    difficulty: string;
    speedMode: string;
    count?: string;
    quizMode: string;
  };

  // Clean up corrupted leaderboard data on component mount
  React.useEffect(() => {
    cleanupOldPendingScores();
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // Default easy mode
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameAnswers, setGameAnswers] = useState<any[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [songSaved, setSongSaved] = useState<{ [key: number]: boolean }>({});
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  
  const isFocused = useIsFocused();
  
  
  // Simple audio cache for pre-loading all songs (background only)
  const { initializeCache, loadingProgress, isInitializing, clearCache } = useAudioCache();

  const timerRef = useRef<number | null>(null);
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);
  const progressAnimation = useSharedValue(0);
  const buttonAnimations = useSharedValue([0, 0, 0, 0]);

  const currentQ = questions[currentQuestion];
  const isHardMode = params.difficulty === 'hard';
  const isSpeedMode = params.speedMode === 'true';
  const isLyricsMode = params.quizMode === 'lyrics';
  
  // Calculate timer duration based on difficulty and speed mode
  const getTimerDuration = () => {
    if (!isSpeedMode) return 0; // No timer unless speed mode
    return isHardMode ? 30 : 60; // Challenge 30s, Normal 60s
  };

  useEffect(() => {
    const bootstrap = async (retryCount = 0) => {
      const maxRetries = 2;

      try {
        const limit = params.count ? Math.min(parseInt(String(params.count), 10) || 10, 20) : 10; // Cap at 20
        const type = params.gameplay === 'artist' ? 'artist' : params.gameplay === 'both' ? 'both' : 'song';
        const apiCategory = pickApiCategoryForSession(String(params.category));

        if (!apiCategory) {
          throw new Error('Invalid category selected');
        }

        const deviceId = await getDeviceId();
        if (__DEV__) console.log('Bootstrapping game with:', { category: apiCategory, type, limit, deviceId, quizMode: params.quizMode });

        // Reset used questions for new game session
        resetUsedQuestionsInSession();

        let res: any[];
        
        if (isLyricsMode) {
          // Fetch lyrics questions from local data
          res = await getLyricsQuestions({ category: apiCategory, questionType: type, limit, deviceId });
        } else {
          // Fetch audio questions from local data
          res = await getQuestions({ category: apiCategory, type, limit, deviceId });
        }

        const mapped: GameQuestion[] = res
          .filter((q: ApiQuestion | LyricsApiQuestion) => {
            // Additional validation based on quiz mode
            let hasRequiredFields: boolean;
            if (isLyricsMode) {
              const lyricsQ = q as LyricsApiQuestion;
              hasRequiredFields = !!(lyricsQ.id && lyricsQ.lyrics && lyricsQ.correct_answer && lyricsQ.option_a && lyricsQ.option_b && lyricsQ.option_c && lyricsQ.option_d);
            } else {
              const audioQ = q as ApiQuestion;
              hasRequiredFields = !!(audioQ.id && audioQ.audio_url && audioQ.correct_answer && audioQ.option_a && audioQ.option_b && audioQ.option_c && audioQ.option_d);
            }
            
            if (!hasRequiredFields) {
              if (__DEV__) console.log('Filtering out invalid question:', q.id);
              return false;
            }
            return true;
          })
          .map((q: ApiQuestion | LyricsApiQuestion) => {
            const options = [q.option_a, q.option_b, q.option_c, q.option_d];
            const correctLetter = q.correct_answer.toUpperCase();
            const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);

            if (correctIndex === -1) {
              if (__DEV__) console.log('Invalid correct answer:', correctLetter, 'for question:', q.id);
            }

            const baseQuestion = {
              id: q.id,
              category: q.category || String(params.category),
              question: q.question_type === 'artist' ? 'Who is the artist?' : q.question_type === 'song' ? 'What is this song?' : 'Name this song and artist',
              options,
              correctAnswer: Math.max(0, correctIndex), // Ensure valid index
              artistName: q.artist_name,
              songTitle: q.song_title,
              isLyricsMode,
            };

            if (isLyricsMode) {
              const lyricsQ = q as LyricsApiQuestion;
              return {
                ...baseQuestion,
                lyrics: lyricsQ.lyrics,
              };
            } else {
              const audioQ = q as ApiQuestion;
              return {
                ...baseQuestion,
                clipId: audioQ.clip_id,
                audioUrl: audioQ.audio_url,
              };
            }
          });

        if (mapped.length === 0) {
          throw new Error('No valid questions available. Please try a different category.');
        }

        if (__DEV__) console.log(`Loaded ${mapped.length} valid questions`);
        setQuestions(mapped);
        setCurrentQuestion(0);

        // Simple cache initialization - fetch all audio URLs
        if (!isLyricsMode) {
          const audioUrls: string[] = [];
          mapped.forEach(q => {
            if (q.audioUrl) {
              audioUrls.push(q.audioUrl);
            }
          });
          if (audioUrls.length > 0) {
            initializeCache(audioUrls);
          }
        }

      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Failed to load questions. Please check your connection and try again.';

        if (__DEV__) console.log('Bootstrap error:', e);

        // Retry logic for network errors
        if (retryCount < maxRetries && (errorMsg.includes('fetch') || errorMsg.includes('network'))) {
          if (__DEV__) console.log(`Retrying bootstrap (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => bootstrap(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        Alert.alert(
          'Unable to Load Game',
          errorMsg,
          [
            {
              text: 'Retry',
              onPress: () => {
                setLoading(true);
                bootstrap(0);
              }
            },
            { text: 'Home', onPress: () => router.push('/') }
          ]
        );
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    return () => {
      // Comprehensive cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((e) => {
          if (__DEV__) console.log('Error unloading sound during cleanup:', e);
        });
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!questions.length) return;

    setIsPlaying(false);
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    if (isSpeedMode) {
      setTimeLeft(getTimerDuration());
      startTimer();
    } else {
      // Ensure timer is fully cleared in non-speed mode
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(0);
    }
    // Auto-play only when focused and question is visible (audio mode)
    if (!isLyricsMode && isFocused && !loading && !isInitializing && currentQ) {
      autoPlayCurrent();
    }

    // If this question was already answered, restore selection and lock inputs
    const existingAnswer = gameAnswers.find((a: any) => a && a.question && a.question.id === currentQ?.id);
    if (existingAnswer) {
      setSelectedAnswer(existingAnswer.selectedAnswer);
      setIsAnswered(true);
    } else {
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [currentQuestion, questions, isFocused, loading, isInitializing]);

  // Stop/unload audio when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [isFocused]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
    }
    
    // Don't auto-select answers - let user choose or skip
  };

  const handleAnswerSelect = (answerIndex: number, isTimeUp = false) => {
    try {
      if (__DEV__) console.log('Answer selected:', answerIndex, 'timeUp:', isTimeUp);
      if (isAnswered && !isTimeUp) return;

      // Prevent re-scoring if this question already has an answer recorded
      const alreadyRecorded = gameAnswers.some((a: any) => a && a.question && a.question.id === currentQ.id);
      if (alreadyRecorded && !isTimeUp) {
        if (__DEV__) console.log('Answer already recorded for this question; ignoring');
        return;
      }

      setSelectedAnswer(answerIndex);
      setIsAnswered(true);

      if (timerRef.current) clearInterval(timerRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
      }

      const isCorrect = answerIndex === currentQ.correctAnswer;
      const basePoints = isCorrect ? (isHardMode ? 2 : 1) : 0;
      const speedBonus = isCorrect && isSpeedMode && timeLeft > 0 ? (isHardMode ? 1 : 0.5) : 0;
      const points = basePoints + speedBonus;

      setScore(prev => prev + points);
      setLastPointsEarned(points);

      // Store answer for results - do this synchronously before any timeouts
      const answerData = {
        question: currentQ,
        selectedAnswer: answerIndex,
        isCorrect,
        points,
        basePoints,
        speedBonus,
        timeRemaining: timeLeft,
      };

      // Update answers state immediately
      const updatedAnswers = [...gameAnswers, answerData];
      setGameAnswers(updatedAnswers);

      // Show feedback animation
      showAnswerFeedback(isCorrect);

    // Animate selected button
    // buttonAnimations.value = buttonAnimations.value.map((_, i) =>
    //   i === answerIndex ? withSpring(1.1, {}, () => withSpring(1)) : 0
    // );

      // Store the current question index before the timeout
      const currentQuestionIndex = currentQ.id; // Use question ID instead of index
      const wasLastQuestion = currentQuestion === questions.length - 1;

      // Move to next question or finish game
      setTimeout(() => {
        try {
          if (__DEV__) console.log('Moving to next, was last:', wasLastQuestion, 'total:', questions.length);
          if (__DEV__) console.log('Current answers count:', updatedAnswers.length);
          if (!wasLastQuestion) {
            nextQuestion();
          } else {
            // For the last question, pass the updated answers directly to avoid state race conditions
            finishGame(updatedAnswers);
          }
        } catch (e) {
          if (__DEV__) console.log('Error in setTimeout:', e);
        }
      }, 2000);
    } catch (e) {
      if (__DEV__) console.log('Error in handleAnswerSelect:', e);
    }
  };

  const showAnswerFeedback = (isCorrect: boolean) => {
    setShowFeedback(true);
    // feedbackOpacity.value = withTiming(1, { duration: 300 });
    // feedbackScale.value = withSpring(1, {}, () => {
      setTimeout(() => {
        // feedbackOpacity.value = withTiming(0, { duration: 300 });
        // feedbackScale.value = withSpring(0.8);
        setShowFeedback(false);
      }, 1500);
    // });
  };

  const saveSongToList = async (questionIndex: number) => {
    try {
      // Validate that we have the necessary data
      if (!currentQ) {
        if (__DEV__) console.log('No current question data available');
        return;
      }

      // Ensure we have song title and artist data
      const songTitle = currentQ.songTitle?.trim() || 'Unknown Song';
      const artistName = currentQ.artistName?.trim() || 'Unknown Artist';

      // Skip if both title and artist are unknown (likely incomplete data)
      if (songTitle === 'Unknown Song' && artistName === 'Unknown Artist') {
        if (__DEV__) console.log('Song data incomplete, skipping save');
        return;
      }

      const song = {
        id: `${currentQ.id}_${currentQ.clipId || 'no_clip'}_${Date.now()}`,
        clipId: currentQ.clipId,
        songTitle: songTitle,
        artist: artistName,
        category: params.category || 'Unknown',
        dateAdded: new Date().toISOString(),
      };

      // Get existing songs with error handling
      let existingSongs = [];
      try {
        const stored = await AsyncStorage.getItem('savedSongs');
        if (stored) {
          existingSongs = JSON.parse(stored);
          if (!Array.isArray(existingSongs)) {
            existingSongs = []; // Reset if corrupted data
          }
        }
      } catch (parseError) {
        if (__DEV__) console.log('Error parsing saved songs, resetting:', parseError);
        existingSongs = []; // Reset if corrupted
      }

      // Check if song already exists (case-insensitive comparison)
      const normalizedTitle = songTitle.toLowerCase().trim();
      const normalizedArtist = artistName.toLowerCase().trim();

      const songExists = existingSongs.some((s: any) => {
        if (!s || typeof s !== 'object') return false;
        const existingTitle = (s.songTitle || '').toLowerCase().trim();
        const existingArtist = (s.artist || '').toLowerCase().trim();
        return existingTitle === normalizedTitle && existingArtist === normalizedArtist;
      });

      if (!songExists) {
        existingSongs.push(song);

        // Save with error handling
        try {
          await AsyncStorage.setItem('savedSongs', JSON.stringify(existingSongs));
          setSongSaved(prev => ({ ...prev, [questionIndex]: true }));
          if (__DEV__) console.log('Song saved successfully:', songTitle, 'by', artistName);
        } catch (saveError) {
          if (__DEV__) console.log('Error saving to AsyncStorage:', saveError);
          throw saveError;
        }
      } else {
        // Already saved - mark as saved for UI
        setSongSaved(prev => ({ ...prev, [questionIndex]: true }));
        if (__DEV__) console.log('Song already exists:', songTitle, 'by', artistName);
      }
    } catch (error) {
      if (__DEV__) console.log('Error saving song:', error);
      // Don't show alerts during gameplay to avoid giving away answers
    }
  };

  const nextQuestion = () => {
    if (__DEV__) console.log('Next question');
    
    // Clean up current audio before moving to next question
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    
    // Clear any pending timeouts
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsAnswered(false);
    setIsPlaying(false);
    feedbackOpacity.value = 0;
    feedbackScale.value = 0.8;
    progressAnimation.value = 0;
    buttonAnimations.value = [0, 0, 0, 0];
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      
      // Clean up current audio before moving to previous question
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      
      // Clear any pending timeouts
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsAnswered(false);
      if (__DEV__) console.log('previousQuestion: Setting isPlaying to false');
      setIsPlaying(false);
      feedbackOpacity.value = 0;
      feedbackScale.value = 0.8;
      progressAnimation.value = 0;
      buttonAnimations.value = [0, 0, 0, 0];
    }
  };

  const finishGame = async (providedAnswers?: any[]) => {
    if (__DEV__) console.log('Finishing game');

    // Clear audio cache when game ends
    clearCache();

    // Show calculating animation immediately
    setCalculatingScore(true);

    // Use provided answers if available (for last question race condition fix), otherwise use state
    const answersToUse = providedAnswers || gameAnswers;

    // Calculate final stats
    const correctAnswers = answersToUse.filter((a: any) => a && a.isCorrect).length;
    const finalAccuracy = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    // Calculate final score from answers to ensure all questions are counted
    const finalScore = answersToUse.reduce((total, answer) => {
      return total + (answer ? answer.points : 0);
    }, 0);

    // Prepare navigation data first (fast)
    const navigationData = {
      score: finalScore.toString(),
      totalQuestions: questions.length.toString(),
      category: params.category || 'Unknown',
      difficulty: params.difficulty || 'standard',
      gameplay: params.gameplay || 'song',
      quizMode: params.quizMode || 'audio',
      speedMode: params.speedMode || 'false',
      accuracy: finalAccuracy.toString(),
      answers: JSON.stringify(answersToUse.filter((a: any) => a)), // Filter out nulls
    };

    try {

      // Start both operations in parallel (non-blocking)
      const operations = [];

      // Submit score to server (non-blocking)
      operations.push(
        (async () => {
          try {
            const deviceId = await getDeviceId();
            const apiCategory = pickApiCategoryForSession(String(params.category));
            const mode = isHardMode ? 'challenge' : 'standard';

            if (deviceId && apiCategory) {
              if (__DEV__) console.log('Saving leaderboard score:', { category: apiCategory, mode, totalQuestions: questions.length, score, accuracy: finalAccuracy });
              await saveLeaderboardScore({
                category: apiCategory,
                mode,
                totalQuestions: questions.length,
                score,
                percentage: finalAccuracy,
              });

              // Try to sync any pending scores
              try {
                await syncPendingScoresToSupabase();
              } catch (syncError) {
                if (__DEV__) console.log('Failed to sync pending scores:', syncError);
              }
            } else {
              if (__DEV__) console.log('Skipping score submission - missing deviceId or category');
            }
          } catch (submitError) {
            if (__DEV__) console.log('Score submission failed, but continuing:', submitError);
          }
        })()
      );

      // Save to local history (critical for app functionality)
      operations.push(
        (async () => {
          try {
            const correctAnswers = answersToUse.filter((a: any) => a && a.isCorrect).length;
            const historyEntry = {
              id: Date.now().toString(),
              category: params.category || 'Unknown',
              difficulty: params.difficulty || 'standard',
              gameplay: params.gameplay || 'song',
              quizMode: params.quizMode || 'audio',
              score: Math.max(0, score), // Ensure non-negative
              totalQuestions: questions.length,
              accuracy: questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0,
              datePlayed: new Date().toISOString(),
              answers: answersToUse.filter((a: any) => a), // Filter out any null entries
              questions: questions.map((q, index) => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: answersToUse[index]?.selectedAnswer,
                isCorrect: answersToUse[index]?.isCorrect,
                songTitle: q.songTitle,
                artistName: q.artistName,
                isLyricsMode: q.isLyricsMode,
                lyrics: q.lyrics,
                audioUrl: q.audioUrl,
              })),
            };

            const existing = await AsyncStorage.getItem('gameHistory');
            let history = [];
            try {
              history = existing ? JSON.parse(existing) : [];
              if (!Array.isArray(history)) history = [];
            } catch (parseError) {
              if (__DEV__) console.log('Error parsing history, resetting:', parseError);
              history = [];
            }

            history.unshift(historyEntry); // Add to top
            if (history.length > 50) history.splice(50); // Keep last 50

            await AsyncStorage.setItem('gameHistory', JSON.stringify(history));
          } catch (historyError) {
            if (__DEV__) console.log('History save failed:', historyError);
          }
        })()
      );

      // Wait for a minimum time to show the animation (at least 1.5 seconds)
      const minAnimationTime = new Promise(resolve => setTimeout(resolve, 1500));
      
      // Wait for both operations to complete or minimum animation time
      await Promise.allSettled([...operations, minAnimationTime]);

    } catch (e) {
      if (__DEV__) console.log('Unexpected error in finishGame:', e);
    }

    // Always navigate to results, even if errors occurred
    if (__DEV__) console.log('Navigating to results');
    router.replace({
      pathname: '/results',
      params: navigationData,
    });
  };

  const handlePlayPause = async () => {
    if (!currentQ) return;

    if (isPlaying) {
      // Pause current playback
      setIsPlaying(false);
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      try {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
      } catch (e) {
        if (__DEV__) console.log('Error pausing audio:', e);
      }
      return;
    }

    // Start or resume playback
    setIsPlaying(true);
    autoPlayCurrent();
  };

  const autoPlayCurrent = async () => {
    try {
      if (!currentQ?.audioUrl) {
        if (__DEV__) console.log('No audio URL available');
        return;
      }

      // Clear any existing timeout
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      // Unload previous sound
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (e) {
          if (__DEV__) console.log('Error unloading previous sound:', e);
        }
        soundRef.current = null;
      }

      // Validate audio URL
      if (!currentQ.audioUrl.startsWith('http')) {
        if (__DEV__) console.log('Invalid audio URL:', currentQ.audioUrl);
        return;
      }

      
      let sound;
      
      // Load first, then play when ready to avoid early start before buffer
      const result = await Audio.Sound.createAsync(
        { uri: currentQ.audioUrl },
        { volume: 1.0, shouldPlay: false }
      );
      sound = result.sound;

      soundRef.current = sound || null;
      // Wait until loaded and not buffering, then play
      try {
        let attempts = 0;
        while (attempts < 50) { // ~5s max
          const status = await sound.getStatusAsync();
          if ('isLoaded' in status && status.isLoaded && !(status as any).isBuffering) {
            break;
          }
          await new Promise(r => setTimeout(r, 100));
          attempts += 1;
        }
      } catch {}

      await sound.playAsync();
      setIsPlaying(true);

      // Simple status listener - just handle when audio finishes
      sound?.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

    } catch (e) {
      if (__DEV__) console.log('Audio play error:', e);
      setIsPlaying(false);
      // Don't show alert during gameplay to avoid giving away answers
      if (__DEV__) console.log('Audio playback failed:', e instanceof Error ? e.message : String(e));
      
      // Try to continue the game even if audio fails
      if (currentQ) {
        if (__DEV__) console.log('Audio failed, but continuing with question');
        // The game can continue without audio - user can still answer
      }
    }
  };

  const getProgressColor = () => {
    const percentage = timeLeft / getTimerDuration();
    if (percentage > 0.6) return '#10B981';
    if (percentage > 0.3) return '#F59E0B';
    return '#EF4444';
  };

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 - progressAnimation.value }],
  }));

  // Calculating Score Animation Component
  const CalculatingScoreAnimation = () => {
    const note1Anim = useSharedValue(0);
    const note2Anim = useSharedValue(0);
    const note3Anim = useSharedValue(0);
    const waveAnim = useSharedValue(0);
    const pulseAnim = useSharedValue(0);

    React.useEffect(() => {
      note1Anim.value = withRepeat(withSequence(
        withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(0, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ), -1, true);

      setTimeout(() => {
        note2Anim.value = withRepeat(withSequence(
          withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ), -1, true);
      }, 150);

      setTimeout(() => {
        note3Anim.value = withRepeat(withSequence(
          withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ), -1, true);
      }, 300);

      waveAnim.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1);

      pulseAnim.value = withRepeat(withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ), -1);
    }, []);

    const note1Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note1Anim.value, [0, 1], [0, -25]) },
        { scale: interpolate(note1Anim.value, [0, 1], [1, 1.3]) }
      ],
      opacity: interpolate(note1Anim.value, [0, 0.5, 1], [0.6, 1, 0.6])
    }));

    const note2Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note2Anim.value, [0, 1], [0, -30]) },
        { scale: interpolate(note2Anim.value, [0, 1], [1, 1.4]) }
      ],
      opacity: interpolate(note2Anim.value, [0, 0.5, 1], [0.6, 1, 0.6])
    }));

    const note3Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note3Anim.value, [0, 1], [0, -22]) },
        { scale: interpolate(note3Anim.value, [0, 1], [1, 1.2]) }
      ],
      opacity: interpolate(note3Anim.value, [0, 0.5, 1], [0.6, 1, 0.6])
    }));

    const waveStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: interpolate(waveAnim.value, [0, 1], [-width, width]) }]
    }));

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseAnim.value }]
    }));

    return (
      <View style={styles.loadingContainer}>
        {/* Animated Wave Background */}
        <Animated.View style={[styles.waveBackground, waveStyle]}>
          <View style={styles.waveLine} />
          <View style={[styles.waveLine, { height: 2, opacity: 0.6 }]} />
          <View style={[styles.waveLine, { height: 1, opacity: 0.3 }]} />
        </Animated.View>

        {/* Musical Notes */}
        <View style={styles.notesContainer}>
          <Animated.Text style={[styles.musicalNote, note1Style]}>♪</Animated.Text>
          <Animated.Text style={[styles.musicalNote, note2Style]}>♫</Animated.Text>
          <Animated.Text style={[styles.musicalNote, note3Style]}>♪</Animated.Text>
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>Calculating your score…</Text>
        <Text style={styles.loadingSubtext}>Almost there!</Text>
      </View>
    );
  };

  // Musical Loading Animation Components
  const MusicalLoadingAnimation = () => {
    const note1Anim = useSharedValue(0);
    const note2Anim = useSharedValue(0);
    const note3Anim = useSharedValue(0);
    const waveAnim = useSharedValue(0);
    const pulseAnim = useSharedValue(0);

    React.useEffect(() => {
      note1Anim.value = withRepeat(withSequence(
        withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(0, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ), -1, true);

      setTimeout(() => {
        note2Anim.value = withRepeat(withSequence(
          withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ), -1, true);
      }, 200);

      setTimeout(() => {
        note3Anim.value = withRepeat(withSequence(
          withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        ), -1, true);
      }, 400);

      waveAnim.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1);

      pulseAnim.value = withRepeat(withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ), -1);
    }, []);

    const note1Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note1Anim.value, [0, 1], [0, -20]) },
        { scale: interpolate(note1Anim.value, [0, 1], [1, 1.2]) }
      ],
      opacity: interpolate(note1Anim.value, [0, 0.5, 1], [0.5, 1, 0.5])
    }));

    const note2Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note2Anim.value, [0, 1], [0, -25]) },
        { scale: interpolate(note2Anim.value, [0, 1], [1, 1.3]) }
      ],
      opacity: interpolate(note2Anim.value, [0, 0.5, 1], [0.5, 1, 0.5])
    }));

    const note3Style = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(note3Anim.value, [0, 1], [0, -18]) },
        { scale: interpolate(note3Anim.value, [0, 1], [1, 1.1]) }
      ],
      opacity: interpolate(note3Anim.value, [0, 0.5, 1], [0.5, 1, 0.5])
    }));

    const waveStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: interpolate(waveAnim.value, [0, 1], [-width, width]) }]
    }));

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseAnim.value }]
    }));

    return (
      <View style={styles.loadingContainer}>
        {/* Animated Wave Background */}
        <Animated.View style={[styles.waveBackground, waveStyle]}>
          <View style={styles.waveLine} />
          <View style={[styles.waveLine, { height: 2, opacity: 0.6 }]} />
          <View style={[styles.waveLine, { height: 1, opacity: 0.3 }]} />
        </Animated.View>

        {/* Musical Notes */}
        <View style={styles.notesContainer}>
          <Animated.Text style={[styles.musicalNote, note1Style]}>♪</Animated.Text>
          <Animated.Text style={[styles.musicalNote, note2Style]}>♫</Animated.Text>
          <Animated.Text style={[styles.musicalNote, note3Style]}>♪</Animated.Text>
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>Loading quiz…</Text>
        <Text style={styles.loadingSubtext}>Preparing your musical adventure</Text>
      </View>
    );
  };

  if (loading || !currentQ || isInitializing) {
    return (
      <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <MusicalLoadingAnimation />
          {isInitializing && (
            <View style={styles.cacheProgressContainer}>
              <Text style={styles.cacheProgressText}>
                Preparing audio... {loadingProgress.percentage}%
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (calculatingScore) {
    return (
      <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <CalculatingScoreAnimation />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#111827', '#1F2937', '#111827']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={async () => {
              try {
                if (stopTimeoutRef.current) {
                  clearTimeout(stopTimeoutRef.current);
                  stopTimeoutRef.current = null;
                }
                if (soundRef.current) {
                  await soundRef.current.stopAsync().catch(() => {});
                  await soundRef.current.unloadAsync().catch(() => {});
                  soundRef.current = null;
                }
              } finally {
                router.back();
              }
            }}
          >
            <Home size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.questionCounter}>
              {currentQuestion + 1}/{questions.length}
            </Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.categoryText}>{params.category}</Text>
            {!isLyricsMode && (
              <Text style={styles.cacheProgressText}>
                {loadingProgress.percentage}%
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar - Only show in speed mode */}
        {isSpeedMode && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: getProgressColor() + '30' }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: getProgressColor(), width: `${(timeLeft / getTimerDuration()) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.timerText, { color: getProgressColor() }]}>
              {timeLeft}s
            </Text>
          </View>
        )}

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          <Text style={styles.questionSubtext}>
            {isLyricsMode ? 'Read the lyrics below' : `Listening to: ${params.difficulty === 'hard' ? '5' : '10'} seconds`}
            {isSpeedMode && ` • ${getTimerDuration()}s timer`}
          </Text>
        </View>

        {/* Lyrics Display (only for lyrics mode) */}
        {isLyricsMode && currentQ.lyrics && (
          <View style={styles.lyricsContainer}>
            {(() => {
              // Normal mode: show all 2 lines, Challenge mode: show only 1 line
              const linesToShow = isHardMode ? 1 : 2;
              const displayedLyrics = Array.isArray(currentQ.lyrics) 
                ? currentQ.lyrics.slice(0, linesToShow)
                : [currentQ.lyrics];
              
              return displayedLyrics.map((line, index) => (
                <Text key={index} style={styles.lyricsText}>{line}</Text>
              ));
            })()}
          </View>
        )}

        {/* Audio Controls (only for audio mode) */}
        {!isLyricsMode && (
        <View style={styles.audioControlsWrapper}>
          <View style={styles.audioContainer}>
            {/* Previous Button */}
            <TouchableOpacity
              style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
              onPress={previousQuestion}
              disabled={currentQuestion === 0}
            >
              <LinearGradient
                colors={currentQuestion === 0 ? ['#4B5563', '#374151'] : ['#6B7280', '#4B5563']}
                style={styles.navButtonGradient}
              >
                <SkipBack size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.audioButton}
              onPress={handlePlayPause}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.audioButtonGradient}
              >
                {isPlaying ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <Play size={32} color="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={[styles.navButton, currentQuestion === questions.length - 1 && styles.navButtonDisabled]}
              onPress={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              <LinearGradient
                colors={currentQuestion === questions.length - 1 ? ['#4B5563', '#374151'] : ['#6B7280', '#4B5563']}
                style={styles.navButtonGradient}
              >
                <SkipForward size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.audioInfo}>
            <Volume2 size={16} color="#9CA3AF" />
            <Text style={styles.audioText}>
              {isPlaying ? 'Now Playing...' : 'Tap to Play'}
            </Text>
          </View>
        </View>
        )}

        {/* Banner Ad - Temporarily disabled */}
        {/* <View style={styles.bannerAdContainer}>
          <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View> */}

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {/* Add to Song List Button and Disclaimer */}
          <View style={styles.addToListContainer}>
            <TouchableOpacity
              style={[
                styles.addToListButton,
                songSaved[currentQuestion] && styles.addToListButtonSaved,
              ]}
              onPress={() => saveSongToList(currentQuestion)}
              disabled={songSaved[currentQuestion]}
            >
              <Plus 
                size={16} 
                color={songSaved[currentQuestion] ? '#10B981' : '#9CA3AF'} 
              />
              <Text style={[
                styles.addToListText,
                songSaved[currentQuestion] && styles.addToListTextSaved,
              ]}>
                {songSaved[currentQuestion] ? 'Added to List' : 'Add to Song List'}
              </Text>
            </TouchableOpacity>
            
          </View>

          {currentQ.options.map((option, index) => {
            const answeredBefore = gameAnswers.some((a: any) => a && a.question && a.question.id === currentQ.id);
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQ.correctAnswer;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  showCorrect && styles.correctOption,
                  showWrong && styles.wrongOption,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered || answeredBefore}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.answeredOptionText,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && (
                  <CheckCircle size={20} color="#10B981" />
                )}
                {showWrong && (
                  <XCircle size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback Overlay */}
        {showFeedback && (
          <View style={[styles.feedbackOverlay]}>
            <View style={styles.feedbackContent}>
              {selectedAnswer === currentQ.correctAnswer ? (
                <>
                  <CheckCircle size={48} color="#10B981" />
                  <Text style={styles.feedbackText}>Correct! 🎉</Text>
                  <Text style={styles.feedbackPoints}>
                    +{lastPointsEarned} points
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={48} color="#EF4444" />
                  <Text style={styles.feedbackText}>Not quite! 😔</Text>
                  <Text style={styles.feedbackAnswer}>
                    Answer: {currentQ.options[currentQ.correctAnswer]}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Quiz Disclaimer */}
        <View style={styles.quizDisclaimerContainer}>
          <Text style={styles.quizDisclaimerText}>
            All music belongs to their respective owners. Used for educational purposes only.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  waveLine: {
    width: width * 0.8,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginVertical: 4,
  },
  loadingPlayButton: {
    marginBottom: 40,
  },
  loadingPlayGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  musicalNote: {
    fontSize: 32,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  homeButton: {
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  scoreText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  categoryText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    minWidth: 40,
    textAlign: 'center',
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  audioButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF620',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#10B98120',
  },
  wrongOption: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444420',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  answeredOptionText: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    width: 200,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#374151',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  feedbackContent: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  feedbackPoints: {
    fontSize: 16,
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  feedbackAnswer: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  addToListContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B556320',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    gap: 6,
    alignSelf: 'center',
    maxWidth: 200,
  },
  addToListButtonSaved: {
    backgroundColor: '#10B98120',
    borderColor: '#10B981',
  },
  addToListText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
  },
  addToListTextSaved: {
    color: '#10B981',
  },
  gameDisclaimerText: {
    color: '#6B7280',
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 8,
    maxWidth: 250,
  },
  quizDisclaimerContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  quizDisclaimerText: {
    color: '#6B7280',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  lyricsContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  lyricsText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cacheProgressContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  cacheProgressText: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: 'Inter-Medium',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioControlsWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  // Ad-related styles - Temporarily disabled
  // bannerAdContainer: {
  //   alignItems: 'center',
  //   marginVertical: 12,
  //   paddingHorizontal: 20,
  // },
});