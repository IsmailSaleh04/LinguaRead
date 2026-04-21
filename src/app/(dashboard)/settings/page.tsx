"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { languagesApi } from "@/lib/api/languages";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import {
  Save,
  RotateCcw,
  CheckCircle,
  Volume2,
  Bell,
  Download,
  Trash2,
  Globe,
} from "lucide-react";
import type { UserPreferences } from "@/lib/types";

export default function SettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Settings state — initialised from preferences in loadPreferences()
  const [soundEffects, setSoundEffects] = useState(true);
  const [speakingMode, setSpeakingMode] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(15);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await languagesApi.getPreferences();
      if (response.success && response.data) {
        const prefs = response.data;
        setPreferences(prefs);

        // Populate local state from stored preferences
        setDailyGoal(prefs.daily_goal_minutes ?? 15);
        setSoundEffects(prefs.sound_effects ?? true);
        setSpeakingMode(prefs.speaking_mode ?? false);
        setDailyReminders(prefs.daily_reminders ?? false);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      await languagesApi.updatePreferences({
        ...preferences,
        daily_goal_minutes: dailyGoal,
        sound_effects: soundEffects,
        speaking_mode: speakingMode,
        daily_reminders: dailyReminders,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save preferences");
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

  if (!preferences) {
    return (
      <div className="text-brown font-bold text-xl">
        Failed to load preferences
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-4">Settings</h1>
        <p className="text-brown text-xl">Customize your learning experience</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
          <p className="text-green-700 font-bold flex items-center gap-2">
            <CheckCircle size={20} />
            Settings saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-8">
        {/* Account Section */}
        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-6 flex items-center gap-3">
            <Globe size={28} className="text-orange" />
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-bold text-dark mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg 
                           text-dark font-semibold cursor-not-allowed"
              />
              <p className="text-sm text-brown mt-2">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-6">
            General Settings
          </h2>
          <div className="space-y-6">
            {/* Speaking Mode */}
            <div className="flex items-start justify-between p-6 bg-cream rounded-xl border-2 border-brown border-opacity-20">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Volume2 size={24} className="text-orange" />
                  <p className="font-bold text-dark text-lg">Speaking Mode</p>
                </div>
                <p className="text-brown font-semibold">
                  Speaks every time you translate a word or click "Listen"
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={speakingMode}
                  onChange={(e) => setSpeakingMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:bg-orange 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all 
                              border-2 border-brown border-opacity-20"
                />
              </label>
            </div>

            {/* Sound Effects */}
            <div className="flex items-start justify-between p-6 bg-cream rounded-xl border-2 border-brown border-opacity-20">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Volume2 size={24} className="text-orange" />
                  <p className="font-bold text-dark text-lg">Sound Effects</p>
                </div>
                <p className="text-brown font-semibold">
                  Plays sounds when you mark words as known or complete articles
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:bg-orange 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all 
                              border-2 border-brown border-opacity-20"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-6 flex items-center gap-3">
            <Bell size={28} className="text-orange" />
            Daily Goals & Reminders
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-base font-bold text-dark mb-2">
                Daily Reading Goal (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                           focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
              />
              <p className="text-sm text-brown mt-2">
                Your daily reading target
              </p>
            </div>

            <div className="flex items-start justify-between p-6 bg-cream rounded-xl border-2 border-brown border-opacity-20">
              <div className="flex-1">
                <p className="font-bold text-dark text-lg mb-2">
                  Daily Reminders
                </p>
                <p className="text-brown font-semibold">
                  Get reminded if you haven't met your daily goal
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:bg-orange 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all 
                              border-2 border-brown border-opacity-20"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-8 border-2 border-brown border-opacity-20">
          <h2 className="text-3xl font-bold text-dark mb-6">Your Account</h2>
          <div className="space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start"
            >
              <Download size={20} />
              Export all personal data
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 hover:border-red-600"
            >
              <Trash2 size={20} />
              Delete account and all data
            </Button>
          </div>
        </div>

        {/* Save Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={loadPreferences}
            disabled={isSaving}
          >
            <RotateCcw size={20} />
            Reset
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={20} />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
