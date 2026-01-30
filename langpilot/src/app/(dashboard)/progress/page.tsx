'use client';

import { useState } from 'react';
import { useProgress } from '@/lib/hooks/useProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Select from '@/components/ui/Select';
import { formatNumber, formatTime, formatDate } from '@/lib/utils/formatters';
import { BookOpen, Clock, TrendingUp, Flame } from 'lucide-react';

export default function ProgressPage() {
  const { currentLanguage } = useLanguage();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  const { progress, stats, isLoading } = useProgress({
    language: currentLanguage,
    period,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-4">Your Progress</h1>
        <p className="text-brown text-xl mb-8">Track your learning journey</p>

        <div className="max-w-xs">
          <Select
            label="Time Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            options={[
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'year', label: 'Last Year' },
            ]}
          />
        </div>
      </div>

      {stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brown font-bold text-lg">Total Vocabulary</p>
              <BookOpen size={32} className="text-orange" />
            </div>
            <p className="text-5xl font-bold text-dark mb-2">
              {formatNumber(stats.vocabulary.total_known_words)}
            </p>
            <p className="text-base text-brown font-semibold">
              +{stats.vocabulary.total_learning_words} in progress
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brown font-bold text-lg">Articles Read</p>
              <TrendingUp size={32} className="text-orange" />
            </div>
            <p className="text-5xl font-bold text-dark mb-2">
              {stats.reading.total_articles_read}
            </p>
            <p className="text-base text-brown font-semibold">All time</p>
          </div>

          <div className="bg-white rounded-xl p-8 border-2 border-orange">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brown font-bold text-lg">Current Streak</p>
              <Flame size={32} className="text-orange" />
            </div>
            <p className="text-5xl font-bold text-dark mb-2">{stats.currentStreak}</p>
            <p className="text-base text-brown font-semibold">Days in a row</p>
          </div>
        </div>
      )}

      {/* Daily Progress */}
      <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
        <h2 className="text-3xl font-bold text-dark mb-8">Daily Activity</h2>
        
        {progress.length === 0 ? (
          <p className="text-brown text-center py-12 text-lg">No activity in this period</p>
        ) : (
          <div className="space-y-4">
            {progress.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-6 bg-cream rounded-xl border-2 border-brown border-opacity-20"
              >
                <div>
                  <p className="font-bold text-dark text-lg mb-1">{formatDate(day.date)}</p>
                  <p className="text-brown font-semibold flex items-center gap-2">
                    <Clock size={16} />
                    {formatTime(day.time_spent_seconds)} reading
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dark text-2xl mb-1">
                    {day.words_learned} words
                  </p>
                  <p className="text-brown font-semibold">
                    {day.articles_read} articles
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
