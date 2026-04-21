'use client';

import { useState, useEffect } from 'react';
import { translateApi } from '@/lib/api/translate';
import { vocabularyApi } from '@/lib/api/vocabulary';
import Button from '@/components/ui/Button';
import { Volume2, Languages, Check, X, Loader2 } from 'lucide-react';
import type { Word } from '@/lib/types';

interface WordTooltipProps {
  word: Word;
  position: { x: number; y: number };
  targetLanguage: string;
  nativeLanguage: string;
  onStatusChange: (wordId: number, status: 'unknown' | 'learning' | 'known') => void;
  onClose: () => void;
}

export default function WordTooltip({ 
  word, 
  position, 
  targetLanguage,
  nativeLanguage,
  onStatusChange, 
  onClose 
}: WordTooltipProps) {
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    setShowTranslation(true);
    
    try {
      const response = await translateApi.translate(word.text, targetLanguage, nativeLanguage);
      if (response.success && response.data) {
        setTranslation(response.data.translation);
        
        // Track translation click and auto-progress status
        await vocabularyApi.updateWordStatus(word.id, word.user_status || 'unknown', 'translate');
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslation('Translation unavailable');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    translateApi.speakText(word.text, targetLanguage);
  };

  const handleMarkKnown = async () => {
    await vocabularyApi.updateWordStatus(word.id, 'known', 'mark');
    onStatusChange(word.id, 'known');
    onClose();
  };

  const statusColors = {
    unknown: 'bg-red-100 border-red-400 text-red-700',
    learning: 'bg-orange bg-opacity-20 border-orange text-brown',
    known: 'bg-green-100 border-green-500 text-green-700',
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div
        className="fixed z-50 bg-white rounded-xl border-2 border-brown p-6 max-w-sm shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-20px)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-3xl font-bold text-dark mb-2">{word.text}</h3>
            {word.user_status && (
              <span className={`inline-block px-3 py-1 rounded-lg border-2 font-bold text-sm ${statusColors[word.user_status]}`}>
                {word.user_status === 'known' ? 'Known' : 
                 word.user_status === 'learning' ? 'Learning' : 'Unknown'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-brown hover:text-dark p-1">
            <X size={24} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSpeak}
          >
            <Volume2 size={18} />
            Listen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Languages size={18} />
            )}
            Translate
          </Button>
        </div>

        {/* Translation Display */}
        {showTranslation && (
          <div className="mb-4 p-4 bg-cream rounded-lg">
            <p className="text-base font-bold text-dark">
              {isTranslating ? 'Translating...' : translation}
            </p>
          </div>
        )}

        {/* Mark as Known */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleMarkKnown}
        >
          <Check size={20} />
          Mark as Known
        </Button>
      </div>
    </>
  );
}