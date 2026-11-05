'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  Plus, 
  Bell, 
  Check, 
  ChevronRight,
  Target,
  ListTodo,
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
  high: { label: 'High', style: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50' },
  medium: { label: 'Medium', style: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
  low: { label: 'Low', style: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50' },
};

const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40',
  Study: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40',
  Health: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
  Finance: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/40',
  Meeting: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/40',
  Creative: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900/40',
  Personal: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
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
          colors: ['#4f46e5', '#3b82f6', '#10b981'],
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
    'Remind me to call friend at 8 PM',
    'Schedule a meeting for Friday',
    'What important work is pending?',
    'Create a study plan for next 7 days',
    'What should I focus on right now?',
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. HERO BRIEFING: Sober, Clean, Elegant */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm transition-colors duration-150">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              Daily Briefing
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{profile.name}</span>
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              You have completed <strong className="text-slate-900 dark:text-white font-semibold">{completedTasks.length}</strong> of <strong className="text-slate-900 dark:text-white font-semibold">{tasks.length}</strong> tasks today. {pendingTasks.length > 0 ? `${pendingTasks.length} pending items remaining.` : 'All clear for now!'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                {currentDateStr || 'Today'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {currentTime || 'Clock'}
              </span>
            </div>
          </div>

          {/* Productivity Radial Progress Indicator */}
          <div className="flex items-center gap-4 sm:gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{completionRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Done</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Target</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {completedTasks.length} / {tasks.length} Completed
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {completionRate >= 80
                  ? 'Excellent progress'
                  : completionRate >= 50
                  ? 'Good pace'
                  : 'Let’s get started'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS: Simple, sober, elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>In backlog</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Circle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{highPriorityTasks.length} high priority</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div 
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Finished items</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition" />
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div 
          onClick={onOpenNewReminder}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Reminders</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeReminders.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Active alerts</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition" />
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Today&apos;s Focus & Tasks</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Action items scheduled for immediate execution</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTodayOnly(!filterTodayOnly)}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                    filterTodayOnly
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {filterTodayOnly ? "Today Only" : 'All Active'}
                </button>
                <button
                  onClick={onOpenNewTask}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-2">
              {(filterTodayOnly ? todayTasks : tasks).length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No tasks scheduled</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                    Your schedule is clear! Click below to create a new task or ask LifeOS Copilot.
                  </p>
                  <button
                    onClick={onOpenNewTask}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
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
                      className={`group flex items-start justify-between p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-slate-50/60 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/40 opacity-60'
                          : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleTaskCheckbox(task)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs sm:text-sm font-medium leading-tight truncate ${
                                isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Priority badge */}
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${priorityInfo.style}`}>
                              {priorityInfo.label}
                            </span>

                            {/* Category badge */}
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${categoryStyle}`}>
                              {task.category}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks counter & due info */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            {task.dueTime && (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
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
                              <span className="flex items-center gap-1">
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
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 transition"
              >
                View all tasks in Smart Task Manager <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Important Deadlines Widget */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Critical Deadlines</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Next 72 Hours</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importantDeadlines.length === 0 ? (
                <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                  No impending high-urgency deadlines.
                </div>
              ) : (
                importantDeadlines.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[180px]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.dueDate ? formatDate(item.dueDate) : 'No date'} {item.dueTime ? `• ${item.dueTime}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
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
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Reminders</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled time alerts</p>
                </div>
              </div>
              <button
                onClick={onOpenNewReminder}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-xs flex items-center gap-1"
                title="New reminder"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeReminders.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  No active reminders scheduled.
                </div>
              ) : (
                activeReminders.map(rem => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {rem.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(rem.dateTime)} at {formatTime(rem.dateTime)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleReminderComplete(rem)}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 transition"
                      title="Dismiss reminder"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">LifeOS Copilot</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Natural language assistant</p>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('ai')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Full Chat <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendQuickAIChat(prompt)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 transition"
                  >
                    {prompt}
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
                  placeholder="e.g. Remind me to finish assignment tomorrow at 10 AM..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-950 transition"
                />
                <button
                  type="submit"
                  disabled={!quickPrompt.trim()}
                  className="absolute right-1.5 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                Automatic time, date, & task detection.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
