'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Database, Key, Sparkles, Check, Moon, Sun, Save } from 'lucide-react';
import { UserProfile } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, profile, onUpdateProfile }: SettingsModalProps) {
  const { theme: currentTheme, setTheme: setAppTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'database'>('profile');
  const [name, setName] = useState(profile.name || 'Nayan');
  const [greetingTitle, setGreetingTitle] = useState(profile.greetingTitle || 'Productivity Architect');
  const [email, setEmail] = useState(profile.email || '');
  const [dailyTaskGoal, setDailyTaskGoal] = useState(profile.dailyTaskGoal || 5);
  const [focusGoalMinutes, setFocusGoalMinutes] = useState(profile.focusGoalMinutes || 120);
  const [aiTone, setAiTone] = useState(profile.aiTone || 'friendly');
  const [openaiApiKey, setOpenaiApiKey] = useState(profile.openaiApiKey || '');
  const [aiModel, setAiModel] = useState(profile.aiModel || 'gpt-4o-mini');
  const [geminiApiKey, setGeminiApiKey] = useState(profile.geminiApiKey || '');
  const [theme, setTheme] = useState<'dark' | 'light'>(profile.theme || currentTheme || 'dark');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(profile.name || 'Nayan');
    setGreetingTitle(profile.greetingTitle || 'Productivity Architect');
    setEmail(profile.email || '');
    setDailyTaskGoal(profile.dailyTaskGoal || 5);
    setFocusGoalMinutes(profile.focusGoalMinutes || 120);
    setAiTone(profile.aiTone || 'friendly');
    setOpenaiApiKey(profile.openaiApiKey || '');
    setAiModel(profile.aiModel || 'gpt-4o-mini');
    setGeminiApiKey(profile.geminiApiKey || '');
    setTheme(profile.theme || currentTheme || 'dark');
  }, [profile, isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    setAppTheme(newTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name,
        greetingTitle,
        email,
        dailyTaskGoal: Number(dailyTaskGoal) || 5,
        focusGoalMinutes: Number(focusGoalMinutes) || 120,
        aiTone: aiTone as any,
        openaiApiKey: openaiApiKey.trim() || undefined,
        aiModel,
        geminiApiKey: geminiApiKey.trim() || undefined,
        theme: theme as any,
      });
      setAppTheme(theme);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">LifeOS Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Appearance, goals, and intelligence settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mt-4 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Appearance & Goals
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'ai'
                ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Engine & Keys
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'database'
                ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Storage & Sync
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Theme Switcher in Settings */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Light Mode</div>
                      <div className="text-[10px] text-slate-500">Clean, crisp, high contrast</div>
                    </div>
                    {theme === 'light' && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-700">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Dark Mode</div>
                      <div className="text-[10px] text-slate-500">Calm, deep, eye-friendly</div>
                    </div>
                    {theme === 'dark' && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={greetingTitle}
                    onChange={e => setGreetingTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nayan@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Daily Task Target</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={dailyTaskGoal}
                    onChange={e => setDailyTaskGoal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Number of tasks you aim to finish each day</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Focus Target (Min/Day)</label>
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={focusGoalMinutes}
                    onChange={e => setFocusGoalMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Pomodoro focus time goal per day</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">AI Assistant Tone</label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                >
                  <option value="friendly">Friendly & Encouraging</option>
                  <option value="concise">Concise & Action-First</option>
                  <option value="executive">Executive & Strategic</option>
                  <option value="motivational">High Energy / Motivational</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300">
                <span className="font-semibold block mb-0.5">Dual AI Engine Architecture</span>
                LifeOS works out of the box with its built-in Natural Language Understanding engine (supporting task creation, time detection, reminders, and study plans). Providing an OpenAI or Gemini API key enhances responses using cloud models.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  OpenAI API Key (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={e => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Stored securely in your local instance storage</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">AI Model</label>
                  <select
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:border-indigo-600"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Efficient)</option>
                    <option value="gpt-4o">GPT-4o (Maximum Intelligence)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Gemini API Key (Optional)</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Local Persistent Storage</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    Active (data/lifeos_db.json)
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  All tasks, subtasks, reminders, memories, and chat messages are saved to disk automatically.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Supabase Cloud Sync</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Configurable via .env.local
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  To connect Supabase, add your credentials to <code className="text-indigo-600 dark:text-indigo-400">.env.local</code>.
                </p>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Preferences saved!
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
