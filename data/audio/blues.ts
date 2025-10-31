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

export const bluesAudioQuestions: AudioQuestion[] = [
  // Song questions
  {
    id: 'blues_audio_1',
    clip_id: 'blues_clip_1',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/i-got-blues-clip.mp3',
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
    id: 'blues_audio_2',
    clip_id: 'blues_clip_2',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/juju-music-clip.mp3',
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
    id: 'blues_audio_3',
    clip_id: 'blues_clip_3',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/synchro-system-clip.mp3',
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
    id: 'blues_audio_4',
    clip_id: 'blues_clip_4',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/aura-clip.mp3',
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
    id: 'blues_audio_5',
    clip_id: 'blues_clip_5',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/dance-clip.mp3',
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
    id: 'blues_audio_6',
    clip_id: 'blues_clip_6',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/i-got-blues-artist-clip.mp3',
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
    id: 'blues_audio_7',
    clip_id: 'blues_clip_7',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/juju-music-artist-clip.mp3',
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
    id: 'blues_audio_8',
    clip_id: 'blues_clip_8',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/synchro-system-artist-clip.mp3',
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
    id: 'blues_audio_9',
    clip_id: 'blues_clip_9',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/i-got-blues-both-clip.mp3',
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
    id: 'blues_audio_10',
    clip_id: 'blues_clip_10',
    audio_url: 'https://your-cloudflare-r2-url.com/blues/juju-music-both-clip.mp3',
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

