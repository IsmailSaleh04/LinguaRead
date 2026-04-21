export const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner', color: '#22c55e' },
  { value: 'A2', label: 'A2 - Elementary', color: '#84cc16' },
  { value: 'B1', label: 'B1 - Intermediate', color: '#eab308' },
  { value: 'B2', label: 'B2 - Upper Intermediate', color: '#f97316' },
  { value: 'C1', label: 'C1 - Advanced', color: '#ef4444' },
  { value: 'C2', label: 'C2 - Proficient', color: '#dc2626' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
] as const;

export const WORD_STATUS = {
  unknown: { label: 'Unknown', color: '#ef4444' },
  learning: { label: 'Learning', color: '#f59e0b' },
  known: { label: 'Known', color: '#10b981' },
} as const;

export const DIFFICULTY_PREFERENCES = [
  { value: 'easy', label: 'Easy - Mostly familiar words' },
  { value: 'medium', label: 'Medium - Balanced learning' },
  { value: 'challenging', label: 'Challenging - Many new words' },
] as const;
