'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, MessageSquare, X, RefreshCw, Compass } from 'lucide-react';
import { speakMascot, cancelMascotSpeech, isMascotAudioMuted } from '@/lib/speech';
import { sound } from '@/lib/sound';

interface CartoonMascotProps {
  mode: 'auth' | 'portal';
  customGreeting?: string;
  userName?: string;
  activeTab?: string;
  isPasswordFocused?: boolean;
  onMascotClick?: () => void;
  className?: string;
}

const PORTAL_TIPS = [
  "Tip from Pipo: Tackle your highest priority trail marker first thing this morning!",
  "Base Station telemetry looks clear. Remember to take a 5-minute hydration stretch!",
  "One step at a time, Explorer! Even Mount Everest is climbed step by step.",
  "Need to plan your week? Just ask the AI Copilot to schedule your tasks!",
  "Great rhythm! Keep that habit streak burning bright today!",
  "Stay focused in the Focus Lab — 25 minutes of deep work makes magic happen!",
];

export default function CartoonMascot({
  mode = 'portal',
  customGreeting,
  userName = 'Explorer',
  activeTab = 'dashboard',
  isPasswordFocused = false,
  className = '',
}: CartoonMascotProps) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState<boolean>(true);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouthFrame, setMouthFrame] = useState<number>(0);
  const [isPortalMinimized, setIsPortalMinimized] = useState<boolean>(false);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Sync mute state
  useEffect(() => {
    setIsMuted(isMascotAudioMuted());
  }, []);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Animate mouth when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthFrame(prev => (prev + 1) % 4);
    }, 110);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Track cursor to make eyes follow pointer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      setMousePos({
        x: Math.max(Math.min(dx * 7, 7), -7),
        y: Math.max(Math.min(dy * 5, 5), -5),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Speak a message with lip-sync and audio
  const handleSpeak = useCallback((text: string) => {
    setSpeechText(text);
    setIsBubbleOpen(true);
    speakMascot(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, []);

  // Initial welcome on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'auth') {
        const welcome = customGreeting || "Welcome to Trailhead Base Station! I'm Pipo, your expedition scout! Sign in below or tap Quick Demo to explore!";
        handleSpeak(welcome);
      } else {
        const welcome = customGreeting || `Welcome back to Trailhead, ${userName}! All base systems are operational. Ready to conquer your summit?`;
        handleSpeak(welcome);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      cancelMascotSpeech();
    };
  }, [mode, userName, customGreeting, handleSpeak]);

  // Speak contextual hints when activeTab changes in portal
  useEffect(() => {
    if (mode !== 'portal') return;

    let tabMessage = '';
    switch (activeTab) {
      case 'dashboard':
        tabMessage = `Back at the Base Station! Here is your daily terrain overview.`;
        break;
      case 'tasks':
        tabMessage = `Field Tasks unlocked! Which trail marker are we clearing today?`;
        break;
      case 'focus':
        tabMessage = `Expedition Focus Lab! Deep work block initiated — zero distractions!`;
        break;
      case 'habits':
        tabMessage = `Habit Matrix online! Consistency turns daily steps into mountains climbed!`;
        break;
      case 'ai':
        tabMessage = `Copilot Intelligence console ready! Ask me to plan, schedule, or organize!`;
        break;
      default:
        break;
    }

    if (tabMessage) {
      handleSpeak(tabMessage);
    }
  }, [activeTab, mode, handleSpeak]);

  // Password focus reaction in Auth mode
  useEffect(() => {
    if (mode === 'auth' && isPasswordFocused) {
      handleSpeak("Shh! Top secret credentials! Don't worry, my robot eyes are covered!");
    }
  }, [mode, isPasswordFocused, handleSpeak]);

  // Mascot Click: Random Tip / Fun Dialogue
  const handleMascotClick = () => {
    sound.playClick();
    if (mode === 'auth') {
      const authReplies = [
        "Beep-boop! I'm Pipo, your mountain guide! Let's get you signed in!",
        "Tip: You can use the Quick 1-Click Demo button to test the entire OS instantly!",
        "Every great journey starts with a single step... and a clean sign in!",
      ];
      const random = authReplies[Math.floor(Math.random() * authReplies.length)];
      handleSpeak(random);
    } else {
      const random = PORTAL_TIPS[Math.floor(Math.random() * PORTAL_TIPS.length)];
      handleSpeak(random);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      cancelMascotSpeech();
      setIsSpeaking(false);
    } else {
      handleSpeak("Voice audio enabled! I'm loud and clear, Explorer!");
    }
  };

  // Mouth SVG paths for talking animation
  const getMouthPath = () => {
    if (isPasswordFocused) {
      return "M 68 86 Q 80 82 92 86"; // cute flat focused line
    }
    if (!isSpeaking) {
      return "M 66 84 Q 80 96 94 84"; // joyful smile
    }
    switch (mouthFrame) {
      case 0:
        return "M 66 82 Q 80 98 94 82 Q 80 90 66 82"; // small open 'a'
      case 1:
        return "M 70 80 Q 80 102 90 80 Q 80 88 70 80"; // tall open 'o'
      case 2:
        return "M 64 83 Q 80 95 96 83"; // wide smile
      case 3:
      default:
        return "M 67 81 Q 80 104 93 81 Q 80 92 67 81"; // dynamic talking
    }
  };

  return (
    <div className={`relative select-none font-mono ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {isBubbleOpen && speechText && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className={`absolute z-30 ${
              mode === 'auth'
                ? 'bottom-[105%] left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[300px] sm:w-[360px]'
                : 'bottom-[115%] right-0 w-[290px] sm:w-[340px]'
            }`}
          >
            <div className="bg-[#ffe600] text-black border-[3px] border-black shadow-[4px_4px_0px_#000] p-3.5 relative">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black/80 text-[10px] font-black tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
                  <span>PIPO // SCOUT MASCOT</span>
                  {isSpeaking && (
                    <span className="inline-flex gap-0.5 ml-1">
                      <span className="w-1 h-2.5 bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-3.5 bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Re-play audio button */}
                  <button
                    type="button"
                    onClick={() => handleSpeak(speechText)}
                    title="Repeat speech"
                    className="p-1 hover:bg-black/10 rounded transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Mute / Unmute Button */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute voice' : 'Mute voice'}
                    className="p-1 hover:bg-black/10 rounded transition cursor-pointer"
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-700 stroke-[2.5]" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    )}
                  </button>

                  {/* Close bubble button */}
                  <button
                    type="button"
                    onClick={() => {
                      cancelMascotSpeech();
                      setIsBubbleOpen(false);
                      setIsSpeaking(false);
                    }}
                    className="p-1 hover:bg-black/10 rounded transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Dialogue Content */}
              <p className="text-xs sm:text-sm font-black leading-snug tracking-tight text-[#111]">
                {speechText}
              </p>

              {/* Quick Tap Trigger */}
              <div className="mt-2.5 pt-2 border-t border-black/20 flex items-center justify-between text-[10px] font-bold text-black/80">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ff4d00]" />
                  <span>Tap Pipo for field tips</span>
                </span>
                <span className="text-[9px] bg-black text-[#ffe600] px-1.5 py-0.5 border border-black uppercase font-black">
                  {isMuted ? 'VOICE: OFF' : 'VOICE: ON'}
                </span>
              </div>

              {/* Cartoon Speech Bubble Pointer Tail */}
              <div 
                className="absolute -bottom-3 right-12 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-black"
              />
              <div 
                className="absolute -bottom-[9px] right-[50px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#ffe600]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Cartoon Mascot Body */}
      <motion.div
        ref={mascotRef}
        onClick={handleMascotClick}
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.94, rotate: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`cursor-pointer group relative ${
          mode === 'portal' && isPortalMinimized ? 'scale-75' : ''
        }`}
        title="I'm Pipo! Click me to speak!"
      >
        <svg
          viewBox="0 0 160 160"
          className={`${
            mode === 'auth' ? 'w-32 h-32 sm:w-40 sm:h-40' : 'w-24 h-24 sm:w-28 sm:h-28'
          } drop-shadow-[4px_4px_0px_#000]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antenna with Animated Radar Beacon */}
          <line
            x1="80"
            y1="34"
            x2="80"
            y2="14"
            stroke="#000"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Signal waves when speaking */}
          {isSpeaking && (
            <>
              <path
                d="M 68 12 Q 62 8 68 4"
                stroke="#ff4d00"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d="M 92 12 Q 98 8 92 4"
                stroke="#ff4d00"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </>
          )}
          {/* Pulsating Beacon Orb */}
          <circle
            cx="80"
            cy="12"
            r="8"
            fill={isSpeaking ? "#ff4d00" : "#ffe600"}
            stroke="#000"
            strokeWidth="3"
            className={isSpeaking ? "animate-ping" : ""}
          />
          <circle
            cx="80"
            cy="12"
            r="8"
            fill={isSpeaking ? "#ff4d00" : "#ffe600"}
            stroke="#000"
            strokeWidth="3"
          />

          {/* Adventurer Head / Helmet (Neo-Brutalist Chunky) */}
          <rect
            x="28"
            y="32"
            width="104"
            height="86"
            rx="24"
            fill="#f7f4eb"
            stroke="#000"
            strokeWidth="4"
          />
          {/* Helmet Top Visor Cap */}
          <path
            d="M 32 48 Q 80 34 128 48"
            stroke="#ff4d00"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Mountain Peak Badge on Helmet Brow */}
          <path
            d="M 74 44 L 80 36 L 86 44 Z"
            fill="#ff4d00"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Left & Right Headphone / Ear Communicators */}
          <rect
            x="18"
            y="54"
            width="12"
            height="32"
            rx="6"
            fill="#ff4d00"
            stroke="#000"
            strokeWidth="3.5"
          />
          <rect
            x="130"
            y="54"
            width="12"
            height="32"
            rx="6"
            fill="#ff4d00"
            stroke="#000"
            strokeWidth="3.5"
          />

          {/* Cyber Visor Screen */}
          <rect
            x="40"
            y="48"
            width="80"
            height="50"
            rx="14"
            fill="#121312"
            stroke="#000"
            strokeWidth="3.5"
          />

          {/* Eyes (Interactive with cursor tracking & emotions) */}
          {isPasswordFocused ? (
            // No-peeking mode: Cute smiling eye arcs with hands covering
            <>
              <path
                d="M 52 70 Q 60 62 68 70"
                stroke="#ffe600"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 92 70 Q 100 62 108 70"
                stroke="#ffe600"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : isBlinking ? (
            // Blinking flat line
            <>
              <line
                x1="52"
                y1="70"
                x2="68"
                y2="70"
                stroke="#ffe600"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="92"
                y1="70"
                x2="108"
                y2="70"
                stroke="#ffe600"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : (
            // Expressive cartoon anime/robot eyes tracking cursor
            <>
              {/* Left Eye White */}
              <circle
                cx="60"
                cy="70"
                r="10"
                fill="#ffffff"
                stroke="#000"
                strokeWidth="2"
              />
              {/* Left Pupil (Moves with mouse) */}
              <circle
                cx={60 + mousePos.x}
                cy={70 + mousePos.y}
                r="5.5"
                fill="#ff4d00"
              />
              {/* Pupil Sparkle Highlight */}
              <circle
                cx={58 + mousePos.x}
                cy={68 + mousePos.y}
                r="2"
                fill="#ffffff"
              />

              {/* Right Eye White */}
              <circle
                cx="100"
                cy="70"
                r="10"
                fill="#ffffff"
                stroke="#000"
                strokeWidth="2"
              />
              {/* Right Pupil (Moves with mouse) */}
              <circle
                cx={100 + mousePos.x}
                cy={70 + mousePos.y}
                r="5.5"
                fill="#ff4d00"
              />
              {/* Pupil Sparkle Highlight */}
              <circle
                cx={98 + mousePos.x}
                cy={68 + mousePos.y}
                r="2"
                fill="#ffffff"
              />
            </>
          )}

          {/* Rosy Cheeks */}
          <circle cx="44" cy="85" r="5" fill="#ff5ebf" opacity="0.8" />
          <circle cx="116" cy="85" r="5" fill="#ff5ebf" opacity="0.8" />

          {/* Animated Cartoon Mouth */}
          <path
            d={getMouthPath()}
            fill={isSpeaking ? "#ffe600" : "none"}
            stroke="#000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Explorer Collar & Neck */}
          <rect
            x="64"
            y="114"
            width="32"
            height="14"
            rx="4"
            fill="#ffe600"
            stroke="#000"
            strokeWidth="3.5"
          />

          {/* Body / Explorer Vest */}
          <path
            d="M 44 126 L 116 126 L 124 154 L 36 154 Z"
            fill="#ff4d00"
            stroke="#000"
            strokeWidth="4"
          />

          {/* Vest Center Zip & Details */}
          <line
            x1="80"
            y1="126"
            x2="80"
            y2="154"
            stroke="#000"
            strokeWidth="3"
          />
          <circle cx="62" cy="140" r="3.5" fill="#ffe600" stroke="#000" strokeWidth="2" />
          <circle cx="98" cy="140" r="3.5" fill="#ffe600" stroke="#000" strokeWidth="2" />

          {/* Left Waving Hand / Cartoon Glove */}
          <motion.g
            animate={
              isSpeaking
                ? { rotate: [0, 15, -10, 15, 0], y: [0, -3, 0] }
                : { rotate: [0, 8, 0], y: [0, -2, 0] }
            }
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{ transformOrigin: "36px 136px" }}
          >
            <circle cx="28" cy="138" r="10" fill="#ffffff" stroke="#000" strokeWidth="3" />
            <path
              d="M 28 132 C 22 136 24 144 32 144"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Right Hand / Thumbs-up Glove */}
          <circle cx="132" cy="138" r="10" fill="#ffffff" stroke="#000" strokeWidth="3" />
          <line x1="132" y1="130" x2="132" y2="124" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Floating "CLICK TO TALK" Pill on Hover */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#ffe600] px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border border-[#ffe600] whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_#000]">
          ⚡ TALK TO PIPO
        </div>
      </motion.div>
    </div>
  );
}

