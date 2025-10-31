import { afrobeatsLyricsQuestions } from './afrobeats';
import { gospelLyricsQuestions } from './gospel';
import { highlifeLyricsQuestions } from './highlife';
import { throwbackLyricsQuestions } from './throwback';
import { bluesLyricsQuestions } from './blues';

export interface LyricsQuestion {
  id: string;
  lyrics: string[];
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

export const lyricsQuestionsByCategory = {
  afrobeats: afrobeatsLyricsQuestions,
  gospel: gospelLyricsQuestions,
  highlife: highlifeLyricsQuestions,
  throwback: throwbackLyricsQuestions,
  blues: bluesLyricsQuestions,
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
const usedQuestions = new Set<string>();

export function getLyricsQuestions(
  category: string,
  questionType: 'song' | 'artist' | 'both',
  limit: number,
  excludeUsed: boolean = true
): LyricsQuestion[] {
  // Map API category to UI category for local data lookup
  const uiCategory = mapApiCategoryToUiCategory(category);
  
  if (__DEV__) {
    console.log(`Mapping API category '${category}' to UI category '${uiCategory}'`);
  }
  
  let questions: LyricsQuestion[];
  
  // Handle general category - fetch from all categories
  if (uiCategory === 'general') {
    // Get questions from all categories except general
    const allCategories = ['afrobeats', 'gospel', 'highlife', 'throwback', 'blues'];
    questions = allCategories.flatMap(cat => 
      lyricsQuestionsByCategory[cat as keyof typeof lyricsQuestionsByCategory] || []
    );
  } else {
    // Get questions from specific category
    questions = lyricsQuestionsByCategory[uiCategory as keyof typeof lyricsQuestionsByCategory] || [];
  }
  
  if (__DEV__) {
    console.log(`Found ${questions.length} total questions for UI category '${uiCategory}'`);
  }
  
  // Filter by question type
  let filteredQuestions: LyricsQuestion[];
  if (questionType === 'both') {
    // For 'both', include both 'song' and 'artist' questions
    filteredQuestions = questions.filter(q => q.question_type === 'song' || q.question_type === 'artist');
  } else {
    // For 'song' or 'artist', filter by specific type
    filteredQuestions = questions.filter(q => q.question_type === questionType);
  }
  
  // Filter out used questions if requested
  if (excludeUsed) {
    filteredQuestions = filteredQuestions.filter(q => !usedQuestions.has(q.id));
  }
  
  if (__DEV__) {
    console.log(`Found ${filteredQuestions.length} questions of type '${questionType}' (excluding used: ${excludeUsed})`);
  }
  
  // Shuffle and return limited number
  const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, limit);
}

export function markQuestionAsUsed(questionId: string): void {
  usedQuestions.add(questionId);
}

export function resetUsedQuestions(): void {
  usedQuestions.clear();
}

export function getAllLyricsQuestions(): LyricsQuestion[] {
  return Object.values(lyricsQuestionsByCategory).flat();
}

