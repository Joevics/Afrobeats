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

export const gospelLyricsQuestions: LyricsQuestion[] = [
  // Song questions
  {
    id: 'gospel_lyrics_1',
    lyrics: [
      "Praise the Lord with all your heart",
      "Give Him glory, set apart"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Jesus is the Way',
    option_b: 'Truth and Life',
    option_c: 'Pure Love',
    option_d: 'Cross for You',
    song_title: 'Jesus is the Way',
    artist_name: 'Sinach',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_2',
    lyrics: [
      "I'm blessed, I'm blessed, I'm blessed",
      "God has given me His best"
    ],
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'I\'m Blessed',
    option_b: 'Walking in His Way',
    option_c: 'God\'s Best',
    option_d: 'World May Say',
    song_title: 'Walking in His Way',
    artist_name: 'Frank Edwards',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_3',
    lyrics: [
      "Hallelujah, praise the Lord",
      "He's worthy to be adored"
    ],
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Hallelujah',
    option_b: 'Praise the Lord',
    option_c: 'Worthy to be Adored',
    option_d: 'Rising Sun',
    song_title: 'Worthy to be Adored',
    artist_name: 'Mercy Chinwo',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_4',
    lyrics: [
      "Great is Thy faithfulness, O God my Father",
      "There is no shadow of turning with Thee"
    ],
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Great Faithfulness',
    option_b: 'No Shadow',
    option_c: 'Compassions Fail Not',
    option_d: 'Great is Thy Faithfulness',
    song_title: 'Great is Thy Faithfulness',
    artist_name: 'Tope Alabi',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_5',
    lyrics: [
      "Amazing grace, how sweet the sound",
      "That saved a wretch like me"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Amazing Grace',
    option_b: 'Sweet Sound',
    option_c: 'Lost and Found',
    option_d: 'Blind but See',
    song_title: 'Amazing Grace',
    artist_name: 'John Newton',
    category: 'gospel',
  },
  // Artist questions
  {
    id: 'gospel_lyrics_6',
    lyrics: [
      "I am a living testimony",
      "God has been good to me"
    ],
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'Sinach',
    option_b: 'Frank Edwards',
    option_c: 'Mercy Chinwo',
    option_d: 'Tope Alabi',
    song_title: 'Living Testimony',
    artist_name: 'Sinach',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_7',
    lyrics: [
      "You are God from beginning to the end",
      "There's no place for argument"
    ],
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Sinach',
    option_b: 'Frank Edwards',
    option_c: 'Mercy Chinwo',
    option_d: 'Tope Alabi',
    song_title: 'You are God',
    artist_name: 'Frank Edwards',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_8',
    lyrics: [
      "Excess love, excess love",
      "You showed me excess love"
    ],
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'Sinach',
    option_b: 'Frank Edwards',
    option_c: 'Mercy Chinwo',
    option_d: 'Tope Alabi',
    song_title: 'Excess Love',
    artist_name: 'Mercy Chinwo',
    category: 'gospel',
  },
  // Both questions
  {
    id: 'gospel_lyrics_9',
    lyrics: [
      "Way maker, miracle worker",
      "Promise keeper, light in the darkness"
    ],
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'Way Maker - Sinach',
    option_b: 'Miracle Worker - Frank Edwards',
    option_c: 'Promise Keeper - Mercy Chinwo',
    option_d: 'Light in Darkness - Tope Alabi',
    song_title: 'Way Maker',
    artist_name: 'Sinach',
    category: 'gospel',
  },
  {
    id: 'gospel_lyrics_10',
    lyrics: [
      "I'm a living testimony",
      "God has been good to me"
    ],
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Living Testimony - Sinach',
    option_b: 'Glory to Glory - Frank Edwards',
    option_c: 'God is Good - Mercy Chinwo',
    option_d: 'Taking Higher - Tope Alabi',
    song_title: 'Glory to Glory',
    artist_name: 'Frank Edwards',
    category: 'gospel',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

