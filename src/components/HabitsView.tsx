'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check, Plus, Sparkles, Droplet, Brain, BookOpen, Activity } from 'lucide-react';
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
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
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
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Habits & Daily Routines
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build consistency, eliminate friction, and watch your daily productivity streaks compound.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Total active habits: <strong className="text-white">{habits.length}</strong>
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
              className="glass-panel p-5 rounded-3xl border border-slate-800/80 hover:border-slate-700 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{habit.name}</h3>
                    <span className="text-[11px] text-slate-400">{habit.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{habit.streak} Day Streak</span>
                </div>
              </div>

              {/* 7-Day Completion Grid */}
              <div className="pt-2">
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map(day => {
                    const isDone = habit.completedDates.includes(day.dateStr);
                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold ${
                            day.isToday ? 'text-indigo-400' : 'text-slate-500'
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <button
                          onClick={() => handleToggle(habit.id, day.dateStr, isDone)}
                          className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center text-xs font-semibold transition active:scale-90 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                              : day.isToday
                              ? 'bg-slate-900 border-indigo-500/50 text-indigo-300 hover:border-indigo-400'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                          title={isDone ? `Completed on ${day.dateStr}` : `Mark completed for ${day.dateStr}`}
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : day.dateNumber}
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
