import { useState, useEffect, useCallback } from 'react';
import { audioCache } from '../utils/audioCache';

interface UseAudioCacheReturn {
  initializeCache: (audioUrls: string[]) => Promise<void>;
  getCachedAudioBlob: (url: string) => Blob | null;
  isAudioCached: (url: string) => boolean;
  loadingProgress: { loaded: number; total: number; percentage: number };
  isInitializing: boolean;
  clearCache: () => void;
}

export const useAudioCache = (): UseAudioCacheReturn => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0, percentage: 0 });

  // Update loading progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const progress = audioCache.getLoadingProgress();
      setLoadingProgress(progress);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const initializeCache = useCallback(async (audioUrls: string[]) => {
    if (audioUrls.length === 0) return;

    setIsInitializing(true);
    try {
      // Start background caching without awaiting full completion
      (async () => {
        try {
          await audioCache.initializeCache(audioUrls);
          if (__DEV__) console.log('Audio cache background job completed');
        } catch (e) {
          if (__DEV__) console.error('Audio cache background error:', e);
        }
      })();

      // Resolve when progress reaches at least 50%
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          const progress = audioCache.getLoadingProgress();
          setLoadingProgress(progress);
          if (progress.total > 0 && progress.percentage >= 50) {
            clearInterval(interval);
            resolve();
          }
        }, 300);
      });

      if (__DEV__) console.log('Reached 50% audio cache progress, proceeding');
    } catch (error) {
      if (__DEV__) console.error('Failed to initialize audio cache (threshold):', error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const getCachedAudioBlob = useCallback((url: string): Blob | null => {
    try {
      // Check if audio is cached
      if (audioCache.isAudioCached(url)) {
        const blob = audioCache.getCachedAudioBlob(url);
        if (blob) {
          if (__DEV__) console.log('Retrieved cached audio blob:', url);
          return blob;
        }
      }
      
      if (__DEV__) console.warn('Audio not cached:', url);
      return null;
    } catch (error) {
      if (__DEV__) console.error('Error getting cached audio:', url, error);
      return null;
    }
  }, []);

  const isAudioCached = useCallback((url: string): boolean => {
    return audioCache.isAudioCached(url);
  }, []);

  const clearCache = useCallback(() => {
    audioCache.clearCache();
    setLoadingProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);

  return {
    initializeCache,
    getCachedAudioBlob,
    isAudioCached,
    loadingProgress,
    isInitializing,
    clearCache
  };
};
