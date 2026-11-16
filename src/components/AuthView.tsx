'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  AlertCircle,
  Zap,
  Mountain,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import CartoonMascot from '@/components/CartoonMascot';
import TerrainCanvas from '@/components/TerrainCanvas';
import InstallAppModal from '@/components/InstallAppModal';
import { sound } from '@/lib/sound';

interface AuthViewProps {
  onSuccess?: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const { signIn, signUp, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Productivity Architect');
  const [email, setEmail] = useState('nayan@lifeos.app');
  const [password, setPassword] = useState('pass123');
  const [showPassword, setShowPassword] = useState(false);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    sound.playClick();

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.success) {
          triggerSuccessEffects();
          onSuccess?.();
        } else {
          setErrorMessage(result.error || 'Failed to authenticate.');
        }
      } else {
        const result = await signUp(name, email, password, title);
        if (result.success) {
          triggerSuccessEffects();
          onSuccess?.();
        } else {
          setErrorMessage(result.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = () => {
    sound.playClick();
    triggerSuccessEffects();
    loginAsGuest('Nayan');
    onSuccess?.();
  };

  const handleGuestLogin = () => {
    sound.playClick();
    triggerSuccessEffects();
    loginAsGuest('Explorer');
    onSuccess?.();
  };

  const triggerSuccessEffects = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d00', '#ffe600', '#00e5ff', '#141514'],
      });
    } catch {}
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 xs:p-4 sm:p-6 lg:p-8 aesthetic-bg text-[#141514] dark:text-[#f4f3ef] overflow-hidden font-mono">
      {/* Background Interactive Topographic Elevation Motion Graphic */}
      <TerrainCanvas className="opacity-40 dark:opacity-60 pointer-events-none" />

      {/* Watermark Branding Header */}
      <div className="absolute top-3 xs:top-4 sm:top-6 left-3 xs:left-4 sm:left-6 right-3 xs:right-4 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 xs:gap-2.5">
          <div className="p-1 xs:p-1.5 bg-[#ff4d00] text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
            <Mountain className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-extrabold text-xs xs:text-sm sm:text-base tracking-tighter uppercase font-display-heavy">
              TRAILHEAD
            </div>
            <div className="text-[8px] xs:text-[10px] tracking-widest font-black text-[#555] dark:text-[#aaa] hidden 2xs:block">
              BASE STATION AUTHENTICATION // DENVER
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 xs:gap-2 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[10px] xs:text-[11px] font-black uppercase tracking-wider cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition"
            title="Install Trailhead as Native Application"
          >
            <Download className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
            <span className="hidden xs:inline">INSTALL</span>
            <span>APP</span>
          </motion.button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-[11px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
            <span>SECURITY ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Authentication Grid */}
      <div className="relative z-20 w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center pt-16 xs:pt-20 sm:pt-16 pb-6 sm:pb-8">
        {/* Left Column: Mascot Greeting & Character Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center text-center lg:text-left lg:items-start order-2 lg:order-1">
          <div className="mb-4 relative w-full flex justify-center lg:justify-start">
            <CartoonMascot
              mode="auth"
              isPasswordFocused={isPasswordFocused}
              customGreeting={
                mode === 'signin'
                  ? "Welcome Explorer! I'm Pipo, your expedition scout! Enter your credentials or tap '1-Click Demo' to explore Trailhead OS!"
                  : "New callsign registration! What should we call you on the mountain radio?"
              }
            />
          </div>

          <div className="space-y-2 max-w-sm">
            <div className="inline-flex items-center gap-1.5 bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
              EXPEDITION COMPANION
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-none text-[#141514] dark:text-[#f4f3ef]">
              Meet Pipo.
            </h2>
            <p className="text-[11px] xs:text-xs font-bold text-[#555] dark:text-[#bbb] leading-relaxed">
              Your autonomous personal productivity scout. Talks, guides, and celebrates milestones across your whole LifeOS portal.
            </p>
          </div>

          {/* Quick Demo Access Pills */}
          <div className="mt-4 sm:mt-5 w-full max-w-sm flex flex-col sm:flex-row gap-2 xs:gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleQuickDemoLogin}
              className="flex-1 flex items-center justify-center gap-2 px-3 xs:px-3.5 py-2 xs:py-2.5 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] text-[11px] xs:text-xs font-extrabold tracking-wider uppercase transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>1-CLICK DEMO (NAYAN)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGuestLogin}
              className="px-3 xs:px-3.5 py-2 xs:py-2.5 bg-white dark:bg-[#1c1e1c] text-[#141514] dark:text-[#f4f3ef] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] text-[11px] xs:text-xs font-extrabold tracking-wider uppercase transition cursor-pointer"
            >
              GUEST ACCESS
            </motion.button>
          </div>
        </div>

        {/* Right Column: Neo-Brutalist Authentication Form Card */}
        <div className="lg:col-span-7 order-1 lg:order-2 w-full">
          <div className="bg-white dark:bg-[#161816] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] p-4 xs:p-6 sm:p-8 relative">
            {/* Top Switcher Tabs */}
            <div className="flex border-b-[3px] border-black dark:border-white -mt-4 -mx-4 xs:-mt-6 xs:-mx-6 sm:-mt-8 sm:-mx-8 mb-5 sm:mb-6 bg-[#f7f4eb] dark:bg-[#0e0f0e]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                  sound.playClick();
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition border-r-2 border-black dark:border-white ${
                  mode === 'signin'
                    ? 'bg-[#ffe600] text-black shadow-[inset_0_-3px_0_0_#ff4d00]'
                    : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
                }`}
              >
                01 // SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                  sound.playClick();
                }}
                className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition ${
                  mode === 'signup'
                    ? 'bg-[#ffe600] text-black shadow-[inset_0_-3px_0_0_#ff4d00]'
                    : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
                }`}
              >
                02 // REGISTER CALLSIGN
              </button>
            </div>

            {/* Error Notification */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 p-3 bg-red-100 dark:bg-red-950/80 border-2 border-red-600 text-red-900 dark:text-red-200 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#dc2626]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1.5">
                      EXPLORER FULL NAME
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white">
                        <User className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Nayan Dethe"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#f7f4eb] dark:bg-[#0e0f0e] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-bold focus:outline-hidden focus:border-[#ff4d00] dark:focus:border-[#ffe600]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1.5">
                      EXPEDITION CALLSIGN / ROLE
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white">
                        <Compass className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Lead Architect, Expedition Pioneer"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#f7f4eb] dark:bg-[#0e0f0e] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-bold focus:outline-hidden focus:border-[#ff4d00] dark:focus:border-[#ffe600]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1.5">
                  EXPEDITION EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white">
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@trailhead.os"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f4eb] dark:bg-[#0e0f0e] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-bold focus:outline-hidden focus:border-[#ff4d00] dark:focus:border-[#ffe600]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#555] dark:text-[#bbb]">
                    BASE PASSWORD
                  </label>
                  <span className="text-[10px] font-bold text-[#888]">MIN 4 CHARS</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black dark:text-white">
                    <KeyRound className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#f7f4eb] dark:bg-[#0e0f0e] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-bold focus:outline-hidden focus:border-[#ff4d00] dark:focus:border-[#ffe600]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-raw absolute inset-y-0 right-0 pr-3 flex items-center text-[#666] hover:text-black dark:hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AUTHENTICATING TELEMETRY...</span>
                    </>
                  ) : mode === 'signin' ? (
                    <>
                      <span>ENTER EXPEDITION PORTAL</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  ) : (
                    <>
                      <span>REGISTER CALLSIGN & ENTER</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Bottom Footer Info */}
            <div className="mt-6 pt-4 border-t-2 border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-bold text-[#666] dark:text-[#999]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>SECURED EXPEDITION SESSION</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="underline hover:text-[#ff4d00] transition cursor-pointer"
              >
                Skip with Nayan demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Application Installation Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

