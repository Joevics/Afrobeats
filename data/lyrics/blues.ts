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

export const bluesLyricsQuestions: LyricsQuestion[] = [
  // Song questions
  {
    id: 'blues_lyrics_1',
    lyrics: [
      "I got the blues, I got the blues",
      "My baby left me, I got the blues"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'I Got the Blues',
    option_b: 'Baby Left Me',
    option_c: 'Got the Blues',
    option_d: 'Left Me Blues',
    song_title: 'I Got the Blues',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_2',
    lyrics: [
      "Juju music, juju music",
      "We dey play juju music"
    ],
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'Juju Music',
    option_b: 'Juju Music',
    option_c: 'We Dey Play',
    option_d: 'Play Juju',
    song_title: 'Juju Music',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_3',
    lyrics: [
      "Synchro system, synchro system",
      "We dey play synchro system"
    ],
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Synchro System',
    option_b: 'Synchro System',
    option_c: 'Synchro System',
    option_d: 'We Dey Play',
    song_title: 'Synchro System',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_4',
    lyrics: [
      "Aura, aura, aura",
      "We dey play aura"
    ],
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Aura',
    option_b: 'Aura',
    option_c: 'Aura',
    option_d: 'Aura',
    song_title: 'Aura',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_5',
    lyrics: [
      "Dance, dance, dance",
      "We dey dance, dance, dance"
    ],
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Dance',
    option_b: 'Dance',
    option_c: 'Dance',
    option_d: 'Dance',
    song_title: 'Dance',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  // Artist questions
  {
    id: 'blues_lyrics_6',
    lyrics: [
      "I got the blues, I got the blues",
      "My baby left me, I got the blues"
    ],
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'King Sunny Ade',
    option_b: 'Chief Ebenezer Obey',
    option_c: 'Chief Commander Ebenezer Obey',
    option_d: 'King Sunny Ade',
    song_title: 'I Got the Blues',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_7',
    lyrics: [
      "Juju music, juju music",
      "We dey play juju music"
    ],
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'King Sunny Ade',
    option_b: 'Chief Ebenezer Obey',
    option_c: 'Chief Commander Ebenezer Obey',
    option_d: 'King Sunny Ade',
    song_title: 'Juju Music',
    artist_name: 'Chief Ebenezer Obey',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_8',
    lyrics: [
      "Synchro system, synchro system",
      "We dey play synchro system"
    ],
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'King Sunny Ade',
    option_b: 'Chief Ebenezer Obey',
    option_c: 'Chief Commander Ebenezer Obey',
    option_d: 'King Sunny Ade',
    song_title: 'Synchro System',
    artist_name: 'Chief Commander Ebenezer Obey',
    category: 'blues',
  },
  // Both questions
  {
    id: 'blues_lyrics_9',
    lyrics: [
      "I got the blues, I got the blues",
      "My baby left me, I got the blues"
    ],
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'I Got the Blues - King Sunny Ade',
    option_b: 'Baby Left Me - Chief Ebenezer Obey',
    option_c: 'Got the Blues - Chief Commander Ebenezer Obey',
    option_d: 'Left Me Blues - King Sunny Ade',
    song_title: 'I Got the Blues',
    artist_name: 'King Sunny Ade',
    category: 'blues',
  },
  {
    id: 'blues_lyrics_10',
    lyrics: [
      "Juju music, juju music",
      "We dey play juju music"
    ],
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Juju Music - King Sunny Ade',
    option_b: 'Juju Music - Chief Ebenezer Obey',
    option_c: 'We Dey Play - Chief Commander Ebenezer Obey',
    option_d: 'Play Juju - King Sunny Ade',
    song_title: 'Juju Music',
    artist_name: 'Chief Ebenezer Obey',
    category: 'blues',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

