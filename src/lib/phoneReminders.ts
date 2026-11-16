/**
 * Trailhead Phone Reminders & Push Notification Subsystem
 * Enables real-time phone lock-screen notifications, vibration, audio chimes,
 * and direct sync with Apple Calendar (iOS) and Google Calendar (Android).
 */

import { sound } from './sound';
import { speakMascot } from './speech';

const NOTIFIED_CACHE_KEY = 'trailhead_notified_reminders';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isVibrationSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sound.playNotification();
      if (isVibrationSupported()) {
        navigator.vibrate([150, 80, 150]);
      }
    }
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

export interface PhoneNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  silent?: boolean;
}

export async function sendPhoneNotification(options: PhoneNotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Vibrate device hardware (works on mobile Android & supported mobile browsers)
  if (isVibrationSupported() && !options.silent) {
    try {
      navigator.vibrate([300, 150, 300, 150, 300]);
    } catch {}
  }

  // 2. Play audible procedural chime
  if (!options.silent) {
    sound.playNotification();
  }

  // 3. System Push / Lock-screen notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const swReg = await navigator.serviceWorker?.getRegistration();
      if (swReg && 'showNotification' in swReg) {
        await (swReg as any).showNotification(options.title, {
          body: options.body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [300, 150, 300],
          tag: options.tag || `trailhead-${Date.now()}`,
          renotify: true,
          data: { url: options.url || '/' },
        });
        return true;
      } else {
        new Notification(options.title, {
          body: options.body,
          icon: '/icon.svg',
          tag: options.tag,
        });
        return true;
      }
    } catch (err) {
      console.warn('Failed to fire native system notification:', err);
    }
  }

  return false;
}

export async function sendTestPhoneNotification(): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  const success = await sendPhoneNotification({
    title: '🚨 TRAILHEAD PHONE ALERT TEST',
    body: 'Telemetry confirmed! Phone lock-screen notifications and vibrations are active.',
    tag: 'trailhead-test-alert',
  });

  speakMascot("Beep-boop! Phone alert test dispatched to your device!");
  return success;
}

// ------------------- NATIVE PHONE CALENDAR SYNC -------------------

/**
 * Format ISO date string into Google Calendar UTC format: YYYYMMDDTHHmmSSZ
 */
function toCalendarUtc(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

/**
 * Generate direct Google Calendar link (instantly sets an alert on Android / iPhone)
 */
export function createGoogleCalendarUrl(title: string, isoDateTime: string, description?: string): string {
  const start = new Date(isoDateTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 mins duration

  const startUtc = toCalendarUtc(start);
  const endUtc = toCalendarUtc(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[Trailhead] ${title}`,
    dates: `${startUtc}/${endUtc}`,
    details: description || `Expedition Reminder created in Trailhead OS.\nBase Station: Denver, CO.`,
    location: 'Trailhead Base Station',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Download an .ics iCalendar file (iPhone opens directly in Apple Calendar with alarm)
 */
export function downloadIcsFile(title: string, isoDateTime: string, description?: string): void {
  const start = new Date(isoDateTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const startUtc = toCalendarUtc(start);
  const endUtc = toCalendarUtc(end);
  const nowUtc = toCalendarUtc(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Trailhead Supply Co//Trailhead OS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:trailhead-${Date.now()}@trailhead.os`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:[Trailhead Alert] ${title}`,
    `DESCRIPTION:${description || 'Expedition reminder from Trailhead Base Station.'}`,
    'LOCATION:Trailhead Base Station',
    'STATUS:CONFIRMED',
    // Set 0-minute and 15-minute phone alarms:
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Upcoming Expedition Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ------------------- CACHE / DEDUPLICATION -------------------

export function getNotifiedReminderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(NOTIFIED_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markReminderAsNotified(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getNotifiedReminderIds();
    if (!ids.includes(id)) {
      ids.push(id);
      sessionStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(ids));
    }
  } catch {}
}
