/**
 * Format seconds into human-readable time
 * @param seconds - Number of seconds
 * @returns Formatted string like "1h 23m" or "45m" or "12s"
 */
import { CEFR_LEVELS, WORD_STATUS } from './constants';

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 words per minute
 */
export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 225);
  if (minutes < 1) {
    return 'Less than 1 min';
  }
  return `${minutes} min read`;
}

/**
 * Get CEFR level color
 */
export function getCEFRColor(level: string): string {
  const cefrLevel = CEFR_LEVELS.find(l => l.value === level);
  return cefrLevel?.color || '#6b7280';
}

/**
 * Get CEFR level label
 */
export function getCEFRLabel(level: string): string {
  const cefrLevel = CEFR_LEVELS.find(l => l.value === level);
  return cefrLevel?.label || level;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Get word status color
 */
export function getWordStatusColor(status: 'unknown' | 'learning' | 'known'): string {
  return WORD_STATUS[status]?.color || '#6b7280';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
