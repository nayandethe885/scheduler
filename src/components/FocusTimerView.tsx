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
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Target, 
  Sparkles,
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
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Focus & Pomodoro Sanctuary
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep focus blocks combined with procedural ambient soundscapes to maximize your output.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Completed Blocks:</span>
            <span className="font-bold text-white">{completedSessions}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer Display */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          {/* Mode switch pills */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleSelectMode('focus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'focus' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              25m Deep Focus
            </button>
            <button
              onClick={() => handleSelectMode('shortBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              5m Short Break
            </button>
            <button
              onClick={() => handleSelectMode('longBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'longBreak' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              15m Rest
            </button>
          </div>

          {/* Large Circular / Digital Timer */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-900"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={mode === 'focus' ? 'text-indigo-500' : 'text-emerald-400'}
                strokeDasharray={`${progressPct}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-mono font-black text-white tracking-wider">
                {formatSeconds(timeLeft)}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">
                {mode === 'focus' ? 'Focus Session' : 'Rest Interval'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleTimer}
              className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Pause Focus' : 'Start Focus'}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-3.5 rounded-2xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Ambient Soundscapes & Task Linking */}
        <div className="space-y-6">
          {/* Ambient Soundscapes */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Ambient Generator</h3>
              </div>
              <span className="text-[10px] text-slate-400">Web Audio Synth</span>
            </div>

            <p className="text-xs text-slate-400">
              Procedurally generated acoustic backdrops for sensory immersion without distracting lyrics.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleToggleAmbient('rain')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition ${
                  ambientTrack === 'rain'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>Rain & Storm Backdrop</span>
                </div>
                <span>{ambientTrack === 'rain' ? 'Playing' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleToggleAmbient('whitenoise')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition ${
                  ambientTrack === 'whitenoise'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-indigo-400" />
                  <span>Deep Brown Noise</span>
                </div>
                <span>{ambientTrack === 'whitenoise' ? 'Playing' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleToggleAmbient('drone')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition ${
                  ambientTrack === 'drone'
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-violet-400" />
                  <span>Alpha Wave Harmonic Drone</span>
                </div>
                <span>{ambientTrack === 'drone' ? 'Playing' : 'Play'}</span>
              </button>
            </div>

            {ambientTrack !== 'none' && (
              <button
                onClick={() => {
                  ambientSound.stop();
                  setAmbientTrack('none');
                }}
                className="w-full py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 transition"
              >
                Stop Sound
              </button>
            )}
          </div>

          {/* Active Task Link */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Target className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Focus Target Task</h3>
            </div>

            <p className="text-xs text-slate-400">
              Anchor this 25-minute sprint to a single goal:
            </p>

            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a task to focus on...</option>
              {pendingTasks.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.priority.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>

            {selectedTaskId && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Finished this task?</span>
                <button
                  onClick={async () => {
                    const task = tasks.find(t => t.id === selectedTaskId);
                    if (task) {
                      await onCompleteTask(task);
                      setSelectedTaskId('');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
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
