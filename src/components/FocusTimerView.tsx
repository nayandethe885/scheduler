'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CloudRain, 
  Wind, 
  Radio, 
  Target, 
  Flame
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

  // Change modes
  const handleSelectMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    const secs = newMode === 'focus' ? 25 * 60 : newMode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setDuration(secs);
    setTimeLeft(secs);
  };

  // Timer tick
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
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  // Ambient sound handler
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Focus & Pomodoro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep focus intervals paired with calm procedural ambient soundscapes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Completed Sessions:</span>
            <span className="font-bold text-slate-900 dark:text-white">{completedSessions}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer Display */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6 relative transition-colors duration-150">
          {/* Mode switch pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleSelectMode('focus')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleSelectMode('shortBreak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                mode === 'shortBreak'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => handleSelectMode('longBreak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                mode === 'longBreak'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              15m Rest
            </button>
          </div>

          {/* Large Circular / Digital Timer */}
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={mode === 'focus' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-600 dark:text-emerald-400'}
                strokeDasharray={`${progressPct}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                {formatSeconds(timeLeft)}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 font-medium">
                {mode === 'focus' ? 'Focus Interval' : 'Rest Interval'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleTimer}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Ambient Soundscapes & Task Linking */}
        <div className="space-y-6">
          {/* Ambient Soundscapes */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ambient Sound</h3>
              </div>
              <span className="text-[10px] text-slate-400">Audio Synth</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Procedural white/brown noise and calm drone sounds.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleToggleAmbient('rain')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition ${
                  ambientTrack === 'rain'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Rain & Storm</span>
                </div>
                <span className="text-[11px] font-semibold">{ambientTrack === 'rain' ? 'Playing' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleToggleAmbient('whitenoise')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition ${
                  ambientTrack === 'whitenoise'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Deep Brown Noise</span>
                </div>
                <span className="text-[11px] font-semibold">{ambientTrack === 'whitenoise' ? 'Playing' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleToggleAmbient('drone')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition ${
                  ambientTrack === 'drone'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Calm Ambient Drone</span>
                </div>
                <span className="text-[11px] font-semibold">{ambientTrack === 'drone' ? 'Playing' : 'Play'}</span>
              </button>
            </div>

            {ambientTrack !== 'none' && (
              <button
                onClick={() => {
                  ambientSound.stop();
                  setAmbientTrack('none');
                }}
                className="w-full py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition"
              >
                Stop Audio
              </button>
            )}
          </div>

          {/* Active Task Link */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Focus Target Task</h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anchor this sprint to a single objective:
            </p>

            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
            >
              <option value="">Select a task...</option>
              {pendingTasks.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.priority.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>

            {selectedTaskId && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Task finished?</span>
                <button
                  onClick={async () => {
                    const task = tasks.find(t => t.id === selectedTaskId);
                    if (task) {
                      await onCompleteTask(task);
                      setSelectedTaskId('');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                >
                  Mark Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
