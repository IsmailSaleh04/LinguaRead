"use client";

import { useState, useEffect } from "react";
import { topicsApi } from "@/lib/api/topics";
import { languagesApi } from "@/lib/api/languages";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/Button";
import type { Topic, UserPreferences } from "@/lib/types";
import {
  Palette,
  Briefcase,
  Theater,
  GraduationCap,
  Film,
  Leaf,
  Shirt,
  Utensils,
  HeartPulse,
  Landmark,
  BookOpen,
  Music,
  Trees,
  Brain,
  Users,
  FlaskConical,
  Trophy,
  Cpu,
  Plane,
  Tags,
  CheckCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
        setSelectedTopics(prefsRes.data.preferred_topics ?? []);
      }
    } catch (error) {
      console.error("Failed to load topics / preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

const handleSave = async () => {
  setIsSaving(true);
  setSuccess(false);

  try {
    console.log("Sending to updatePreferences:", {
      preferred_topics: selectedTopics,
    });

const res = await languagesApi.updatePreferences({
  preferred_topics: selectedTopics.length ? selectedTopics : [], // explicit empty array
});

    console.log("Update response:", res);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3400);

      // Force reload preferences to verify
      const prefsRes = await languagesApi.getPreferences();
      console.log(
        "Fresh preferences after save:",
        prefsRes.data?.preferred_topics,
      );
    } else {
      console.error("Update failed:", res.error);
    }
  } catch (error) {
    console.error("Failed to save preferred topics:", error);
  } finally {
    setIsSaving(false);
  }
};
  const TOPIC_ICONS: Partial<Record<string, LucideIcon>> = {
    Art: Palette,
    Business: Briefcase,
    Culture: Theater,
    Education: GraduationCap,
    Entertainment: Film,
    Environment: Leaf,
    Fashion: Shirt,
    Food: Utensils,
    Health: HeartPulse,
    History: Landmark,
    Literature: BookOpen,
    Music: Music,
    Nature: Trees,
    Philosophy: Brain,
    Politics: Users,
    Psychology: Brain,
    Science: FlaskConical,
    Sports: Trophy,
    Technology: Cpu,
    Travel: Plane,
    // Add more when you create new topics
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Topics
        </h1>
        <p className="text-lg text-gray-600">
          Choose the topics you're interested in to get better article
          recommendations
        </p>

        {success && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700 font-medium flex items-center gap-2.5">
              <CheckCircle size={22} className="flex-shrink-0" />
              Topics saved successfully!
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6 mb-12">
        {topics.map((topic) => {
          const isSelected = selectedTopics.includes(topic.id);
          const Icon = TOPIC_ICONS[topic.name] ?? Tags;

          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`
                group relative p-6 rounded-xl border-2 text-left transition-all duration-200
                hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400
                ${
                  isSelected
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg"
                    : "bg-white border-gray-200 hover:border-orange-400 text-gray-900"
                }
              `}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon
                  size={28}
                  className={
                    isSelected
                      ? "text-white"
                      : "text-gray-500 group-hover:text-orange-500"
                  }
                />
                <h3 className="text-xl font-bold">{topic.name}</h3>
              </div>

              {topic.article_count !== undefined && (
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-orange-100" : "text-gray-500"
                  }`}
                >
                  {topic.article_count} articles
                </p>
              )}

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle size={26} className="text-white" />
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
          disabled={isSaving || selectedTopics.length === 0}
          className="min-w-[180px]"
        >
          {isSaving
            ? "Saving..."
            : selectedTopics.length === 0
              ? "Save Topics"
              : `Save ${selectedTopics.length} Topic${selectedTopics.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}
