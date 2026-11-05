'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check, Sparkles, Droplet, Brain, BookOpen, Activity } from 'lucide-react';
import { Habit } from '@/types';
import { sound } from '@/lib/sound';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabitDay: (habitId: string, dateStr: string) => Promise<void>;
}

const ICON_MAP: Record<string, any> = {
  Droplet,
  Brain,
  BookOpen,
  Activity,
  Sparkles,
};

export default function HabitsView({ habits, onToggleHabitDay }: HabitsViewProps) {
  const [selectedWeekOffset] = useState(0);
  const [daysOfWeek, setDaysOfWeek] = useState<{ dateStr: string; dayName: string; dateNumber: number; isToday: boolean }[]>([]);

  useEffect(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i + selectedWeekOffset * 7);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dateNumber: d.getDate(),
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
      });
    }
    setDaysOfWeek(days);
  }, [selectedWeekOffset]);

  const handleToggle = async (habitId: string, dateStr: string, isCompleted: boolean) => {
    if (!isCompleted) {
      sound.playTaskComplete();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#10b981', '#f59e0b'],
        });
      } catch {}
    } else {
      sound.playClick();
    }
    await onToggleHabitDay(habitId, dateStr);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Habits & Routines
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build consistency, track daily streaks, and reinforce positive habits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Active habits: <strong className="text-slate-900 dark:text-white font-semibold">{habits.length}</strong>
          </span>
        </div>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map(habit => {
          const IconComponent = ICON_MAP[habit.icon] || Sparkles;
          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm space-y-4 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl flex items-center justify-center text-slate-900 dark:text-white"
                    style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{habit.name}</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{habit.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{habit.streak} Day Streak</span>
                </div>
              </div>

              {/* 7-Day Completion Grid */}
              <div className="pt-1">
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map(day => {
                    const isDone = habit.completedDates.includes(day.dateStr);
                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold ${
                            day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <button
                          onClick={() => handleToggle(habit.id, day.dateStr, isDone)}
                          className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center text-xs font-semibold transition active:scale-95 ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                              : day.isToday
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                          title={isDone ? `Completed on ${day.dateStr}` : `Mark completed for ${day.dateStr}`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : day.dateNumber}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
