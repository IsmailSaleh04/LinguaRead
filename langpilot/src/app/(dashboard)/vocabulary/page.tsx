'use client';

import { useState } from 'react';
import { useVocabulary } from '@/lib/hooks/useVocabulary';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { formatNumber, formatRelativeTime } from '@/lib/utils/formatters';
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

export default function VocabularyPage() {
  const { currentLanguage } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'all' | 'known' | 'learning' | 'unknown'>('all');
  
  const { words, stats, isLoading, updateWordStatus } = useVocabulary({
    language: currentLanguage,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusColors = {
    unknown: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
    learning: { bg: 'bg-orange bg-opacity-20', border: 'border-orange', text: 'text-brown' },
    known: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-8">Your Vocabulary</h1>
        
        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-green-400">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-700 font-bold text-lg">Known</p>
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <p className="text-4xl font-bold text-dark">{formatNumber(stats.known)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-orange">
              <div className="flex items-center justify-between mb-2">
                <p className="text-brown font-bold text-lg">Learning</p>
                <TrendingUp size={28} className="text-orange" />
              </div>
              <p className="text-4xl font-bold text-dark">{formatNumber(stats.learning)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-brown border-opacity-40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-brown font-bold text-lg">Total</p>
                <BookOpen size={28} className="text-brown" />
              </div>
              <p className="text-4xl font-bold text-dark">{formatNumber(stats.total)}</p>
            </div>
          </div>
        )}

        <div className="max-w-xs">
          <Select
            label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Words' },
              { value: 'known', label: 'Known' },
              { value: 'learning', label: 'Learning' },
              { value: 'unknown', label: 'Unknown' },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {words.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center border-2 border-brown border-opacity-20">
            <BookOpen size={64} className="text-brown opacity-40 mx-auto mb-6" />
            <p className="text-2xl font-bold text-dark mb-3">No words found</p>
            <p className="text-brown text-lg">Start reading articles to build your vocabulary!</p>
          </div>
        ) : (
          words.map((word) => {
            const colors = statusColors[word.status];
            return (
              <div
                key={word.word_id}
                className={`bg-white rounded-xl p-6 border-2 ${colors.border} border-opacity-60`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-3xl font-bold text-dark">{word.text}</h3>
                      <span className={`px-3 py-1 rounded-lg border-2 font-bold text-sm ${colors.bg} ${colors.border} ${colors.text}`}>
                        {word.status === 'known' ? 'Known' : 
                         word.status === 'learning' ? 'Learning' : 'Unknown'}
                      </span>
                      {word.difficulty_level && (
                        <span className="px-3 py-1 bg-brown bg-opacity-20 text-brown rounded-lg font-bold text-sm">
                          {word.difficulty_level}
                        </span>
                      )}
                    </div>
                    <p className="text-brown font-semibold">
                      Seen {word.exposure_count} times • Last seen {formatRelativeTime(word.last_seen_at)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {word.status !== 'known' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => updateWordStatus(word.word_id, 'known')}
                      >
                        <CheckCircle size={18} />
                        Mark Known
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

