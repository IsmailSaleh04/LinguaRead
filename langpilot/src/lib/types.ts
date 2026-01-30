export interface User {
  id: string;
  email: string;
  nativeLanguage: string;
  created_at: Date;
  last_active_at?: Date;
}

export interface Article {
  id: number;
  title: string;
  summary?: string;
  source_url: string;
  language_code: string;
  word_count?: number;
  unique_word_count?: number;
  difficulty_score?: number;
  cached_content?: string;
  source_type?: string;
  topics?: string[];
}

export interface Word {
  id: number;
  text: string;
  language_code: string;
  lemma?: string;
  part_of_speech?: string;
  difficulty_level?: string;
  frequency_rank?: number;
  user_status?: 'unknown' | 'learning' | 'known';
}

export interface UserWord {
  user_id: string;
  word_id: number;
  status: 'unknown' | 'learning' | 'known';
  exposure_count: number;
  last_seen_at: Date;
  text?: string;
  difficulty_level?: string;
}

export interface ReadingSession {
  id: number;
  user_id: string;
  article_id: number;
  started_at: Date;
  completed_at?: Date;
  time_spent_seconds?: number;
  words_learned?: number;
  progress_percentage?: number;
}

export interface ProgressData {
  date: string;
  words_learned: number;
  articles_read: number;
  time_spent_seconds: number;
}

export interface UserStats {
  vocabulary: {
    total_known_words: number;
    total_learning_words: number;
  };
  reading: {
    total_articles_read: number;
    total_reading_time: number;
    total_words_from_reading: number;
  };
  currentStreak: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface TargetLanguage {
  language_code: string;
  proficiency_level: string;
  started_at: Date;
  name?: string;
  native_name?: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_topics: number[];
  daily_goal_minutes: number;
  auto_suggest_enabled: boolean;
  difficulty_preference: string;
  updated_at: Date;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  article_count?: number;
}
