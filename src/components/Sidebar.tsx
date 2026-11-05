'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Flame, 
  Timer, 
  Bot, 
  X, 
  Sparkles,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingTasksCount: number;
  upcomingRemindersCount: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  pendingTasksCount,
  upcomingRemindersCount,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'Smart Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
    },
    {
      id: 'calendar',
      label: 'Schedule & Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'habits',
      label: 'Habits & Streaks',
      icon: Flame,
      badge: 'Streak',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    },
    {
      id: 'focus',
      label: 'Focus Pomodoro',
      icon: Timer,
      badge: null,
    },
    {
      id: 'ai',
      label: 'LifeOS Copilot',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 p-4 text-slate-700 dark:text-slate-200 transition-colors duration-150">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                LifeOS
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Personal AI Assistant</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Workspace
        </p>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer: Theme Toggle & Sync Status */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 px-1 space-y-3">
        {/* Quick theme switcher row */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-900/70 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition"
          title="Toggle color theme"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
            Switch
          </span>
        </button>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Sync Engine
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Local persistent storage + Supabase sync.
          </p>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          LifeOS • Simple & Sober
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
