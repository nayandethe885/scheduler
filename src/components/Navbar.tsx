'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Plus, 
  Bell, 
  Timer, 
  Sliders, 
  Menu, 
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { getGreeting } from '@/lib/utils';
import { UserProfile } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  profile: UserProfile;
  onOpenNewTask: () => void;
  onOpenNewReminder: () => void;
  onOpenSettings: () => void;
  onToggleSidebarMobile: () => void;
  onOpenQuickAI: () => void;
  onSelectTab: (tab: string) => void;
  completionRate: number;
}

export default function Navbar({
  profile,
  onOpenNewTask,
  onOpenNewReminder,
  onOpenSettings,
  onToggleSidebarMobile,
  onOpenQuickAI,
  onSelectTab,
  completionRate,
}: NavbarProps) {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good Morning');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setGreeting(getGreeting());
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#0b0f19]/85 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 backdrop-blur-md transition-colors duration-150">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{profile.name}</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                {profile.greetingTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {dateStr || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Progress Badge */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-mono text-xs font-medium tracking-wider text-slate-700 dark:text-slate-200">
              {time || '00:00:00 AM'}
            </span>
          </div>

          <button 
            onClick={() => onSelectTab('tasks')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition"
            title="Today's task completion"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Progress:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
          </button>
        </div>

        {/* Right: Actions & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Quick AI Trigger */}
          <button
            onClick={onOpenQuickAI}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition active:scale-95"
            title="Ask LifeOS Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Quick Add Task */}
          <button
            onClick={onOpenNewTask}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 active:scale-95"
            title="Add new task"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Quick Add Reminder */}
          <button
            onClick={onOpenNewReminder}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Set Reminder"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Focus Timer Shortcut */}
          <button
            onClick={() => onSelectTab('focus')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Pomodoro Focus Timer"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings & Profile"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
