'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Share2, 
  PlusSquare, 
  Zap, 
  BellRing,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { sound } from '@/lib/sound';
import { speakMascot } from '@/lib/speech';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { isInstallable, isInstalled, isIOS, isAndroid, isMacOrWindows, promptInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'android' | 'desktop'>('auto');
  const [isInstalling, setIsInstalling] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      speakMascot("Install Trailhead OS for instant standalone launch, distraction-free workspace, and lock-screen alerts!");
      if (isIOS) setActiveTab('ios');
      else if (isAndroid) setActiveTab('android');
      else if (isMacOrWindows) setActiveTab('desktop');
      else setActiveTab('auto');
    }
  }, [isOpen, isIOS, isAndroid, isMacOrWindows]);

  if (!isOpen) return null;

  const handle1ClickInstall = async () => {
    setIsInstalling(true);
    const result = await promptInstall();
    setIsInstalling(false);
    if (result === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-black/75 backdrop-blur-xs font-mono animate-fadeIn">
      <div className="relative w-full max-w-xl border-[3px] sm:border-[3.5px] border-black dark:border-white bg-[#fffdf0] dark:bg-[#181a18] shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] dark:shadow-[6px_6px_0px_#fff] p-4 xs:p-5 sm:p-7 text-[#141514] dark:text-[#f4f3ef] max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 xs:pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5 xs:gap-3">
            <div className="p-1.5 xs:p-2 border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000] shrink-0">
              <Download className="w-4 h-4 xs:w-5 xs:h-5 stroke-[3] animate-bounce" />
            </div>
            <div>
              <span className="bg-[#ccff00] text-black px-2 py-0.5 border border-black text-[9px] xs:text-[10px] font-black uppercase tracking-widest inline-block shadow-[1px_1px_0px_#000]">
                STANDALONE DISPATCH
              </span>
              <h2 className="text-sm xs:text-base sm:text-xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-0.5">
                Install Trailhead as App
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#ff4d00] text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Status Card & 1-Click Install Button */}
        <div className="mt-5 p-4 sm:p-5 border-2 border-black dark:border-white bg-white dark:bg-[#202220] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#aaa]">
              APPLICATION STATUS:
            </div>
            {isInstalled ? (
              <span className="flex items-center gap-1.5 bg-emerald-400 text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ALREADY INSTALLED
              </span>
            ) : isInstallable ? (
              <span className="flex items-center gap-1.5 bg-[#ccff00] text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                READY FOR 1-CLICK INSTALL
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#ffe600] text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                INSTALLABLE VIA BROWSER
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-[#444] dark:text-[#bbb] leading-relaxed">
            {isInstalled
              ? "Trailhead is running as an installed application with local caching, offline support, and system lock-screen notifications."
              : "Install Trailhead OS onto your desktop or phone home screen. Runs in a full standalone window without browser search bars or tabs."}
          </p>

          {/* 1-Click Native Install Button */}
          {!isInstalled && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isInstalling}
              onClick={handle1ClickInstall}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-5 bg-[#ccff00] hover:bg-[#b8e600] text-black border-2 border-black shadow-[4px_4px_0px_#000] text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{isInstalling ? 'OPENING INSTALLER...' : '⚡ INSTALL APP NOW (1-CLICK)'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </motion.button>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-bold">
          <div className="p-2.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            <div className="flex items-center gap-1 text-[#ff4d00] font-black uppercase">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Instant Launch</span>
            </div>
            <p className="mt-1 text-[#666] dark:text-[#aaa] leading-snug">
              Pins directly to your Windows Taskbar, Mac Dock, or Phone Home Screen.
            </p>
          </div>

          <div className="p-2.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            <div className="flex items-center gap-1 text-[#00e5ff] font-black uppercase">
              <BellRing className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Lock-Screen Alerts</span>
            </div>
            <p className="mt-1 text-[#666] dark:text-[#aaa] leading-snug">
              Receive phone vibrations and alarms even when your browser is closed.
            </p>
          </div>

          <div className="p-2.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black uppercase">
              <Monitor className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Distraction-Free</span>
            </div>
            <p className="mt-1 text-[#666] dark:text-[#aaa] leading-snug">
              Clean fullscreen app layout with zero browser navigation bars or clutter.
            </p>
          </div>
        </div>

        {/* Device-Specific Manual Instructions */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-[#141514] dark:text-[#f4f3ef] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#ff4d00]" />
              <span>DEVICE INSTALLATION GUIDES:</span>
            </span>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#0e0f0e] text-[10px] font-black uppercase">
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 text-center transition border-r-2 border-black dark:border-white ${
                activeTab === 'ios' ? 'bg-[#ffe600] text-black shadow-[inset_0_-2px_0_0_#ff4d00]' : 'text-[#666] hover:text-black dark:hover:text-white'
              }`}
            >
              📱 IPHONE (SAFARI)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 text-center transition border-r-2 border-black dark:border-white ${
                activeTab === 'android' ? 'bg-[#ffe600] text-black shadow-[inset_0_-2px_0_0_#ff4d00]' : 'text-[#666] hover:text-black dark:hover:text-white'
              }`}
            >
              🤖 ANDROID
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-1.5 text-center transition ${
                activeTab === 'desktop' ? 'bg-[#ffe600] text-black shadow-[inset_0_-2px_0_0_#ff4d00]' : 'text-[#666] hover:text-black dark:hover:text-white'
              }`}
            >
              🖥️ WINDOWS / MAC
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            {activeTab === 'ios' && (
              <div className="space-y-1.5 text-[11px] font-bold text-[#444] dark:text-[#ccc]">
                <div className="text-xs font-black text-[#ff4d00] uppercase">Apple iPhone & iPad (Safari):</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>In <strong>Safari</strong>, tap the <strong>Share</strong> button at bottom (<Share2 className="w-3 h-3 inline stroke-[2.5]" />).</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3 h-3 inline stroke-[2.5]" />).</li>
                  <li>Tap <strong>&quot;Add&quot;</strong> in the top-right corner.</li>
                  <li>Launch Trailhead directly from your phone home screen!</li>
                </ol>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-1.5 text-[11px] font-bold text-[#444] dark:text-[#ccc]">
                <div className="text-xs font-black text-[#00e5ff] uppercase">Android Phone (Chrome / Firefox):</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right of Chrome.</li>
                  <li>Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  <li>Confirm installation in the system dialog.</li>
                  <li>The Trailhead app icon will appear in your App Drawer and Home Screen.</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-1.5 text-[11px] font-bold text-[#444] dark:text-[#ccc]">
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Desktop (Chrome / Edge / Brave):</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the <strong>Install icon</strong> (<Download className="w-3 h-3 inline stroke-[2.5]" /> or monitor icon) on the right side of the browser URL bar.</li>
                  <li>Or tap the <strong>&quot;⚡ INSTALL APP NOW (1-CLICK)&quot;</strong> button above.</li>
                  <li>Confirm <strong>&quot;Install&quot;</strong> to create a dedicated desktop window and start menu shortcut!</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-black dark:border-white flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#666] dark:text-[#999]">
            PWA STANDALONE SPECIFICATION V2.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

