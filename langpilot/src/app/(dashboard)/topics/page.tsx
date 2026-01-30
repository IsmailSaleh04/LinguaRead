'use client';

import { useState, useEffect } from 'react';
import { topicsApi } from '@/lib/api/topics';
import { languagesApi } from '@/lib/api/languages';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Tags, CheckCircle } from 'lucide-react';
import type { Topic, UserPreferences } from '@/lib/types';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [topicsRes, prefsRes] = await Promise.all([
        topicsApi.getTopics(),
        languagesApi.getPreferences(),
      ]);

      if (topicsRes.success && topicsRes.data) {
        setTopics(topicsRes.data);
      }

      if (prefsRes.success && prefsRes.data) {
        setPreferences(prefsRes.data);
        setSelectedTopics(prefsRes.data.preferred_topics || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    try {
      await languagesApi.updatePreferences({
        preferred_topics: selectedTopics,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save topics:', error);
    } finally {
      setIsSaving(false);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-4">Topics</h1>
        <p className="text-brown text-xl mb-8">
          Select topics you're interested in to get personalized article recommendations
        </p>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700 font-bold flex items-center gap-2">
              <CheckCircle size={20} />
              Topics saved successfully!
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {topics.map((topic) => {
          const isSelected = selectedTopics.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`p-8 rounded-xl border-2 transition-all text-left relative ${
                isSelected
                  ? 'bg-orange text-white border-orange shadow-xl'
                  : 'bg-white text-dark border-brown border-opacity-20 hover:border-orange hover:shadow-lg'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{topic.name}</h3>
              {topic.article_count !== undefined && (
                <p className={`text-base font-semibold ${isSelected ? 'text-white opacity-90' : 'text-brown'}`}>
                  {topic.article_count} articles
                </p>
              )}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle size={28} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : `Save ${selectedTopics.length} Topics`}
        </Button>
      </div>
    </div>
  );
}
