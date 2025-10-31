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

export const throwbackAudioQuestions: AudioQuestion[] = [
  // Song questions
  {
    id: 'throwback_audio_1',
    clip_id: 'throwback_clip_1',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/arise-compatriots-clip.mp3',
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Arise O Compatriots',
    option_b: 'Nigeria\'s Call Obey',
    option_c: 'Serve Our Fatherland',
    option_d: 'Love and Strength',
    song_title: 'Arise O Compatriots',
    artist_name: 'National Anthem',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_2',
    clip_id: 'throwback_clip_2',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/sweet-mother-clip.mp3',
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'Sweet Mother',
    option_b: 'Sweet Mother',
    option_c: 'No Forget You',
    option_d: 'Suffer for Me',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_3',
    clip_id: 'throwback_clip_3',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/money-palava-clip.mp3',
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Money Palava',
    option_b: 'Money Palava',
    option_c: 'Money Palava',
    option_d: 'No Fit Talk',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_4',
    clip_id: 'throwback_clip_4',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/ijele-clip.mp3',
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Ijele',
    option_b: 'Ijele',
    option_c: 'Ijele',
    option_d: 'Ijele',
    song_title: 'Ijele',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_5',
    clip_id: 'throwback_clip_5',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/osondi-owendi-clip.mp3',
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Osondi Owendi',
    option_b: 'Osondi Owendi',
    option_c: 'Osondi Owendi',
    option_d: 'Osondi Owendi',
    song_title: 'Osondi Owendi',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'throwback',
  },
  // Artist questions
  {
    id: 'throwback_audio_6',
    clip_id: 'throwback_clip_6',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/sweet-mother-artist-clip.mp3',
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_7',
    clip_id: 'throwback_clip_7',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/money-palava-artist-clip.mp3',
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_8',
    clip_id: 'throwback_clip_8',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/ijele-artist-clip.mp3',
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'Prince Nico Mbarga',
    option_b: 'Chief Stephen Osita Osadebe',
    option_c: 'Chief Oliver De Coque',
    option_d: 'Chief Osita Osadebe',
    song_title: 'Ijele',
    artist_name: 'Chief Oliver De Coque',
    category: 'throwback',
  },
  // Both questions
  {
    id: 'throwback_audio_9',
    clip_id: 'throwback_clip_9',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/sweet-mother-both-clip.mp3',
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'Sweet Mother - Prince Nico Mbarga',
    option_b: 'No Forget You - Chief Stephen Osita Osadebe',
    option_c: 'Suffer for Me - Chief Oliver De Coque',
    option_d: 'Mother\'s Love - Chief Osita Osadebe',
    song_title: 'Sweet Mother',
    artist_name: 'Prince Nico Mbarga',
    category: 'throwback',
  },
  {
    id: 'throwback_audio_10',
    clip_id: 'throwback_clip_10',
    audio_url: 'https://your-cloudflare-r2-url.com/throwback/money-palava-both-clip.mp3',
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Money Palava - Prince Nico Mbarga',
    option_b: 'Money Palava - Chief Stephen Osita Osadebe',
    option_c: 'No Fit Talk - Chief Oliver De Coque',
    option_d: 'Get Money - Chief Osita Osadebe',
    song_title: 'Money Palava',
    artist_name: 'Chief Stephen Osita Osadebe',
    category: 'throwback',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

