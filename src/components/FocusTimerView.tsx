'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CloudRain, 
  Wind, 
  Radio, 
  Flame,
  Compass
} from 'lucide-react';
import { Task } from '@/types';
import { ambientSound } from '@/lib/ambient-sound';
import { sound } from '@/lib/sound';

interface FocusTimerViewProps {
  tasks: Task[];
  onCompleteTask: (task: Task) => Promise<void>;
}

export default function FocusTimerView({ tasks, onCompleteTask }: FocusTimerViewProps) {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [ambientTrack, setAmbientTrack] = useState<'none' | 'rain' | 'whitenoise' | 'drone'>('none');
  const [completedSessions, setCompletedSessions] = useState(0);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const handleSelectMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    const secs = newMode === 'focus' ? 25 * 60 : newMode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setDuration(secs);
    setTimeLeft(secs);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      sound.playNotification();
      if (mode === 'focus') {
        setCompletedSessions(prev => prev + 1);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#d95326', '#141514', '#f4f3ef'],
          });
        } catch {}
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const handleToggleAmbient = (type: 'rain' | 'whitenoise' | 'drone') => {
    if (ambientTrack === type) {
      ambientSound.stop();
      setAmbientTrack('none');
    } else {
      ambientSound.play(type, 0.25);
      setAmbientTrack(type);
    }
  };

  const handleToggleTimer = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.round(((duration - timeLeft) / duration) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto space-y-8 pb-16 font-mono"
    >
      {/* 1. Header */}
      <div className="border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-white dark:bg-[#161816] p-4 xs:p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 transition-colors duration-200">
        <div className="space-y-2">
          <span className="bg-[#ff4d00] text-white px-2.5 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase tracking-widest inline-block">
            03 // EXPEDITION CHRONOMETER
          </span>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
            Focus Lab
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#555] dark:text-[#aaa]">
            HIGH-ALTITUDE CONCENTRATION · AMBIENT FREQUENCIES
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[3px_3px_0px_#000] text-xs font-black self-start md:self-auto">
          <Flame className="w-4 h-4 fill-black stroke-black shrink-0" />
          <span className="uppercase">EXPEDITION BLOCKS:</span>
          <span className="text-sm font-black">{completedSessions}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stopwatch Readout */}
        <div className="lg:col-span-2 border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-4 xs:p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center relative overflow-hidden">
          {/* Background Ambient Pulse when timer is running */}
          {isRunning && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.04, 0.12, 0.04] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#ff4d00] pointer-events-none rounded-full"
            />
          )}

          {/* Mode switch buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 p-1 border-2 border-black dark:border-white bg-[#ece9df] dark:bg-[#121312] text-xs uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] max-w-full">
            {[
              { id: 'focus', label: '25M FOCUS' },
              { id: 'shortBreak', label: '05M BREAK' },
              { id: 'longBreak', label: '15M REST' },
            ].map(m => {
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMode(m.id as any)}
                  className={`px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                      : 'text-[#666] dark:text-[#aaa] hover:text-black dark:hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Huge Monospace Digital Chronometer Display */}
          <div className="relative py-2 sm:py-4 flex flex-col items-center justify-center w-full">
            <div className="text-5xl xs:text-7xl sm:text-9xl font-black tracking-tight text-[#141514] dark:text-[#f4f3ef] leading-none select-none font-mono">
              {formatSeconds(timeLeft)}
            </div>
            
            <div className="text-[10px] xs:text-xs uppercase tracking-widest text-[#555] dark:text-[#bbb] font-black mt-3 sm:mt-4 flex items-center gap-2 text-center">
              <span className={`w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full shrink-0 ${isRunning ? 'bg-[#ff4d00] animate-ping' : 'bg-[#989a91]'}`} />
              <span className="truncate">{mode === 'focus' ? '// ACTIVE WORK BLOCK' : '// TRAIL RECUPERATION'} — {progressPct}% ELAPSED</span>
            </div>

            {/* Brutalist Hard Border Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-md h-3.5 sm:h-4 border-2 border-black dark:border-white bg-white dark:bg-[#121312] mt-3 sm:mt-4 overflow-hidden shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <motion.div
                className="h-full bg-[#ff4d00]"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`flex-1 sm:flex-initial px-6 xs:px-8 py-3 xs:py-3.5 text-[11px] xs:text-xs uppercase tracking-widest font-black border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-black text-[#ffe600] dark:bg-white dark:text-black'
                  : 'bg-[#ff4d00] text-white hover:bg-[#e04400]'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current shrink-0" /> : <Play className="w-4 h-4 fill-current shrink-0" />}
              <span>{isRunning ? 'HOLD' : 'COMMENCE FOCUS'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-3 xs:p-3.5 border-2 border-black dark:border-white bg-white dark:bg-[#202020] text-black dark:text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer shrink-0"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Ambient Audio with Equalizer Bars & Task Sync */}
        <div className="space-y-6">
          {/* Ambient Frequencies */}
          <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffbf0] dark:bg-[#181a18] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
              <div>
                <span className="bg-[#ccff00] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-xs font-black uppercase tracking-widest inline-block">
                  AUDIO SYNTH
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-1">
                  Expedition Soundscapes
                </h3>
              </div>

              {/* Animated Audio Equalizer Visualizer Bars */}
              {ambientTrack !== 'none' ? (
                <div className="flex items-end gap-1 h-5">
                  {[0.4, 0.8, 0.3, 0.9, 0.5].map((val, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-[#ff4d00]"
                      animate={{ height: ['20%', '100%', '30%'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + i * 0.12,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Radio className="w-4 h-4 text-[#888]" />
              )}
            </div>

            <p className="text-xs font-bold text-[#555] dark:text-[#aaa] uppercase tracking-wider">
              Procedural wind, storm, and drone noise to mask environmental distraction.
            </p>

            <div className="space-y-2.5 text-xs uppercase font-black">
              <button
                type="button"
                onClick={() => handleToggleAmbient('rain')}
                className={`w-full flex items-center justify-between p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer ${
                  ambientTrack === 'rain'
                    ? 'bg-[#ffe600] text-black font-black'
                    : 'bg-white dark:bg-[#202020] text-[#141514] dark:text-[#f4f3ef]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 stroke-[2.5]" />
                  <span>ALPINE RAIN & STORM</span>
                </div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5">{ambientTrack === 'rain' ? 'ACTIVE' : 'START'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAmbient('whitenoise')}
                className={`w-full flex items-center justify-between p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer ${
                  ambientTrack === 'whitenoise'
                    ? 'bg-[#00e5ff] text-black font-black'
                    : 'bg-white dark:bg-[#202020] text-[#141514] dark:text-[#f4f3ef]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 stroke-[2.5]" />
                  <span>HIGH-PASS WHITE NOISE</span>
                </div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5">{ambientTrack === 'whitenoise' ? 'ACTIVE' : 'START'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAmbient('drone')}
                className={`w-full flex items-center justify-between p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer ${
                  ambientTrack === 'drone'
                    ? 'bg-[#ccff00] text-black font-black'
                    : 'bg-white dark:bg-[#202020] text-[#141514] dark:text-[#f4f3ef]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 stroke-[2.5]" />
                  <span>DEEP CANYON DRONE</span>
                </div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5">{ambientTrack === 'drone' ? 'ACTIVE' : 'START'}</span>
              </button>
            </div>
          </div>

          {/* Target Task Link */}
          <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-6 space-y-3 font-mono">
            <span className="bg-[#ff4d00] text-white px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-xs font-black uppercase tracking-widest inline-block">
              EXPEDITION TARGET
            </span>
            <h4 className="text-sm font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
              Link Focus to Task
            </h4>
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full p-2.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="">SELECT TERRAIN TASK...</option>
              {pendingTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
