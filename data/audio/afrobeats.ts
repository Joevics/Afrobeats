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

export const afrobeatsAudioQuestions: AudioQuestion[] = [
  // Song questions
  {
    id: 'afro_audio_1',
    clip_id: 'afro_clip_1',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/feeling-good-clip.mp3',
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
    id: 'afro_audio_2',
    clip_id: 'afro_clip_2',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/naija-to-world-clip.mp3',
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
    id: 'afro_audio_3',
    clip_id: 'afro_clip_3',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/love-beautiful-clip.mp3',
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
    id: 'afro_audio_4',
    clip_id: 'afro_clip_4',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/family-first-clip.mp3',
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
    id: 'afro_audio_5',
    clip_id: 'afro_clip_5',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/party-start-clip.mp3',
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
    id: 'afro_audio_6',
    clip_id: 'afro_clip_6',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/starboy-clip.mp3',
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
    id: 'afro_audio_7',
    clip_id: 'afro_clip_7',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/obo-clip.mp3',
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
    id: 'afro_audio_8',
    clip_id: 'afro_clip_8',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/african-giant-clip.mp3',
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
    id: 'afro_audio_9',
    clip_id: 'afro_clip_9',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/sugar-mummy-clip.mp3',
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
    id: 'afro_audio_10',
    clip_id: 'afro_clip_10',
    audio_url: 'https://your-cloudflare-r2-url.com/afrobeats/fall-clip.mp3',
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
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

