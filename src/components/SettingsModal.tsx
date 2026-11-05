'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Database, Key, Sparkles, Check, Moon, Sun, Save } from 'lucide-react';
import { UserProfile } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, profile, onUpdateProfile }: SettingsModalProps) {
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
  const [theme, setTheme] = useState(profile.theme || 'dark');
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
    setTheme(profile.theme || 'dark');
  }, [profile, isOpen]);

  if (!isOpen) return null;

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
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">LifeOS Preferences</h2>
              <p className="text-xs text-slate-400">Customize assistant tone, AI keys, and goals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mt-4 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile & Goals
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Engine & Keys
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Storage & Supabase
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={greetingTitle}
                    onChange={e => setGreetingTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nayan@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Task Target</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={dailyTaskGoal}
                    onChange={e => setDailyTaskGoal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Number of tasks you aim to finish each day</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Focus Target (Min/Day)</label>
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={focusGoalMinutes}
                    onChange={e => setFocusGoalMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Pomodoro focus time goal per day</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">AI Assistant Tone</label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
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
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <span className="font-semibold block mb-0.5">Dual AI Engine Architecture</span>
                LifeOS works out of the box with its built-in Natural Language Understanding engine (supporting task creation, time detection, reminders, 7-day study plans, and priorities). If you provide an OpenAI or Gemini API key below, it will enhance responses using cloud models!
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  OpenAI API Key (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={e => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Stored securely in your local instance storage</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">AI Model</label>
                  <select
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Efficient)</option>
                    <option value="gpt-4o">GPT-4o (Maximum Intelligence)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gemini API Key (Optional)</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Local Persistent Storage</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active (data/lifeos_db.json)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All tasks, subtasks, reminders, memories, and chat messages are automatically saved to disk on every change.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Supabase / PostgreSQL Cloud Sync</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Configurable via .env.local
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  To connect Supabase, add your credentials to <code className="text-indigo-400">.env.local</code>:
                </p>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[10px] text-slate-300 select-all">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                </div>
                <p className="text-slate-400 text-[11px]">
                  Schema file ready at <code className="text-indigo-400">supabase/schema.sql</code>. Paste it into the Supabase SQL Editor for one-click table creation!
                </p>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Preferences saved!
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
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
