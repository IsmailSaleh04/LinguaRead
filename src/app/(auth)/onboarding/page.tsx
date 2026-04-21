'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { languagesApi } from '@/lib/api/languages';
import { topicsApi } from '@/lib/api/topics';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { LANGUAGES, CEFR_LEVELS } from '@/lib/utils/constants';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Language selection
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Step 2: Topics selection
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    setSelectedLevel(''); // Reset level when language changes
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
  };

  const handleNextToTopics = async () => {
    if (!selectedLanguage || !selectedLevel) {
      setError('Please select both a language and your level');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Add the target language
      await languagesApi.addLanguage(selectedLanguage, selectedLevel);

      // Load topics
      if (!topicsLoaded) {
        const response = await topicsApi.getTopics();
        if (response.success && response.data) {
          setTopics(response.data);
          setTopicsLoaded(true);
        }
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to save language');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Save topic preferences
      await languagesApi.updatePreferences({
        preferred_topics: selectedTopics,
        auto_suggest_enabled: true,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen size={56} className="text-orange" />
          </div>
          <h1 className="text-5xl font-bold text-dark mb-3">Welcome to LinguaRead!</h1>
          <p className="text-brown text-xl">
            Let's personalize your learning experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold ${
            step >= 1 ? 'bg-orange text-white border-orange' : 'bg-white text-brown border-brown'
          }`}>
            {step > 1 ? <CheckCircle size={24} /> : '1'}
          </div>
          <div className={`w-24 h-1 ${step >= 2 ? 'bg-orange' : 'bg-brown bg-opacity-20'}`} />
          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold ${
            step >= 2 ? 'bg-orange text-white border-orange' : 'bg-white text-brown border-brown'
          }`}>
            2
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="bg-white border-2 border-brown border-opacity-20 rounded-xl p-10">
            <h2 className="text-3xl font-bold text-dark mb-3">Choose Your Target Language</h2>
            <p className="text-brown text-lg mb-8">Which language do you want to learn?</p>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedLanguage === lang.code
                      ? 'bg-orange text-white border-orange shadow-lg'
                      : 'bg-white text-dark border-brown border-opacity-20 hover:border-orange hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-3">{lang.flag}</div>
                  <h3 className="text-xl font-bold mb-1">{lang.name}</h3>
                  <p className={`text-base ${selectedLanguage === lang.code ? 'text-white opacity-90' : 'text-brown'}`}>
                    {lang.nativeName}
                  </p>
                  {selectedLanguage === lang.code && (
                    <div className="mt-3">
                      <CheckCircle size={24} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedLanguage && (
              <div className="border-t-2 border-brown border-opacity-20 pt-8">
                <h3 className="text-2xl font-bold text-dark mb-3">What's your current level?</h3>
                <p className="text-brown text-base mb-6">Be honest - we'll recommend articles that match your level</p>

                <div className="grid md:grid-cols-3 gap-4">
                  {CEFR_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelSelect(level.value)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedLevel === level.value
                          ? 'bg-orange text-white border-orange shadow-lg'
                          : 'bg-white text-dark border-brown border-opacity-20 hover:border-orange hover:shadow-md'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full mb-3 ${
                        selectedLevel === level.value ? 'bg-white' : 'bg-orange'
                      }`} style={{ backgroundColor: selectedLevel === level.value ? 'white' : level.color }} />
                      <h4 className="text-lg font-bold mb-1">{level.value}</h4>
                      <p className={`text-sm ${selectedLevel === level.value ? 'text-white opacity-90' : 'text-brown'}`}>
                        {level.label.split(' - ')[1]}
                      </p>
                      {selectedLevel === level.value && (
                        <div className="mt-3">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextToTopics}
                disabled={!selectedLanguage || !selectedLevel || isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Choose Topics
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Topics Selection */}
        {step === 2 && (
          <div className="bg-white border-2 border-brown border-opacity-20 rounded-xl p-10">
            <h2 className="text-3xl font-bold text-dark mb-3">What interests you?</h2>
            <p className="text-brown text-lg mb-8">
              Select topics you'd like to read about (choose at least 3 for better recommendations)
            </p>

            {topics.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                  {topics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                          isSelected
                            ? 'bg-orange text-white border-orange shadow-lg'
                            : 'bg-white text-dark border-brown border-opacity-20 hover:border-orange hover:shadow-md'
                        }`}
                      >
                        <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                        {topic.article_count !== undefined && (
                          <p className={`text-sm font-semibold ${isSelected ? 'text-white opacity-90' : 'text-brown'}`}>
                            {topic.article_count} articles
                          </p>
                        )}
                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle size={24} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedTopics.length > 0 && (
                  <div className="bg-cream p-6 rounded-xl border-2 border-brown border-opacity-20 mb-8">
                    <p className="text-dark font-bold text-lg">
                      ✓ {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-brown mt-1">
                      {selectedTopics.length >= 3
                        ? 'Great! We\'ll find personalized articles for you'
                        : `Select ${3 - selectedTopics.length} more for better recommendations`}
                    </p>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleSkip}
                    >
                      Skip for now
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleComplete}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Finishing...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <CheckCircle size={20} />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

