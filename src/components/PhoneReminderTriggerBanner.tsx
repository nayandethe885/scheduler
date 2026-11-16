'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Check, RefreshCw, X, Smartphone, Calendar } from 'lucide-react';
import { Reminder } from '@/types';
import { createGoogleCalendarUrl, downloadIcsFile } from '@/lib/phoneReminders';
import { sound } from '@/lib/sound';

interface PhoneReminderTriggerBannerProps {
  activeAlert: Reminder | null;
  onDismiss: (reminder: Reminder) => void;
  onSnooze: (reminder: Reminder, minutes: number) => void;
}

export default function PhoneReminderTriggerBanner({
  activeAlert,
  onDismiss,
  onSnooze,
}: PhoneReminderTriggerBannerProps) {
  if (!activeAlert) return null;

  const handleAppleCalendar = () => {
    sound.playClick();
    downloadIcsFile(activeAlert.title, activeAlert.dateTime);
  };

  const handleGoogleCalendar = () => {
    sound.playClick();
    const url = createGoogleCalendarUrl(activeAlert.title, activeAlert.dateTime);
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="fixed top-18 sm:top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-50 font-mono"
      >
        <div className="border-[3.5px] border-black dark:border-white bg-[#ffe600] text-black shadow-[6px_6px_0px_#000] p-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#ff4d00] text-white border border-black animate-bounce">
                <Bell className="w-4 h-4 stroke-[3]" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider">
                🚨 PHONE REMINDER TRIGGERED
              </span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(activeAlert)}
              className="p-1 hover:bg-black/10 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Content */}
          <div className="py-2.5">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-tight leading-snug">
              {activeAlert.title}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-black/80">
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Phone lock-screen alert & vibration dispatched!</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t-2 border-black flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDismiss(activeAlert)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#141514] text-white hover:bg-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>DONE</span>
            </button>

            <button
              type="button"
              onClick={() => onSnooze(activeAlert, 5)}
              className="flex items-center gap-1 py-1.5 px-2.5 bg-white text-black hover:bg-[#fffdf0] text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] transition cursor-pointer"
              title="Snooze 5 minutes"
            >
              <RefreshCw className="w-3 h-3 stroke-[2.5]" />
              <span>+5M</span>
            </button>

            <button
              type="button"
              onClick={() => onSnooze(activeAlert, 15)}
              className="flex items-center gap-1 py-1.5 px-2.5 bg-white text-black hover:bg-[#fffdf0] text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] transition cursor-pointer"
              title="Snooze 15 minutes"
            >
              <RefreshCw className="w-3 h-3 stroke-[2.5]" />
              <span>+15M</span>
            </button>

            {/* Sync Phone Calendar */}
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="py-1.5 px-2 bg-[#ff4d00] text-white hover:bg-[#e04400] text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition cursor-pointer"
              title="Add to Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

