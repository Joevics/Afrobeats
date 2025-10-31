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

export const highlifeLyricsQuestions: LyricsQuestion[] = [
  // Song questions
  {
    id: 'highlife_lyrics_1',
    lyrics: [
      "Sweet mother, I no go forget you",
      "For the suffer wey you suffer for me"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Sweet Mother',
    option_b: 'No Forget You',
    option_c: 'Suffer for Me',
    option_d: 'Mother\'s Love',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_2',
    lyrics: [
      "Money palava, money palava",
      "If you no get money, you no fit talk"
    ],
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'Money Palava',
    option_b: 'Money Palava',
    option_c: 'No Fit Talk',
    option_d: 'Get Money',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_3',
    lyrics: [
      "Ijele, Ijele, Ijele",
      "Ijele, Ijele, Ijele"
    ],
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Ijele',
    option_b: 'Ijele',
    option_c: 'Ijele',
    option_d: 'Ijele',
    song_title: 'Ijele',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_4',
    lyrics: [
      "Osondi Owendi, Osondi Owendi",
      "Osondi Owendi, Osondi Owendi"
    ],
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Osondi Owendi',
    option_b: 'Osondi Owendi',
    option_c: 'Osondi Owendi',
    option_d: 'Osondi Owendi',
    song_title: 'Osondi Owendi',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_5',
    lyrics: [
      "Kedu ka anyi gaa, kedu ka anyi gaa",
      "Kedu ka anyi gaa, kedu ka anyi gaa"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Kedu ka anyi gaa',
    option_b: 'Kedu ka anyi gaa',
    option_c: 'Kedu ka anyi gaa',
    option_d: 'Kedu ka anyi gaa',
    song_title: 'Kedu ka anyi gaa',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  // Artist questions
  {
    id: 'highlife_lyrics_6',
    lyrics: [
      "Sweet mother, I no go forget you",
      "For the suffer wey you suffer for me"
    ],
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_7',
    lyrics: [
      "Money palava, money palava",
      "If you no get money, you no fit talk"
    ],
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_8',
    lyrics: [
      "Ijele, Ijele, Ijele",
      "Ijele, Ijele, Ijele"
    ],
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Ijele',
    artist_name: 'Chief Oliver De Coque',
    category: 'highlife',
  },
  // Both questions
  {
    id: 'highlife_lyrics_9',
    lyrics: [
      "Sweet mother, I no go forget you",
      "For the suffer wey you suffer for me"
    ],
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'Sweet Mother - Prince Nico Mbarga',
    option_b: 'No Forget You - Chief Stephen Osita Osadebe',
    option_c: 'Suffer for Me - Chief Oliver De Coque',
    option_d: 'Mother\'s Love - Chief Osita Osadebe',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'highlife',
  },
  {
    id: 'highlife_lyrics_10',
    lyrics: [
      "Money palava, money palava",
      "If you no get money, you no fit talk"
    ],
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Money Palava - Prince Nico Mbarga',
    option_b: 'Money Palava - Chief Stephen Osita Osadebe',
    option_c: 'No Fit Talk - Chief Oliver De Coque',
    option_d: 'Get Money - Chief Osita Osadebe',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'highlife',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

