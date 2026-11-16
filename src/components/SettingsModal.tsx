'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Database, Key, Sparkles, Check, Moon, Sun, Save, Compass, Type } from 'lucide-react';
import { UserProfile } from '@/types';
import { useTheme, FontStyle } from '@/context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, profile, onUpdateProfile }: SettingsModalProps) {
  const { theme: currentTheme, setTheme: setAppTheme, fontStyle, setFontStyle } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'database'>('profile');
  const [name, setName] = useState(profile.name || 'Nayan');
  const [greetingTitle, setGreetingTitle] = useState(profile.greetingTitle || 'Field Expedition Lead');
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
    setGreetingTitle(profile.greetingTitle || 'Field Expedition Lead');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto border-[3px] sm:border-[3.5px] border-black dark:border-white bg-[#fffdf0] dark:bg-[#181a18] shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] dark:shadow-[6px_6px_0px_#fff] p-4 xs:p-6 text-[#141514] dark:text-[#f4f3ef] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 xs:pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5 xs:gap-3">
            <div className="p-1.5 border-2 border-black bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] shrink-0">
              <Compass className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="bg-[#ff4d00] text-white px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-[10px] xs:text-xs font-black uppercase tracking-widest inline-block">
                // STATION PREFERENCES
              </span>
              <h2 className="text-sm xs:text-base font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-0.5">
                Trailhead Configuration
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#ff4d00] text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 border-b-2 border-black dark:border-white mt-3 xs:mt-4 pb-2.5 xs:pb-3 text-[10px] xs:text-xs uppercase font-black">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-2.5 xs:px-3 py-1.5 border-2 border-black dark:border-white transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#ffe600] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white dark:bg-[#121312] text-[#555] dark:text-[#aaa]'
            }`}
          >
            01 // APPEARANCE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-2.5 xs:px-3 py-1.5 border-2 border-black dark:border-white transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#ffe600] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white dark:bg-[#121312] text-[#555] dark:text-[#aaa]'
            }`}
          >
            02 // COPILOT AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 border-2 border-black dark:border-white transition cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#ffe600] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white dark:bg-[#121312] text-[#555] dark:text-[#aaa]'
            }`}
          >
            03 // STORAGE & SYNC
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Theme Switcher in Settings */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-2">
                  EXPEDITION PALETTE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`p-3.5 border-2 border-black dark:border-white shadow-[2.5px_2.5px_0px_#000] dark:shadow-[2.5px_2.5px_0px_#fff] text-left transition flex items-center gap-3 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#ffe600] text-black font-black'
                        : 'bg-white dark:bg-[#121312] text-[#666] dark:text-[#aaa]'
                    }`}
                  >
                    <Sun className="w-5 h-5 stroke-[2.5]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase">DAYLIGHT</div>
                      <div className="text-[10px] text-[#555] font-bold">WARM SAND & CREAM</div>
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`p-3.5 border-2 border-black dark:border-white shadow-[2.5px_2.5px_0px_#000] dark:shadow-[2.5px_2.5px_0px_#fff] text-left transition flex items-center gap-3 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#ff4d00] text-white font-black'
                        : 'bg-white dark:bg-[#121312] text-[#666] dark:text-[#aaa]'
                    }`}
                  >
                    <Moon className="w-5 h-5 stroke-[2.5]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase">OBSIDIAN NIGHT</div>
                      <div className="text-[10px] text-white/80 font-bold">CHARCOAL & TERRA COTTA</div>
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Station Typography Style */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-[#ff4d00] stroke-[2.5]" />
                  TYPOGRAPHY & FONT SYSTEM
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'editorial',
                      title: 'Alpine Editorial',
                      fonts: 'Bricolage + Plus Jakarta + JetBrains',
                      desc: 'Rugged outdoor luxury & ink-trapped headers',
                    },
                    {
                      id: 'minimal',
                      title: 'Modern Minimalist',
                      fonts: 'Plus Jakarta Sans + JetBrains Mono',
                      desc: 'Clean geometric SaaS & high-legibility UI',
                    },
                    {
                      id: 'mono',
                      title: 'Technical Monospace',
                      fonts: 'Pure JetBrains Mono',
                      desc: 'All-screen telemetry & code density',
                    },
                    {
                      id: 'space',
                      title: 'Space Brutalist',
                      fonts: 'Space Grotesk + Space Mono',
                      desc: 'Retro-futuristic mission control display',
                    },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontStyle(f.id as FontStyle)}
                      className={`p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                        fontStyle === f.id
                          ? 'bg-[#ffe600] text-black font-black'
                          : 'bg-white dark:bg-[#121312] text-[#666] dark:text-[#aaa] hover:bg-[#fffdf0]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-wider">{f.title}</div>
                        <div className="text-[10px] font-bold text-[#ff4d00] font-mono mt-0.5">{f.fonts}</div>
                        <div className="text-[9px] font-bold text-[#666] dark:text-[#aaa] mt-1">{f.desc}</div>
                      </div>
                      {fontStyle === f.id && <Check className="w-4 h-4 stroke-[3] shrink-0 mt-0.5 text-black" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">LEAD NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">CALLSIGN / TITLE</label>
                  <input
                    type="text"
                    value={greetingTitle}
                    onChange={e => setGreetingTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">DISPATCH EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="NAYAN@EXPEDITION.LOCAL"
                  className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">DAILY TASK TARGET</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={dailyTaskGoal}
                    onChange={e => setDailyTaskGoal(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">FOCUS TARGET (MIN/DAY)</label>
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={focusGoalMinutes}
                    onChange={e => setFocusGoalMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3 border-2 border-black bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] text-xs font-bold">
                <span className="font-black block uppercase mb-1">// DUAL AI ENGINE ARCHITECTURE</span>
                LifeOS works out of the box with its built-in Natural Language Understanding engine. Adding OpenAI or Gemini keys routes advanced queries to frontier models.
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                  OPENAI API KEY (OPTIONAL)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-black stroke-[2.5]" />
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={e => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full pl-9 pr-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">AI MODEL</label>
                  <select
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="gpt-4o-mini">GPT-4O MINI (EXPEDITION)</option>
                    <option value="gpt-4o">GPT-4O (FRONTIER)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">GEMINI API KEY (OPTIONAL)</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs font-bold">
              <div className="p-4 border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] bg-white dark:bg-[#121312] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-[#141514] dark:text-[#f4f3ef]">LOCAL DISK STORAGE</span>
                  <span className="text-[10px] border-2 border-black bg-[#ccff00] text-black px-2 py-0.5 font-black uppercase shadow-[1px_1px_0px_#000]">
                    ACTIVE (DATA/LIFEOS_DB.JSON)
                  </span>
                </div>
                <p className="text-[#666] dark:text-[#aaa] text-xs uppercase">
                  All terrain tasks, subtasks, alerts, and field logs persist locally to disk.
                </p>
              </div>

              <div className="p-4 border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] bg-white dark:bg-[#121312] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-[#141514] dark:text-[#f4f3ef]">SUPABASE CLOUD SYNC</span>
                  <span className="text-[10px] border-2 border-black bg-[#ffe600] text-black px-2 py-0.5 font-black uppercase shadow-[1px_1px_0px_#000]">
                    VIA .ENV.LOCAL
                  </span>
                </div>
                <p className="text-[#666] dark:text-[#aaa] text-xs uppercase">
                  Add SUPABASE_URL and SUPABASE_ANON_KEY to enable remote database synchronization.
                </p>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-black dark:border-white">
            {savedSuccess ? (
              <span className="text-xs text-[#ff4d00] font-black flex items-center gap-1 uppercase">
                <Check className="w-4 h-4 stroke-[3]" /> PREFERENCES SAVED
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs uppercase font-black text-[#141514] dark:text-[#f4f3ef] bg-white dark:bg-[#202020] hover:bg-[#fffdf0] transition cursor-pointer"
              >
                CLOSE
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#ff4d00] hover:bg-[#e04400] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" /> {isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
