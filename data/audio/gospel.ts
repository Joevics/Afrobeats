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

export const gospelAudioQuestions: AudioQuestion[] = [
  // Song questions
  {
    id: 'gospel_audio_1',
    clip_id: '18c3e4bb-de1f-49e3-8bdc-972707cf8335',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759203858824_user_trimmed_1_I_pledge_Ray%20Boltz_clip_1757471395177.mp3',
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'I pledge',
    option_b: 'Truth and Life',
    option_c: 'Pure Love',
    option_d: 'Cross for You',
    song_title: 'I pledge',
    artist_name: 'Ray Boltz',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_2',
    clip_id: '47db4709-430f-4332-ad4e-d0edaeaa94a3',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202126093_user_trimmed_1_33_Solomon_Lange_-_Imela_clip_1757469754547.mp3',
    question_type: 'song',
    correct_answer: 'B',
    option_a: 'I\'m Blessed',
    option_b: 'Imela',
    option_c: 'God\'s Best',
    option_d: 'World May Say',
    song_title: 'Imela',
    artist_name: 'Solomon Lange',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_3',
    clip_id: 'cdba6699-530d-4337-91f6-83fb5685b877',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202127216_user_trimmed_1_ajuju__chante_clip_1757473670700.mp3',
    question_type: 'song',
    correct_answer: 'C',
    option_a: 'Hallelujah',
    option_b: 'Praise the Lord',
    option_c: 'Chante',
    option_d: 'Rising Sun',
    song_title: 'Chante',
    artist_name: 'Ajuju',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_4',
    clip_id: '5b76485a-d0d2-4fed-bec6-751df37eb8f5',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202736386_user_trimmed_1_Christ_Paid_it_all_clip_1757473461021.mp3',
    question_type: 'song',
    correct_answer: 'D',
    option_a: 'Great Faithfulness',
    option_b: 'No Shadow',
    option_c: 'Compassions Fail Not',
    option_d: 'Christ Paid it all',
    song_title: 'Christ Paid it all',
    artist_name: 'The Lively Stones',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_5',
    clip_id: 'f316eaf7-d2bd-4738-ba91-6d9a9427c7de',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202734963_user_trimmed_1_Chris-Morgan-Ft_-Mercy-Chinwo-Amanamo_clip_1757473452762.mp3',
    question_type: 'song',
    correct_answer: 'A',
    option_a: 'Amanamno',
    option_b: 'Sweet Sound',
    option_c: 'Lost and Found',
    option_d: 'Blind but See',
    song_title: 'Amanamno',
    artist_name: 'Chris Morgan',
    category: 'gospel',
  },
  // Artist questions
  {
    id: 'gospel_audio_6',
    clip_id: '2ee7bd47-f216-4ead-bc78-702f2c199e56',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202733926_user_trimmed_1_Chinyere_Udoma_-Adim_Well_Loaded-1_clip_1757473489946.mp3',
    question_type: 'artist',
    correct_answer: 'A',
    option_a: 'Chinyere Udoma',
    option_b: 'Frank Edwards',
    option_c: 'Mercy Chinwo',
    option_d: 'Tope Alabi',
    song_title: 'Adim Well Loaded',
    artist_name: 'Chinyere Udoma',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_7',
    clip_id: 'ce7b4810-de36-4dab-9c8a-6ab6cc9096c3',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202732650_user_trimmed_1_Chinwe_Ike__Estar__ft_Tuface_clip_1757473499669.mp3',
    question_type: 'artist',
    correct_answer: 'B',
    option_a: 'Sinach',
    option_b: 'Estar ft Tuface',
    option_c: 'Mercy Chinwo',
    option_d: 'Tope Alabi',
    song_title: 'Chinwe Ike',
    artist_name: 'Estar ft Tuface',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_8',
    clip_id: 'ce7b4810-de36-4dab-9c8a-6ab6cc9096c3',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202732650_user_trimmed_1_Chinwe_Ike__Estar__ft_Tuface_clip_1757473499669.mp3',
    question_type: 'artist',
    correct_answer: 'C',
    option_a: 'Sinach',
    option_b: 'Frank Edwards',
    option_c: 'Estar ft Tuface',
    option_d: 'Tope Alabi',
    song_title: 'Chinwe Ike',
    artist_name: 'Estar ft Tuface',
    category: 'gospel',
  },
  // Both questions
  {
    id: 'gospel_audio_9',
    clip_id: '18c3e4bb-de1f-49e3-8bdc-972707cf8335',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759203858824_user_trimmed_1_I_pledge_Ray%20Boltz_clip_1757471395177.mp3',
    question_type: 'both',
    correct_answer: 'A',
    option_a: 'I pledge - Ray Boltz',
    option_b: 'Miracle Worker - Frank Edwards',
    option_c: 'Promise Keeper - Mercy Chinwo',
    option_d: 'Light in Darkness - Tope Alabi',
    song_title: 'I pledge',
    artist_name: 'Ray Boltz',
    category: 'gospel',
  },
  {
    id: 'gospel_audio_10',
    clip_id: '47db4709-430f-4332-ad4e-d0edaeaa94a3',
    audio_url: 'https://gnsjnbwkmiqribcvpeeh.supabase.co/storage/v1/object/public/audio-clips/nigerian-gospel/1759202126093_user_trimmed_1_33_Solomon_Lange_-_Imela_clip_1757469754547.mp3',
    question_type: 'both',
    correct_answer: 'B',
    option_a: 'Living Testimony - Sinach',
    option_b: 'Imela - Solomon Lange',
    option_c: 'God is Good - Mercy Chinwo',
    option_d: 'Taking Higher - Tope Alabi',
    song_title: 'Imela',
    artist_name: 'Solomon Lange',
    category: 'gospel',
  },
  // Add more mock questions to reach closer to 1000...
  // (In real implementation, you'll have 1000 questions per category)
];

