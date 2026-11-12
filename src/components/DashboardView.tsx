'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrambleTextPlugin);
}
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Check, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Bell, 
  Compass, 
  Send,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { Task, Reminder, UserProfile } from '@/types';
import { formatDate, formatTime, getGreeting } from '@/lib/utils';
import { sound } from '@/lib/sound';
import TerrainCanvas from '@/components/TerrainCanvas';
import CompassHUD from '@/components/CompassHUD';

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

// Stagger container variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
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
  const [todayStr, setTodayStr] = useState('');
  const [filterTodayOnly, setFilterTodayOnly] = useState(true);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Interactive Light Follower
  const heroAreaRef = useRef<HTMLElement | null>(null);
  const heroLightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const area = heroAreaRef.current;
    const light = heroLightRef.current;
    if (!area || !light) return;

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(light, {
        left: x,
        top: y,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(light, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
      });
    };

    area.addEventListener('mousemove', handleMouseMove);
    area.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      area.removeEventListener('mousemove', handleMouseMove);
      area.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(light);
    };
  }, []);

  // GSAP Scramble Text Cipher Transition
  const triggerScramble = useCallback(() => {
    if (typeof window === 'undefined') return;

    gsap.killTweensOf('.text');
    gsap.killTweensOf('.watermark-text');

    // Scramble badge to TRAILHEAD
    gsap.to('.text', {
      scrambleText: {
        text: 'TRAILHEAD',
        chars: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻ012345789',
        speed: 0.3,
      },
      duration: 2.0,
      ease: 'none',
    });

    // Scramble giant outline watermark to TRAILHEAD.
    gsap.to('.watermark-text', {
      scrambleText: {
        text: 'TRAILHEAD.',
        chars: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻ012345789',
        speed: 0.3,
      },
      duration: 2.5,
      ease: 'none',
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerScramble();
    }, 400);
    return () => clearTimeout(timer);
  }, [triggerScramble]);

  const todayTasks = tasks.filter(t => t.dueDate === todayStr || !t.dueDate);
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');

  const importantDeadlines = pendingTasks
    .filter(t => t.dueDate)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  const activeReminders = reminders.filter(r => !r.isCompleted).slice(0, 5);

  const handleTaskCheckbox = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const willBeCompleted = task.status !== 'completed';
    if (willBeCompleted) {
      sound.playTaskComplete();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#d95326', '#e06a3f', '#141514', '#f4f3ef'],
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
    'What should I focus on right now?',
    'Schedule a deep work block tomorrow at 9 AM',
    'Summarize my pending deadlines',
    'Add task: Review Trailhead design system',
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-16"
    >
      {/* 1. HERO BANNER: "Out there. Starts here." (Matching Image 3) */}
      <motion.section 
        ref={heroAreaRef}
        variants={itemVariants}
        className="relative overflow-hidden border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-white dark:bg-[#161816] p-6 sm:p-10 lg:p-12 transition-colors duration-200"
      >
        {/* Interactive GSAP Spotlight Light (User's Motion Graphic) */}
        <div
          ref={heroLightRef}
          className="pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-2xl opacity-0 transition-opacity duration-200 z-1"
          style={{
            background: 'radial-gradient(circle, rgba(255, 77, 0, 0.28) 0%, rgba(255, 230, 0, 0.08) 45%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Procedural Dynamic Topographic Elevation Waves Canvas Motion Graphic */}
        <TerrainCanvas className="opacity-75 dark:opacity-85" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Animated Neo-Brutalist Sticker Kicker */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-black">
              <span className="bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 uppercase tracking-wider -rotate-1">
                BUILT FOR THE WAY OUT.
              </span>
              <button
                type="button"
                onClick={triggerScramble}
                title="Click to trigger cipher scramble transition"
                className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-[#ff4d00] text-white text-xs font-black tracking-widest hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#ffe600] animate-pulse" />
                <span className="text">TRAILHEAD</span>
              </button>
            </div>

            {/* Massive Chunky Typography with Motion Stagger (Image 3) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
              <motion.span 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="block"
              >
                Out there.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
                className="block"
              >
                Starts here.
              </motion.span>
            </h1>

            {/* Monospace Subtext */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="font-mono text-xs sm:text-sm tracking-wider uppercase text-[#141514] dark:text-[#f4f3ef] font-bold pt-1 max-w-xl leading-relaxed"
            >
              TRUSTED GEAR. LOCAL KNOW-HOW. WIDE-OPEN POSSIBILITIES.
            </motion.p>
          </div>

          {/* Right: Technical Radar, Compass HUD & Coordinates Stamp */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-5 font-mono text-xs text-[#141514] dark:text-[#f4f3ef] shrink-0"
          >
            {/* Live Gyroscopic Compass HUD */}
            <CompassHUD className="self-start lg:self-end" />

            <div className="text-left lg:text-right space-y-1">
              <div className="text-[#141514] dark:text-[#f4f3ef] font-black tracking-widest uppercase flex items-center lg:justify-end gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d00] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff4d00]" />
                </span>
                DENVER, CO // 39.7392° N, 104.9903° W
              </div>
              <div className="tracking-wider text-xs text-[#141514] dark:text-[#f4f3ef] font-bold uppercase">
                ELEVATION: 5,280 FT // TIME: {currentTime || '00:00:00'} MST
              </div>
            </div>

            {/* Interactive Progress Block */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTab('tasks')}
              className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer font-black text-xs tracking-wider uppercase hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d00] animate-pulse" />
              <span>
                {completionRate}% RESOLVED // {completedTasks.length}/{tasks.length} DONE
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. STATS OVERVIEW: Neo-Brutalist 4-Color Grid */}
      <motion.section 
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono"
      >
        {/* Total Tasks (Yellow Accent) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onSelectTab('tasks')}
          className="p-5 border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffdf0] dark:bg-[#1a1c1a] cursor-pointer group hover:shadow-[7px_7px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mb-3">
            <span className="bg-[#ffe600] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">01 // BACKLOG</span>
            <ArrowUpRight className="w-4 h-4 text-black dark:text-white stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#141514] dark:text-[#f4f3ef]">
            {tasks.length < 10 ? `0${tasks.length}` : tasks.length}
          </div>
          <div className="text-xs font-bold text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider mt-2">
            TOTAL ACTIVE ITEMS
          </div>
        </motion.div>

        {/* Pending Tasks (Orange Accent) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onSelectTab('tasks')}
          className="p-5 border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fff5f0] dark:bg-[#201a18] cursor-pointer group hover:shadow-[7px_7px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mb-3">
            <span className="bg-[#ff4d00] text-white px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">02 // PENDING</span>
            <ArrowUpRight className="w-4 h-4 text-black dark:text-white stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#ff4d00]">
            {pendingTasks.length < 10 ? `0${pendingTasks.length}` : pendingTasks.length}
          </div>
          <div className="text-xs font-bold text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider mt-2">
            {highPriorityTasks.length} HIGH PRIORITY
          </div>
        </motion.div>

        {/* Completed Tasks (Lime Accent) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onSelectTab('tasks')}
          className="p-5 border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#f6fff0] dark:bg-[#182018] cursor-pointer group hover:shadow-[7px_7px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mb-3">
            <span className="bg-[#ccff00] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">03 // RESOLVED</span>
            <ArrowUpRight className="w-4 h-4 text-black dark:text-white stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#141514] dark:text-[#f4f3ef]">
            {completedTasks.length < 10 ? `0${completedTasks.length}` : completedTasks.length}
          </div>
          <div className="text-xs font-bold text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider mt-2">
            FINISHED ITEMS
          </div>
        </motion.div>

        {/* Reminders (Cyan Accent) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={onOpenNewReminder}
          className="p-5 border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#f0fbff] dark:bg-[#151e22] cursor-pointer group hover:shadow-[7px_7px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mb-3">
            <span className="bg-[#00e5ff] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">04 // ALERTS</span>
            <ArrowUpRight className="w-4 h-4 text-black dark:text-white stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#141514] dark:text-[#f4f3ef]">
            {activeReminders.length < 10 ? `0${activeReminders.length}` : activeReminders.length}
          </div>
          <div className="text-xs font-bold text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider mt-2">
            EXPEDITION ALERTS
          </div>
        </motion.div>
      </motion.section>

      {/* 3. SIGNATURE LIST ROWS: "What's calling?" with Neo-Brutalist Layout */}
      <motion.section variants={itemVariants} className="space-y-6">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#ff4d00] text-white px-2.5 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] font-mono text-xs font-black uppercase tracking-wider">
              01 // PRIORITY MATRIX
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#141514] dark:text-[#f4f3ef] uppercase font-display-heavy">
                What&apos;s calling?
              </h2>
              <p className="text-xs font-mono font-bold text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider mt-1">
                A switchback. A sprint. A new line. Start with what gets you outside.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilterTodayOnly(!filterTodayOnly)}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black dark:border-white shadow-[2.5px_2.5px_0px_#000] dark:shadow-[2.5px_2.5px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  filterTodayOnly
                    ? 'bg-[#ffe600] text-black'
                    : 'bg-white dark:bg-[#1a1c1a] text-[#141514] dark:text-[#f4f3ef]'
                }`}
              >
                {filterTodayOnly ? '⚡ TODAY ONLY' : 'ALL ACTIVE'}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenNewTask}
                className="px-4 py-1.5 bg-[#ff4d00] hover:bg-[#e04400] text-white font-mono text-xs uppercase tracking-wider font-black border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> ADD TASK
              </motion.button>
            </div>
          </div>
        </div>

        {/* Trailhead Neo-Brutalist Task Container */}
        <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-white dark:bg-[#161816] divide-y-[2.5px] divide-black dark:divide-white">
          {(filterTodayOnly ? todayTasks : tasks).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 px-6 text-center space-y-4 bg-[#fffdf0] dark:bg-[#181a18]"
            >
              <Compass className="w-12 h-12 text-[#ff4d00] mx-auto animate-spin-slow stroke-[2.5]" />
              <div className="space-y-1">
                <p className="text-lg uppercase tracking-wider text-[#141514] dark:text-[#f4f3ef] font-black">
                  NO ACTIVE TERRAIN SCHEDULED
                </p>
                <p className="text-xs font-mono font-bold text-[#444] dark:text-[#bbb] max-w-sm mx-auto uppercase">
                  All trail markers cleared for today. Plan your next route or dispatch Copilot.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewTask}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-black uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> CREATE TRAIL TASK
              </button>
            </motion.div>
          ) : (
            (filterTodayOnly ? todayTasks : tasks).slice(0, 6).map((task, idx) => {
              const isDone = task.status === 'completed';
              const indexStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

              let pillBg = 'bg-[#ffe600] text-black';
              let pillLabel = 'FOR THE MILES AHEAD';
              if (task.priority === 'high') {
                pillLabel = 'HIGH PRIORITY';
                pillBg = 'bg-[#ff4d00] text-white';
              } else if (task.priority === 'medium') {
                pillLabel = 'STAY A LITTLE LONGER';
                pillBg = 'bg-[#00e5ff] text-black';
              } else if (task.category) {
                pillLabel = task.category.toUpperCase();
                pillBg = 'bg-[#ccff00] text-black';
              }

              const metaTokens = [
                task.category?.toUpperCase() || 'GENERAL',
                task.dueTime || 'TODAY',
                task.subtasks && task.subtasks.length > 0 
                  ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} ESSENTIALS`
                  : 'TRAIL ESSENTIALS'
              ];

              return (
                <motion.div
                  key={task.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: 'rgba(255, 230, 0, 0.08)' }}
                  onClick={() => onSelectTab('tasks')}
                  className="group py-5 sm:py-6 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  {/* Left: Index, Brutalist Checkbox & Chunky Task Title */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-sm font-black text-[#888] dark:text-[#888] shrink-0 group-hover:text-[#ff4d00] transition-colors">
                      {indexStr}
                    </span>

                    {/* Brutalist Hard-Border Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleTaskCheckbox(e, task)}
                      className={`w-6 h-6 rounded-none border-[2.5px] border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center justify-center shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                        isDone
                          ? 'bg-[#ccff00] text-black'
                          : 'bg-white dark:bg-[#202020] hover:bg-[#ffe600]'
                      }`}
                      title={isDone ? 'Mark pending' : 'Mark complete'}
                    >
                      <AnimatePresence>
                        {isDone && (
                          <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-4 h-4 stroke-[3.5] text-black" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Bold Title */}
                    <div className="min-w-0">
                      <h3 
                        className={`text-xl sm:text-2xl font-black tracking-tight truncate transition-colors uppercase ${
                          isDone 
                            ? 'line-through text-[#888] dark:text-[#777]' 
                            : 'text-[#141514] dark:text-[#f4f3ef] group-hover:text-[#ff4d00]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="font-mono text-xs font-bold text-[#555] dark:text-[#aaa] truncate max-w-xl mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center & Right: Brutalist Sticker Pill Badge & Meta */}
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pl-10 md:pl-0 shrink-0 font-mono">
                    <span 
                      className={`px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-wider ${pillBg}`}
                    >
                      {pillLabel}
                    </span>

                    <span className="text-xs uppercase tracking-wider font-bold text-[#666] dark:text-[#aaa] hidden sm:inline">
                      {metaTokens.join(' · ')}
                    </span>

                    {/* Diagonal Arrow Trigger ↗ */}
                    <span 
                      className="text-2xl font-black text-black dark:text-white group-hover:text-[#ff4d00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform inline-block"
                    >
                      ↗
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* View all tasks link */}
        <div className="pt-2 flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-[#666] dark:text-[#aaa] uppercase tracking-widest">
            DIFFERENT PATHS. THE SAME PULL.
          </span>
          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className="px-3 py-1 bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 uppercase tracking-wider font-black flex items-center gap-1 transition-all cursor-pointer"
          >
            EXPLORE ALL FIELD TASKS ↗
          </button>
        </div>
      </motion.section>

      {/* 4. EXPEDITION ALERTS & COPILOT DISPATCH */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Expedition Reminders */}
        <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div className="space-y-1">
              <span className="bg-[#00e5ff] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] font-mono text-xs font-black uppercase tracking-widest inline-block">
                02 // CRITICAL ALERTS
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
                Active Field Reminders
              </h3>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onOpenNewReminder}
              className="p-2 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
              title="Add reminder"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>

          <div className="space-y-2.5">
            {activeReminders.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono font-black text-[#666] dark:text-[#aaa] uppercase tracking-wider border-2 border-dashed border-black/30 dark:border-white/30 p-4">
                NO PENDING TIME ALERTS
              </div>
            ) : (
              activeReminders.map(rem => (
                <div key={rem.id} className="p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#202220] flex items-center justify-between gap-4 font-mono">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-[#141514] dark:text-[#f4f3ef] uppercase truncate">
                      {rem.title}
                    </div>
                    <div className="text-xs font-bold text-[#555] dark:text-[#bbb] flex items-center gap-2 mt-0.5 uppercase">
                      <Clock className="w-3.5 h-3.5 text-[#ff4d00] stroke-[2.5]" />
                      <span>{formatDate(rem.dateTime)} // {formatTime(rem.dateTime)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleReminderComplete(rem)}
                    className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-[#ff4d00] text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition shrink-0 cursor-pointer"
                  >
                    DISMISS
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Copilot Natural Language Dispatch */}
        <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffbf0] dark:bg-[#181a18] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div className="space-y-1">
              <span className="bg-[#ffe600] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] font-mono text-xs font-black uppercase tracking-widest inline-block">
                03 // COPILOT DISPATCH
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
                Field Intelligence
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('ai')}
              className="px-3 py-1 bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs uppercase tracking-wider font-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
            >
              FULL CONSOLE ↗
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-black text-[#141514] dark:text-[#f4f3ef] uppercase tracking-widest">
              QUICK COMMANDS:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendQuickAIChat(prompt)}
                  className="px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#202220] hover:bg-[#ffe600] hover:text-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Chat Input */}
          <form onSubmit={handleQuickSubmit} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickPrompt}
                onChange={e => setQuickPrompt(e.target.value)}
                placeholder="ENTER INSTRUCTION (E.G. REMIND ME TO PACK GEAR AT 8 PM)..."
                className="w-full pl-3 pr-12 py-3 bg-white dark:bg-[#121312] border-[2.5px] border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] text-xs font-black font-mono text-[#141514] dark:text-[#f4f3ef] placeholder-[#888] focus:outline-none focus:bg-[#fffdf0] dark:focus:bg-[#1a1c1a] transition"
              />
              <button
                type="submit"
                disabled={!quickPrompt.trim()}
                className="absolute right-2 p-2 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000] disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* 5. GIGANTIC OUTLINE WATERMARK TYPOGRAPHY */}
      <motion.section 
        variants={itemVariants} 
        className="relative pt-12 pb-6 overflow-hidden select-none pointer-events-auto"
      >
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="text-center group cursor-pointer"
          onClick={triggerScramble}
          title="Click to trigger cipher scramble transition"
        >
          <span 
            className="watermark-text text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] uppercase leading-none block select-none font-black tracking-tighter"
            style={{
              WebkitTextStroke: '3px var(--border-main)',
              color: 'transparent',
              letterSpacing: '-0.04em',
            }}
          >
            Trailhead.
          </span>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs font-mono font-black text-black bg-[#ffe600] border-2 border-black shadow-[3px_3px_0px_#000] uppercase tracking-widest flex items-center gap-2 px-4 py-1.5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer">
              <Sparkles className="w-4 h-4 text-black animate-spin-slow stroke-[2.5]" />
              CLICK TO SCRAMBLE CIPHER (ﾊﾐﾋｰｳｼﾅﾓﾆｻ012345789)
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* 6. TECHNICAL METADATA FOOTER */}
      <footer className="pt-6 border-t-[3px] border-black dark:border-white font-mono text-xs uppercase tracking-widest font-black text-[#555] dark:text-[#aaa] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          © 2026 TRAILHEAD SUPPLY CO.
        </div>
        <div className="text-center">
          DENVER, COLORADO // 39.7392° N, 104.9903° W
        </div>
        <div>
          LEAVE IT BETTER THAN YOU FOUND IT.
        </div>
      </footer>
    </motion.div>
  );
}
