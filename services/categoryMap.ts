export type UiCategory = 'afrobeats' | 'gospel' | 'highlife' | 'throwback' | 'blues' | 'general' | string;

// Atomic API category keys from your Supabase dataset
// Note: Lyrics and Audio questions use different category names in the database
const ATOMIC: Record<string, string[]> = {
  afro: ['afrobeats'], // For lyrics questions
  gospel: ['gospel'], // For lyrics questions  
  highlife_fuji: ['highlife'], // For lyrics questions
  throwback: ['throwback'], // For lyrics questions
  blues: ['blues'], // For lyrics questions
};

// Audio questions use different category names
const AUDIO_ATOMIC: Record<string, string[]> = {
  afro: ['Afrobeat'], // For audio questions
  gospel: ['Gospel'], // For audio questions
  highlife_fuji: ['high-life'], // For audio questions
  throwback: ['throwback'], // For audio questions (may need verification)
  blues: ['blues'], // For audio questions (may need verification)
};

export function uiCategoryToApiKeys(ui: UiCategory): string[] {
  switch (ui) {
    case 'gospel':
      return ATOMIC.gospel; // ['gospel']
    case 'afrobeats':
      return ATOMIC.afro; // ['afrobeats']
    case 'highlife':
      return ATOMIC.highlife_fuji; // ['highlife']
    case 'throwback':
      return ATOMIC.throwback; // ['throwback']
    case 'blues':
      return ATOMIC.blues; // ['blues']
    case 'general':
      return [
        ...ATOMIC.afro,        // ['afrobeats']
        ...ATOMIC.gospel,      // ['gospel']
        ...ATOMIC.highlife_fuji, // ['highlife']
        ...ATOMIC.throwback,   // ['throwback']
        ...ATOMIC.blues,       // ['blues']
      ];
    default:
      // If the UI ever passes a direct API key, honor it
      return [String(ui)];
  }
}

export function pickApiCategoryForSession(ui: UiCategory): string {
  const keys = uiCategoryToApiKeys(ui);
  const idx = Math.floor(Math.random() * keys.length);
  return keys[idx];
}

// Get API category keys for audio questions (which use different category names)
export function uiCategoryToAudioApiKeys(ui: UiCategory): string[] {
  switch (ui) {
    case 'gospel':
      return AUDIO_ATOMIC.gospel; // ['Gospel']
    case 'afrobeats':
      return AUDIO_ATOMIC.afro; // ['Afrobeat']
    case 'highlife':
      return AUDIO_ATOMIC.highlife_fuji; // ['high-life']
    case 'throwback':
      return AUDIO_ATOMIC.throwback; // ['throwback']
    case 'blues':
      return AUDIO_ATOMIC.blues; // ['blues']
    case 'general':
      return [
        ...AUDIO_ATOMIC.afro,        // ['Afrobeat']
        ...AUDIO_ATOMIC.gospel,      // ['Gospel']
        ...AUDIO_ATOMIC.highlife_fuji, // ['high-life']
        ...AUDIO_ATOMIC.throwback,   // ['throwback']
        ...AUDIO_ATOMIC.blues,       // ['blues']
      ];
    default:
      // If the UI ever passes a direct API key, honor it
      return [String(ui)];
  }
}

export function pickAudioApiCategoryForSession(ui: UiCategory): string {
  const keys = uiCategoryToAudioApiKeys(ui);
  const idx = Math.floor(Math.random() * keys.length);
  return keys[idx];
}


