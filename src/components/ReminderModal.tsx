'use client';

import React, { useState } from 'react';
import { X, Bell, AlertCircle, Compass, Smartphone, Calendar, CheckCircle2 } from 'lucide-react';
import { Reminder, Priority } from '@/types';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  createGoogleCalendarUrl, 
  downloadIcsFile 
} from '@/lib/phoneReminders';
import { sound } from '@/lib/sound';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Promise<void>;
}

export default function ReminderModal({ isOpen, onClose, onSave }: ReminderModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Reminder title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const combinedDateTime = new Date(`${date}T${time}:00`).toISOString();
      await onSave({
        title: title.trim(),
        dateTime: combinedDateTime,
        priority,
        isCompleted: false,
      });
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-mono">
      <div className="relative w-full max-w-md border-[3.5px] border-black dark:border-white bg-[#fffdf0] dark:bg-[#181a18] shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] p-6 text-[#141514] dark:text-[#f4f3ef] transition-colors duration-200">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <div className="p-1.5 border-2 border-black bg-[#00e5ff] text-black shadow-[2px_2px_0px_#000]">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="bg-[#00e5ff] text-black px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-xs font-black uppercase tracking-widest inline-block">
                // TIME ALERT DISPATCH
              </span>
              <h2 className="text-base font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-0.5">
                New Field Reminder
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

        {error && (
          <div className="mt-3 p-2.5 border-2 border-black bg-[#ff4d00] text-white text-xs flex items-center gap-1.5 uppercase font-black shadow-[2px_2px_0px_#000]">
            <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
              REMINDER INSTRUCTION *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.G. CHECK CABIN PROVISIONS AT 8 PM"
              className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] placeholder-[#888] focus:outline-none focus:bg-[#fffdf0] uppercase tracking-wider"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                TIME
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs uppercase font-black border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] transition cursor-pointer ${
                    priority === p
                      ? 'bg-[#ffe600] text-black'
                      : 'bg-white dark:bg-[#121312] text-[#555] dark:text-[#aaa] hover:bg-[#fffdf0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Alert Features Card */}
          <div className="p-3 bg-[#f7f4eb] dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#141514] dark:text-[#f4f3ef]">
                <Smartphone className="w-4 h-4 text-[#ff4d00] stroke-[2.5]" />
                <span>PHONE LOCK-SCREEN ALERT</span>
              </div>
              <span className="text-[10px] font-black bg-emerald-400 text-black px-1.5 py-0.5 border border-black uppercase">
                ENABLED
              </span>
            </div>
            <p className="text-[10px] font-bold text-[#666] dark:text-[#aaa] leading-snug">
              When due, this reminder will vibrate your phone, play an alert sound, and display a lock-screen push notification.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black dark:border-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs uppercase tracking-wider font-black text-[#141514] dark:text-[#f4f3ef] bg-white dark:bg-[#202020] hover:bg-[#fffdf0] transition cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#00c8e0] text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'SCHEDULING...' : 'DISPATCH ALERT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
