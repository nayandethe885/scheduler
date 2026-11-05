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
  Search,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { getGreeting } from '@/lib/utils';
import { UserProfile } from '@/types';

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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Personalized Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {greeting}, <span className="text-indigo-400">{profile.name}</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {profile.greetingTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                {dateStr || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Progress Badge */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span className="font-mono text-sm font-medium tracking-wider text-slate-200">
              {time || '00:00:00 AM'}
            </span>
          </div>

          <div 
            onClick={() => onSelectTab('tasks')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition"
            title="Today's task completion"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Progress:</span>
            <span className="font-bold text-emerald-400">{completionRate}%</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger */}
          <button
            onClick={onOpenQuickAI}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95"
            title="Ask LifeOS Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Quick Add Task */}
          <button
            onClick={onOpenNewTask}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1 active:scale-95"
            title="Add new task"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Quick Add Reminder */}
          <button
            onClick={onOpenNewReminder}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
            title="Set Reminder"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Focus Timer Shortcut */}
          <button
            onClick={() => onSelectTab('focus')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Pomodoro Focus Timer"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Settings & Profile"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
