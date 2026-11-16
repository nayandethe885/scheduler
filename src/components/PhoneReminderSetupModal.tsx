'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Share2, 
  Calendar, 
  Volume2, 
  Vibrate, 
  Sparkles,
  Send
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestPhoneNotification 
} from '@/lib/phoneReminders';
import { sound } from '@/lib/sound';

interface PhoneReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhoneReminderSetupModal({ isOpen, onClose }: PhoneReminderSetupModalProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePermission = async () => {
    sound.playClick();
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleSendTest = async () => {
    setIsSending(true);
    sound.playClick();
    const success = await sendTestPhoneNotification();
    setIsSending(false);
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-mono animate-fadeIn">
      <div className="relative w-full max-w-lg border-[3.5px] border-black dark:border-white bg-[#fffdf0] dark:bg-[#181a18] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] p-5 sm:p-7 text-[#141514] dark:text-[#f4f3ef] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-black bg-[#ff4d00] text-white shadow-[2px_2px_0px_#000]">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="bg-[#ffe600] text-black px-2 py-0.5 border border-black text-[10px] font-black uppercase tracking-widest inline-block shadow-[1px_1px_0px_#000]">
                MOBILE TELEMETRY SYNC
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-0.5">
                Phone Reminders Setup
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

        {/* Current Device Status Card */}
        <div className="mt-5 p-4 border-2 border-black dark:border-white bg-white dark:bg-[#202220] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#aaa]">
              PHONE ALERT STATUS:
            </div>
            {permission === 'granted' ? (
              <span className="flex items-center gap-1.5 bg-emerald-400 text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ACTIVE & READY
              </span>
            ) : permission === 'denied' ? (
              <span className="flex items-center gap-1.5 bg-red-400 text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                BLOCKED IN BROWSER
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#ffe600] text-black px-2.5 py-0.5 border border-black font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000]">
                ACTION REQUIRED
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-bold text-[#444] dark:text-[#bbb] leading-relaxed">
            {permission === 'granted'
              ? 'Your device is configured to receive lock-screen push alerts, audio chimes, and hardware vibrations when reminders are due.'
              : 'Tap the button below to allow Trailhead to send lock-screen alerts and vibrate your phone when reminders trigger.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            {permission !== 'granted' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleEnablePermission}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ffe600] hover:bg-[#ebd300] text-black border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Bell className="w-4 h-4 stroke-[3]" />
                <span>ALLOW PHONE NOTIFICATIONS</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSending}
                onClick={handleSendTest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>{isSending ? 'DISPATCHING TEST...' : 'TEST ALERT ON MY PHONE NOW 📲'}</span>
              </motion.button>
            )}
          </div>

          {testSent && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-600 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center gap-1.5 uppercase"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Test notification dispatched! Check your phone notification bar.</span>
            </motion.div>
          )}
        </div>

        {/* Operating System Step-by-Step Guides */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-[#141514] dark:text-[#f4f3ef] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#ff4d00]" />
            <span>HOW TO GET ALERTS WHEN TAB IS CLOSED</span>
          </div>

          {/* iOS Card */}
          <div className="p-3.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span className="text-[#ff4d00]">📱 iPhone / iPad (iOS 16.4+)</span>
              <span className="text-[10px] bg-black text-white px-1.5 py-0.5">APPLE PWA</span>
            </div>
            <ol className="text-[11px] font-bold text-[#555] dark:text-[#bbb] space-y-1 list-decimal list-inside leading-relaxed">
              <li>Open this website in <strong>Safari</strong> on your iPhone.</li>
              <li>Tap the <strong>Share</strong> button at bottom (<Share2 className="w-3 h-3 inline stroke-[2.5]" />).</li>
              <li>Select <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Launch from your Home Screen and tap <strong>Allow Notifications</strong>.</li>
            </ol>
          </div>

          {/* Android Card */}
          <div className="p-3.5 border-2 border-black dark:border-white bg-[#f7f4eb] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span className="text-[#00e5ff]">🤖 Android (Chrome / Firefox)</span>
              <span className="text-[10px] bg-black text-white px-1.5 py-0.5">CHROME PWA</span>
            </div>
            <ol className="text-[11px] font-bold text-[#555] dark:text-[#bbb] space-y-1 list-decimal list-inside leading-relaxed">
              <li>Tap the <strong>three dots (⋮)</strong> in Chrome.</li>
              <li>Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Tap <strong>Allow Phone Notifications</strong> above for lock-screen alerts.</li>
            </ol>
          </div>

          {/* Native Phone Calendar Sync Option */}
          <div className="p-3.5 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>Direct Phone Calendar Sync</span>
            </div>
            <p className="text-[11px] font-black leading-snug">
              Every reminder card on your dashboard has a 1-tap <strong>&quot;Add to Calendar 📱&quot;</strong> button that sets physical alarms in Apple Calendar (iOS) or Google Calendar (Android)!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-black dark:border-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
          >
            GOT IT, CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

