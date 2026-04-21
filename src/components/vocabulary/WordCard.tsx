'use client';

import { useState } from 'react';
import WordStatusBadge from './WordStatusBadge';
import Button from '@/components/ui/Button';
import { getCEFRColor } from '@/lib/utils/formatters';
import type { UserWord } from '@/lib/types';

interface WordCardProps {
  word: UserWord;
  onStatusChange: (wordId: number, status: 'unknown' | 'learning' | 'known') => void;
}

export default function WordCard({ word, onStatusChange }: WordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg p-5 shadow-md border-2 border-brown border-opacity-10 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-dark mb-1">{word.text}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <WordStatusBadge status={word.status} />
            {word.difficulty_level && (
              <span
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: getCEFRColor(word.difficulty_level) }}
              >
                {word.difficulty_level}
              </span>
            )}
            <span className="text-sm text-brown">
              Seen {word.exposure_count} times
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-brown border-opacity-20">
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={word.status === 'known' ? 'primary' : 'outline'}
              onClick={() => onStatusChange(word.word_id, 'known')}
            >
              ✓ Known
            </Button>
            <Button
              size="sm"
              variant={word.status === 'learning' ? 'primary' : 'outline'}
              onClick={() => onStatusChange(word.word_id, 'learning')}
            >
              📖 Learning
            </Button>
            <Button
              size="sm"
              variant={word.status === 'unknown' ? 'primary' : 'outline'}
              onClick={() => onStatusChange(word.word_id, 'unknown')}
            >
              ? Unknown
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-brown hover:text-orange text-sm font-semibold mt-2"
      >
        {isExpanded ? '▲ Show less' : '▼ Show more'}
      </button>
    </div>
  );
}
