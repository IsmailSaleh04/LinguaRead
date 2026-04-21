'use client';

import { useState, useEffect } from 'react';
import { languagesApi } from '@/lib/api/languages';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LANGUAGES, CEFR_LEVELS } from '@/lib/utils/constants';
import { Globe, Plus, Trash2, CheckCircle } from 'lucide-react';
import type { TargetLanguage } from '@/lib/types';

export default function LanguagesPage() {
  const { targetLanguages, setTargetLanguages, currentLanguage, setCurrentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState('es');
  const [newLevel, setNewLevel] = useState('A1');

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await languagesApi.getTargetLanguages();
      if (response.success && response.data) {
        setTargetLanguages(response.data);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    try {
      await languagesApi.addLanguage(newLanguage, newLevel);
      await loadLanguages();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add language:', error);
    }
  };

  const handleRemoveLanguage = async (code: string) => {
    if (!confirm('Are you sure you want to remove this language?')) return;
    
    try {
      await languagesApi.removeLanguage(code);
      await loadLanguages();
    } catch (error) {
      console.error('Failed to remove language:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-bold text-dark mb-4">My Languages</h1>
          <p className="text-brown text-xl">Manage the languages you're learning</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
          <Plus size={24} />
          Add Language
        </Button>
      </div>

      <div className="space-y-6">
        {targetLanguages.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center border-2 border-brown border-opacity-20">
            <Globe size={64} className="text-brown opacity-40 mx-auto mb-6" />
            <p className="text-2xl font-bold text-dark mb-4">No languages added yet</p>
            <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              Add Your First Language
            </Button>
          </div>
        ) : (
          targetLanguages.map((lang) => {
            const language = LANGUAGES.find(l => l.code === lang.language_code);
            const isActive = currentLanguage === lang.language_code;
            
            return (
              <div
                key={lang.language_code}
                className={`bg-white rounded-xl p-8 border-2 transition-all ${
                  isActive 
                    ? 'border-orange shadow-lg' 
                    : 'border-brown border-opacity-20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl">{language?.flag}</span>
                    <div>
                      <h3 className="text-3xl font-bold text-dark mb-1">{language?.name}</h3>
                      <p className="text-brown text-lg mb-3">{language?.nativeName}</p>
                      <span className="inline-block px-4 py-2 bg-orange bg-opacity-20 text-brown font-bold rounded-lg">
                        Level: {lang.proficiency_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {!isActive && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentLanguage(lang.language_code)}
                      >
                        <CheckCircle size={20} />
                        Set Active
                      </Button>
                    )}
                    {isActive && (
                      <div className="px-4 py-2 bg-orange text-white font-bold rounded-lg">
                        Active
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => handleRemoveLanguage(lang.language_code)}
                    >
                      <Trash2 size={20} />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Language Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Language"
      >
        <div className="space-y-6">
          <Select
            label="Language"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            options={LANGUAGES.map(lang => ({
              value: lang.code,
              label: `${lang.flag} ${lang.name}`
            }))}
          />

          <Select
            label="Current Level"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            options={CEFR_LEVELS.map(level => ({
              value: level.value,
              label: level.label
            }))}
          />

          <Button
            variant="primary"
            className="w-full"
            size="lg"
            onClick={handleAddLanguage}
          >
            Add Language
          </Button>
        </div>
      </Modal>
    </div>
  );
}

