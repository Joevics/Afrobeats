// Simple in-memory audio cache utility used by hooks/useAudioCache
// Provides progress reporting and cache controls.

type LoadingProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

class AudioCache {
  private urlToBlob: Map<string, Blob> = new Map();
  private totalToDownload: number = 0;
  private downloadedCount: number = 0;

  public getLoadingProgress(): LoadingProgress {
    const loaded = this.downloadedCount;
    const total = this.totalToDownload;
    const percentage = total === 0 ? 0 : Math.round((loaded / total) * 100);
    return { loaded, total, percentage };
  }

  public async initializeCache(audioUrls: string[]): Promise<void> {
    // Reset counters for a new session
    this.totalToDownload = audioUrls.length;
    this.downloadedCount = 0;

    if (audioUrls.length === 0) {
      return;
    }

    // Deduplicate URLs to avoid double work
    const uniqueUrls = Array.from(new Set(audioUrls));

    // Download sequentially to keep memory/network usage modest
    for (const url of uniqueUrls) {
      try {
        if (this.urlToBlob.has(url)) {
          this.downloadedCount += 1;
          continue;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }

        // fetch(...).blob() works on web and React Native's Fetch polyfill
        const blob = await response.blob();
        this.urlToBlob.set(url, blob);
        this.downloadedCount += 1;
      } catch (error) {
        // Fail soft for individual URLs; progress continues
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('AudioCache: error caching url', url, error);
        }
        this.downloadedCount += 1; // Still advance so progress can complete
      }
    }
  }

  public isAudioCached(url: string): boolean {
    return this.urlToBlob.has(url);
  }

  public getCachedAudioBlob(url: string): Blob | null {
    return this.urlToBlob.get(url) ?? null;
  }

  public clearCache(): void {
    this.urlToBlob.clear();
    this.totalToDownload = 0;
    this.downloadedCount = 0;
  }
}

export const audioCache = new AudioCache();


