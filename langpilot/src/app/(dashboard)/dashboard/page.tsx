'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/lib/hooks/useProgress';
import { useVocabulary } from '@/lib/hooks/useVocabulary';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/ui/Button';
import { formatNumber, formatTime } from '@/lib/utils/formatters';
import { BookMarked, BookOpen, Clock, Flame } from 'lucide-react';

export default function DashboardPage() {
  const { currentLanguage } = useLanguage();
  const { stats, isLoading: statsLoading } = useProgress({ language: currentLanguage });
  const { stats: vocabStats, isLoading: vocabLoading } = useVocabulary({ language: currentLanguage });

  if (statsLoading || vocabLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-4">Welcome Back!</h1>
        <p className="text-brown text-xl">Keep up the great work on your language journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brown font-bold text-lg">Known Words</p>
            <BookOpen size={32} className="text-orange" />
          </div>
          <p className="text-5xl font-bold text-dark mb-2">
            {formatNumber(vocabStats?.known || 0)}
          </p>
          <p className="text-base text-brown">
            +{vocabStats?.learning || 0} learning
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brown font-bold text-lg">Articles Read</p>
            <BookMarked size={32} className="text-orange" />
          </div>
          <p className="text-5xl font-bold text-dark mb-2">
            {stats?.reading.total_articles_read || 0}
          </p>
          <p className="text-base text-brown">All time</p>
        </div>

        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brown font-bold text-lg">Reading Time</p>
            <Clock size={32} className="text-orange" />
          </div>
          <p className="text-5xl font-bold text-dark mb-2">
            {formatTime(stats?.reading.total_reading_time || 0)}
          </p>
          <p className="text-base text-brown">Total</p>
        </div>

        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brown font-bold text-lg">Streak</p>
            <Flame size={32} className="text-orange" />
          </div>
          <p className="text-5xl font-bold text-dark mb-2">
            {stats?.currentStreak || 0}
          </p>
          <p className="text-base text-brown">Days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-10 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-4">Continue Reading</h2>
          <p className="text-brown text-lg mb-8 leading-relaxed">
            Pick up where you left off or discover new articles
          </p>
          <Link href="/reading">
            <Button variant="primary" size="lg">Browse Articles</Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-10 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-4">Practice Vocabulary</h2>
          <p className="text-brown text-lg mb-8 leading-relaxed">
            Review your {vocabStats?.learning || 0} words in progress
          </p>
          <Link href="/vocabulary">
            <Button variant="secondary" size="lg">Review Words</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
