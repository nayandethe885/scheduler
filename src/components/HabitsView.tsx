'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
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
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#d95326', '#141514', '#f4f3ef'],
        });
      } catch {}
    } else {
      sound.playClick();
    }
    await onToggleHabitDay(habitId, dateStr);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8 pb-16 font-mono"
    >
      {/* Header */}
      <div className="border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-white dark:bg-[#161816] p-4 xs:p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 transition-colors duration-200">
        <div className="space-y-2">
          <span className="bg-[#ff4d00] text-white px-2.5 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase tracking-widest inline-block">
            04 // DISCIPLINE & ROUTINES
          </span>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
            Habit Matrix
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#555] dark:text-[#aaa]">
            DAILY PROTOCOLS · REPEAT EXPEDITIONS · STREAK PERSISTENCE
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[3px_3px_0px_#000] text-xs font-black self-start md:self-auto">
          <span className="uppercase">ACTIVE PROTOCOLS:</span>
          <span className="text-sm font-black">{habits.length}</span>
        </div>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {habits.map((habit, idx) => {
          const IconComponent = ICON_MAP[habit.icon] || Sparkles;
          const indexStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

          return (
            <div
              key={habit.id}
              className="border-[3px] border-black dark:border-white shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000] dark:shadow-[4px_4px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-4 sm:p-6 space-y-4 sm:space-y-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000] transition-all group"
            >
              <div className="flex items-center justify-between gap-2 xs:gap-3">
                <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                  <span className="text-xs font-black text-[#777] shrink-0">{indexStr}</span>
                  <div className="p-1.5 xs:p-2 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] shrink-0">
                    <IconComponent className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm xs:text-base sm:text-lg font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] truncate group-hover:text-[#ff4d00] transition-colors font-display-heavy">
                      {habit.name}
                    </h3>
                    <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-[#666] dark:text-[#aaa] truncate block">
                      {habit.category}
                    </span>
                  </div>
                </div>

                {/* Animated Dancing Flame Streak */}
                <div className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[10px] xs:text-xs font-black shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="shrink-0"
                  >
                    <Flame className="w-3.5 h-3.5 xs:w-4 xs:h-4 fill-black stroke-black" />
                  </motion.div>
                  <span>{habit.streak}D STREAK</span>
                </div>
              </div>

              {/* 7-Day Completion Grid */}
              <div className="pt-1 sm:pt-2">
                <div className="grid grid-cols-7 gap-1 xs:gap-1.5 sm:gap-2">
                  {daysOfWeek.map(day => {
                    const isDone = habit.completedDates.includes(day.dateStr);
                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1 xs:gap-1.5">
                        <span
                          className={`text-[9px] xs:text-[10px] uppercase tracking-wider font-black ${
                            day.isToday ? 'text-[#ff4d00]' : 'text-[#666] dark:text-[#aaa]'
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(habit.id, day.dateStr, isDone)}
                          className={`habit-day-btn w-full aspect-square max-w-[42px] max-h-[42px] min-w-[28px] min-h-[28px] border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_#000] sm:shadow-[2px_2px_0px_#000] dark:shadow-[1.5px_1.5px_0px_#fff] flex flex-col items-center justify-center text-[10px] xs:text-xs font-black transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                            isDone
                              ? 'bg-[#ccff00] text-black'
                              : day.isToday
                              ? 'bg-[#ffe600] text-black'
                              : 'bg-white dark:bg-[#202020] text-[#141514] dark:text-[#f4f3ef] hover:bg-[#ffe600] hover:text-black'
                          }`}
                          title={isDone ? `Completed on ${day.dateStr}` : `Mark completed for ${day.dateStr}`}
                        >
                          <AnimatePresence>
                            {isDone ? (
                              <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="w-4 h-4 xs:w-5 xs:h-5 stroke-[3.5] text-black" />
                              </motion.span>
                            ) : (
                              <span>{day.dateNumber}</span>
                            )}
                          </AnimatePresence>
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
    </motion.div>
  );
}
