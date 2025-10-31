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

export const highlifeAudioQuestions: AudioQuestion[] = [
  // Song questions
  {
    id: 'highlife_audio_1',
    clip_id: 'highlife_clip_1',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/sweet-mother-clip.mp3',
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
    id: 'highlife_audio_2',
    clip_id: 'highlife_clip_2',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/money-palava-clip.mp3',
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
    id: 'highlife_audio_3',
    clip_id: 'highlife_clip_3',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/ijele-clip.mp3',
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
    id: 'highlife_audio_4',
    clip_id: 'highlife_clip_4',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/osondi-owendi-clip.mp3',
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
    id: 'highlife_audio_5',
    clip_id: 'highlife_clip_5',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/kedu-ka-anyi-gaa-clip.mp3',
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
    id: 'highlife_audio_6',
    clip_id: 'highlife_clip_6',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/sweet-mother-artist-clip.mp3',
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
    id: 'highlife_audio_7',
    clip_id: 'highlife_clip_7',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/money-palava-artist-clip.mp3',
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
    id: 'highlife_audio_8',
    clip_id: 'highlife_clip_8',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/ijele-artist-clip.mp3',
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
    id: 'highlife_audio_9',
    clip_id: 'highlife_clip_9',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/sweet-mother-both-clip.mp3',
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
    id: 'highlife_audio_10',
    clip_id: 'highlife_clip_10',
    audio_url: 'https://your-cloudflare-r2-url.com/highlife/money-palava-both-clip.mp3',
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

