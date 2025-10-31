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

export const afrobeatsLyricsQuestions: LyricsQuestion[] = [
  // Song questions
  {
    id: 'afro_lyrics_1',
    lyrics: [
      "I'm feeling good, I'm feeling great",
      "This is my time, this is my fate"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Feeling Good',
    option_b: 'Great Time',
    option_c: 'Dance All Night',
    option_d: 'Break of Dawn',
    song_title: 'Feeling Good',
    artist_name: 'Wizkid',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_2',
    lyrics: [
      "Naija to the world, we dey represent",
      "Our music dey sweet, no be for pretend"
    ],
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'World Music',
    option_b: 'Naija to the World',
    option_c: 'Sweet Music',
    option_d: 'African Music',
    song_title: 'Naija to the World',
    artist_name: 'Davido',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_3',
    lyrics: [
      "Love is beautiful, love is true",
      "When I'm with you, I feel brand new"
    ],
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Beautiful Love',
    option_b: 'True Love',
    option_c: 'Love is Beautiful',
    option_d: 'Complete Love',
    song_title: 'Love is Beautiful',
    artist_name: 'Burna Boy',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_4',
    lyrics: [
      "Money dey come, money dey go",
      "But my hustle no dey slow"
    ],
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Money Come',
    option_b: 'Hustle No Slow',
    option_c: 'Work All Night',
    option_d: 'Family First',
    song_title: 'Family First',
    artist_name: 'Tiwa Savage',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_5',
    lyrics: [
      "Party don start, everybody dey dance",
      "We dey enjoy, we dey romance"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Party Don Start',
    option_b: 'Everybody Dance',
    option_c: 'Sweet Music',
    option_d: 'Night We Live',
    song_title: 'Party Don Start',
    artist_name: 'Tekno',
    category: 'afrobeats',
  },
  // Artist questions
  {
    id: 'afro_lyrics_6',
    lyrics: [
      "I'm the Starboy, I'm the king",
      "My music dey make everybody sing"
    ],
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'Wizkid',
    option_b: 'Davido',
    option_c: 'Burna Boy',
    option_d: 'Tekno',
    song_title: 'Starboy',
    artist_name: 'Wizkid',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_7',
    lyrics: [
      "OBO, that's my name",
      "I dey make hits, I dey bring fame"
    ],
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Wizkid',
    option_b: 'Davido',
    option_c: 'Burna Boy',
    option_d: 'Tekno',
    song_title: 'OBO',
    artist_name: 'Davido',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_8',
    lyrics: [
      "African Giant, that's my title",
      "My music dey cross every border"
    ],
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'Wizkid',
    option_b: 'Davido',
    option_c: 'Burna Boy',
    option_d: 'Tekno',
    song_title: 'African Giant',
    artist_name: 'Burna Boy',
    category: 'afrobeats',
  },
  // Both questions
  {
    id: 'afro_lyrics_9',
    lyrics: [
      "Sugar mummy, you dey sweet",
      "Your love dey make me complete"
    ],
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'Sugar Mummy - Wizkid',
    option_b: 'Sweet Love - Davido',
    option_c: 'Fine Girl - Burna Boy',
    option_d: 'Shine Bright - Tekno',
    song_title: 'Sugar Mummy',
    artist_name: 'Wizkid',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_10',
    lyrics: [
      "Fall, fall, fall for you",
      "Your love dey make me feel brand new"
    ],
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Fall for You - Wizkid',
    option_b: 'Fall - Davido',
    option_c: 'Brand New - Burna Boy',
    option_d: 'Shine - Tekno',
    song_title: 'Fall',
    artist_name: 'Davido',
    category: 'afrobeats',
  },
  // Additional mock questions for more variety
  {
    id: 'afro_lyrics_11',
    lyrics: [
      "Money in the bank, money in the pocket",
      "We dey ball, we dey rocket"
    ],
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Money in Bank',
    option_b: 'We Dey Ball',
    option_c: 'From Streets to Top',
    option_d: 'We No Stop',
    song_title: 'From Streets to Top',
    artist_name: 'Wizkid',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_12',
    lyrics: [
      "Omo naija, omo naija",
      "We dey represent, we dey para"
    ],
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Omo Naija',
    option_b: 'We Dey Represent',
    option_c: 'Lagos to Abuja',
    option_d: 'We Dey Everywhere',
    song_title: 'We Dey Everywhere',
    artist_name: 'Davido',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_13',
    lyrics: [
      "African queen, you dey fine",
      "Your beauty dey shine"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'African Queen',
    option_b: 'You Dey Fine',
    option_c: 'Beauty Dey Shine',
    option_d: 'Make Me Glow',
    song_title: 'African Queen',
    artist_name: 'Burna Boy',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_14',
    lyrics: [
      "Sugar mummy, you dey sweet",
      "Your love dey make me complete"
    ],
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Wizkid',
    option_b: 'Davido',
    option_c: 'Burna Boy',
    option_d: 'Tekno',
    song_title: 'Sugar Mummy',
    artist_name: 'Davido',
    category: 'afrobeats',
  },
  {
    id: 'afro_lyrics_15',
    lyrics: [
      "Starboy, starboy, starboy",
      "I'm the starboy, starboy"
    ],
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'Starboy - Wizkid',
    option_b: 'Starboy - Davido',
    option_c: 'Starboy - Burna Boy',
    option_d: 'Starboy - Tekno',
    song_title: 'Starboy',
    artist_name: 'Wizkid',
    category: 'afrobeats',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

