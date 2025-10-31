import { afrobeatsAudioQuestions } from './afrobeats';
import { gospelAudioQuestions } from './gospel';
import { highlifeAudioQuestions } from './highlife';
import { throwbackAudioQuestions } from './throwback';
import { bluesAudioQuestions } from './blues';

export interface AudioQuestion {
  id: string;
  clip_id?: string;
  audio_url: string;
  question_type: 'song' | 'artist' | 'both';
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  song_title?: string;
  artist_name?: string;
  category?: string;
}

export const audioQuestionsByCategory = {
  afrobeats: afrobeatsAudioQuestions,
  gospel: gospelAudioQuestions,
  highlife: highlifeAudioQuestions,
  throwback: throwbackAudioQuestions,
  blues: bluesAudioQuestions,
};

// Map API categories back to UI categories for local data lookup
function mapApiCategoryToUiCategory(apiCategory: string): string {
  const mapping: Record<string, string> = {
    'afrobeats': 'afrobeats',
    'nigerian-r&b': 'afrobeats',
    'nigerian-hip-hop': 'afrobeats',
    'nigerian-gospel': 'gospel',
    'highlife': 'highlife',
    'juju': 'highlife',
    'fuji': 'highlife',
    'apala': 'highlife',
    'afro-fusion': 'highlife',
    'nigerian-folk': 'throwback',
  };
  
  return mapping[apiCategory] || 'general';
}

// Track used questions per session to prevent repetition
const usedAudioQuestions = new Set<string>();

export function getAudioQuestions(
  category: string,
  questionType: 'song' | 'artist' | 'both',
  limit: number,
  excludeUsed: boolean = true
): AudioQuestion[] {
  // Map API category to UI category for local data lookup
  const uiCategory = mapApiCategoryToUiCategory(category);
  
  let questions: AudioQuestion[];
  
  // Handle general category - fetch from all categories
  if (uiCategory === 'general') {
    // Get questions from all categories except general
    const allCategories = ['afrobeats', 'gospel', 'highlife', 'throwback', 'blues'];
    questions = allCategories.flatMap(cat => 
      audioQuestionsByCategory[cat as keyof typeof audioQuestionsByCategory] || []
    );
  } else {
    // Get questions from specific category
    questions = audioQuestionsByCategory[uiCategory as keyof typeof audioQuestionsByCategory] || [];
  }
  
  // Filter by question type
  let filteredQuestions: AudioQuestion[];
  if (questionType === 'both') {
    // For 'both', include both 'song' and 'artist' questions
    filteredQuestions = questions.filter(q => q.question_type === 'song' || q.question_type === 'artist');
  } else {
    // For 'song' or 'artist', filter by specific type
    filteredQuestions = questions.filter(q => q.question_type === questionType);
  }
  
  // Filter out used questions if requested
  if (excludeUsed) {
    filteredQuestions = filteredQuestions.filter(q => !usedAudioQuestions.has(q.id));
  }
  
  // Shuffle and return limited number
  const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, limit);
}

export function markAudioQuestionAsUsed(questionId: string): void {
  usedAudioQuestions.add(questionId);
}

export function resetUsedAudioQuestions(): void {
  usedAudioQuestions.clear();
}

export function getAllAudioQuestions(): AudioQuestion[] {
  return Object.values(audioQuestionsByCategory).flat();
}

