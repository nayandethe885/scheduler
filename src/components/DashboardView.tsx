'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  Plus, 
  Bell, 
  Check, 
  Tag, 
  ChevronRight,
  TrendingUp,
  Target,
  ListTodo,
  ExternalLink
} from 'lucide-react';
import { Task, Reminder, UserProfile, Priority } from '@/types';
import { formatDate, formatTime, getRelativeTimeString, getGreeting } from '@/lib/utils';
import { sound } from '@/lib/sound';

interface DashboardViewProps {
  tasks: Task[];
  reminders: Reminder[];
  profile: UserProfile;
  onToggleTaskComplete: (task: Task) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onOpenNewTask: () => void;
  onOpenNewReminder: () => void;
  onSelectTab: (tab: string) => void;
  onSendQuickAIChat: (msg: string) => void;
  onToggleReminderComplete: (reminder: Reminder) => Promise<void>;
  completionRate: number;
}

const PRIORITY_BADGES: Record<Priority, { label: string; style: string }> = {
  high: { label: 'High', style: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  medium: { label: 'Medium', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  low: { label: 'Low', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Study: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Health: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Finance: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Meeting: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Creative: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  Personal: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export default function DashboardView({
  tasks,
  reminders,
  profile,
  onToggleTaskComplete,
  onDeleteTask,
  onOpenNewTask,
  onOpenNewReminder,
  onSelectTab,
  onSendQuickAIChat,
  onToggleReminderComplete,
  completionRate,
}: DashboardViewProps) {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good Morning');
  const [todayStr, setTodayStr] = useState('');
  const [filterTodayOnly, setFilterTodayOnly] = useState(true);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    setGreeting(getGreeting());
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setGreeting(getGreeting());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter tasks
  const todayTasks = tasks.filter(t => t.dueDate === todayStr || !t.dueDate);
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');

  // Deadlines: upcoming within next 3 days
  const importantDeadlines = pendingTasks
    .filter(t => t.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  // Active reminders
  const activeReminders = reminders.filter(r => !r.isCompleted).slice(0, 5);

  const handleTaskCheckbox = async (task: Task) => {
    const willBeCompleted = task.status !== 'completed';
    if (willBeCompleted) {
      sound.playTaskComplete();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#3b82f6', '#10b981'],
        });
      } catch {}
    } else {
      sound.playClick();
    }
    await onToggleTaskComplete(task);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onSendQuickAIChat(quickPrompt);
    setQuickPrompt('');
  };

  const samplePrompts = [
    'What are my tasks for today?',
    'Remind me to call my friend at 8 PM',
    'Schedule a meeting for Friday',
    'What important work is pending?',
    'Create a study plan for the next 7 days',
    'What should I focus on today?',
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. HERO BANNER: Personalized Greeting, Clock & Live Productivity Ring */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-indigo-950/40">
        {/* Ambient radial glow background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              LifeOS Intelligent Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {greeting}, <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">{profile.name}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Here is your daily productivity briefing. You have completed <strong className="text-white">{completedTasks.length}</strong> of <strong className="text-white">{tasks.length}</strong> tasks today. Let&apos;s conquer your key priorities!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                {currentDateStr || 'Today'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-200">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {currentTime || 'Live Clock'}
              </span>
            </div>
          </div>

          {/* Productivity Radial Progress Indicator */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{completionRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Done</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300">Daily Target</div>
              <div className="text-sm font-bold text-white">
                {completedTasks.length} / {tasks.length} Completed
              </div>
              <p className="text-[11px] text-slate-400">
                {completionRate >= 80
                  ? '🌟 Crushing goals!'
                  : completionRate >= 50
                  ? '⚡ Great momentum'
                  : '🚀 Keep going!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRODUCTIVITY STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{tasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>In your backlog</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-2xl glass-panel border border-slate-800/80 hover:border-amber-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Circle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{highPriorityTasks.length} high priority</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-2xl glass-panel border border-slate-800/80 hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Finished items</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div 
          onClick={onOpenNewReminder}
          className="p-4 rounded-2xl glass-panel border border-slate-800/80 hover:border-violet-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Reminders</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-violet-400">{activeReminders.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Scheduled alerts</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition" />
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2-COLUMN GRID (Today's Tasks & Deadlines / Reminders + AI Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Today&apos;s Focus & Tasks</h2>
                  <p className="text-xs text-slate-400">Action items scheduled for immediate execution</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTodayOnly(!filterTodayOnly)}
                  className={`px-3 py-1 text-xs rounded-xl border transition ${
                    filterTodayOnly
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {filterTodayOnly ? "Today's Only" : 'All Active'}
                </button>
                <button
                  onClick={onOpenNewTask}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-2.5">
              {(filterTodayOnly ? todayTasks : tasks).length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-white">No tasks scheduled</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                    Your schedule is clear! Click below to create a new task or ask LifeOS Copilot.
                  </p>
                  <button
                    onClick={onOpenNewTask}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition"
                  >
                    + Create Task
                  </button>
                </div>
              ) : (
                (filterTodayOnly ? todayTasks : tasks).slice(0, 7).map(task => {
                  const isDone = task.status === 'completed';
                  const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                  const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Work;

                  return (
                    <div
                      key={task.id}
                      className={`group flex items-start justify-between p-3.5 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-900/60 opacity-60'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                        {/* Custom checkbox */}
                        <button
                          onClick={() => handleTaskCheckbox(task)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 hover:border-indigo-400 bg-slate-950/60'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-medium leading-tight truncate ${
                                isDone ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Priority badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityInfo.style}`}>
                              {priorityInfo.label}
                            </span>

                            {/* Category badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryStyle}`}>
                              {task.category}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks counter & due info */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                            {task.dueTime && (
                              <span className="flex items-center gap-1 text-indigo-300">
                                <Clock className="w-3 h-3" />
                                {task.dueTime}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <ListTodo className="w-3 h-3" />
                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete shortcut */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => onSelectTab('tasks')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition"
              >
                View all tasks in Smart Task Manager <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Important Deadlines Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Critical Deadlines</h3>
              </div>
              <span className="text-xs text-slate-400">Next 72 Hours</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importantDeadlines.length === 0 ? (
                <div className="col-span-2 text-xs text-slate-400 py-3 text-center">
                  No impending high-urgency deadlines.
                </div>
              ) : (
                importantDeadlines.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.dueDate ? formatDate(item.dueDate) : 'No date'} {item.dueTime ? `• ${item.dueTime}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {item.dueDate ? getRelativeTimeString(item.dueDate) : 'Due soon'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Upcoming Reminders & Quick AI Chat */}
        <div className="space-y-6">
          {/* Upcoming Reminders Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upcoming Reminders</h3>
                  <p className="text-[11px] text-slate-400">Scheduled time alerts</p>
                </div>
              </div>
              <button
                onClick={onOpenNewReminder}
                className="p-1.5 rounded-lg bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 transition border border-violet-500/30 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeReminders.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active reminders scheduled.
                </div>
              ) : (
                activeReminders.map(rem => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {rem.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-violet-400" />
                        <span>{formatDate(rem.dateTime)} at {formatTime(rem.dateTime)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleReminderComplete(rem)}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 border border-slate-800 transition"
                      title="Mark reminder done"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 shadow-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shadow-md">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">LifeOS Copilot</h3>
                  <p className="text-[11px] text-slate-400">Natural language personal intelligence</p>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('ai')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Full Chat <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendQuickAIChat(prompt)}
                    className="text-left px-2.5 py-1.5 rounded-xl bg-slate-950/70 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 transition"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Quick Chat Input */}
            <form onSubmit={handleQuickSubmit} className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder="e.g., Remind me to finish assignment tomorrow at 10 AM..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!quickPrompt.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Natural language understanding with automatic time, date, & task detection.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
