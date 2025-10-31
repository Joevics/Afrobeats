import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedAudio {
  url: string;
  localPath: string;
  questionId: string;
  downloaded: boolean;
}

class AudioCacheManager {
  private cache: Map<string, CachedAudio> = new Map();
  private downloadQueue: string[] = [];
  private isDownloading = false;

  // Get cache directory path
  private getCacheDir(): string {
    return `${FileSystem.cacheDirectory}audio_cache/`;
  }

  // Initialize cache directory
  private async initCacheDir(): Promise<void> {
    const cacheDir = this.getCacheDir();
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }
  }

  // Generate local file path for audio
  private getLocalPath(url: string, questionId: string): string {
    const extension = url.split('.').pop() || 'mp3';
    return `${this.getCacheDir()}${questionId}.${extension}`;
  }

  // Download and cache audio file
  private async downloadAudio(url: string, questionId: string): Promise<string | null> {
    try {
      const localPath = this.getLocalPath(url, questionId);
      
      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        return localPath;
      }

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(url, localPath);
      
      if (downloadResult.status === 200) {
        return downloadResult.uri;
      } else {
        if (__DEV__) console.log(`Failed to download audio for ${questionId}: ${downloadResult.status}`);
        return null;
      }
    } catch (error) {
      if (__DEV__) console.log(`Error downloading audio for ${questionId}:`, error);
      return null;
    }
  }

  // Process download queue
  private async processDownloadQueue(): Promise<void> {
    if (this.isDownloading || this.downloadQueue.length === 0) {
      return;
    }

    this.isDownloading = true;

    while (this.downloadQueue.length > 0) {
      const questionId = this.downloadQueue.shift();
      if (!questionId) continue;

      const cachedAudio = this.cache.get(questionId);
      if (!cachedAudio || cachedAudio.downloaded) continue;

      try {
        const localPath = await this.downloadAudio(cachedAudio.url, questionId);
        if (localPath) {
          cachedAudio.localPath = localPath;
          cachedAudio.downloaded = true;
          this.cache.set(questionId, cachedAudio);
          if (__DEV__) console.log(`✅ Cached audio for question ${questionId}`);
        }
      } catch (error) {
        if (__DEV__) console.log(`❌ Failed to cache audio for question ${questionId}:`, error);
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isDownloading = false;
  }

  // Pre-fetch audio for questions (prioritize first 3)
  async preFetchAudio(questions: any[]): Promise<void> {
    await this.initCacheDir();

    // Add all questions to cache
    questions.forEach((question, index) => {
      if (question.audioUrl) {
        const cachedAudio: CachedAudio = {
          url: question.audioUrl,
          localPath: this.getLocalPath(question.audioUrl, question.id),
          questionId: question.id,
          downloaded: false
        };
        this.cache.set(question.id, cachedAudio);
      }
    });

    // Prioritize first 3 questions for immediate download
    const priorityQuestions = questions.slice(0, 3);
    const remainingQuestions = questions.slice(3);

    // Download first 3 immediately
    if (__DEV__) console.log('🎵 Pre-fetching audio for first 3 questions...');
    for (const question of priorityQuestions) {
      if (question.audioUrl) {
        try {
          const localPath = await this.downloadAudio(question.audioUrl, question.id);
          if (localPath) {
            const cachedAudio = this.cache.get(question.id);
            if (cachedAudio) {
              cachedAudio.localPath = localPath;
              cachedAudio.downloaded = true;
              this.cache.set(question.id, cachedAudio);
              if (__DEV__) console.log(`✅ Pre-cached audio for question ${question.id}`);
            }
          }
        } catch (error) {
          if (__DEV__) console.log(`❌ Failed to pre-cache audio for question ${question.id}:`, error);
        }
      }
    }

    // Add remaining questions to download queue for background processing
    remainingQuestions.forEach(question => {
      if (question.audioUrl) {
        this.downloadQueue.push(question.id);
      }
    });

    // Start background download process
    this.processDownloadQueue();
  }

  // Get cached audio path for a question
  getCachedAudioPath(questionId: string): string | null {
    const cachedAudio = this.cache.get(questionId);
    if (cachedAudio && cachedAudio.downloaded) {
      return cachedAudio.localPath;
    }
    return null;
  }

  // Check if audio is cached
  isAudioCached(questionId: string): boolean {
    const cachedAudio = this.cache.get(questionId);
    return cachedAudio ? cachedAudio.downloaded : false;
  }

  // Get original URL if not cached
  getOriginalUrl(questionId: string): string | null {
    const cachedAudio = this.cache.get(questionId);
    return cachedAudio ? cachedAudio.url : null;
  }

  // Clear all cached audio files
  async clearCache(): Promise<void> {
    try {
      const cacheDir = this.getCacheDir();
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        if (__DEV__) console.log('🗑️ Cleared audio cache');
      }
    } catch (error) {
      if (__DEV__) console.log('Error clearing audio cache:', error);
    }

    // Clear in-memory cache
    this.cache.clear();
    this.downloadQueue = [];
    this.isDownloading = false;
  }

  // Get cache status for debugging
  getCacheStatus(): { total: number; cached: number; pending: number } {
    const total = this.cache.size;
    const cached = Array.from(this.cache.values()).filter(audio => audio.downloaded).length;
    const pending = this.downloadQueue.length;
    
    return { total, cached, pending };
  }
}

// Export singleton instance
export const audioCache = new AudioCacheManager();

