import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'No date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function getRelativeTimeString(dateString: string, currentTimestamp?: number): string {
  try {
    const target = new Date(dateString).getTime();
    if (isNaN(target)) return dateString;
    
    // In SSR prerender, avoid reading dynamic clock to prevent Next.js 16 prerender errors
    const now = currentTimestamp ?? (typeof window !== 'undefined' ? Date.now() : target);
    const diff = target - now;

    const diffMinutes = Math.round(diff / (1000 * 60));
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      if (Math.abs(diffHours) < 1) return `${Math.abs(diffMinutes)}m overdue`;
      if (Math.abs(diffDays) < 1) return `${Math.abs(diffHours)}h overdue`;
      return `${Math.abs(diffDays)}d overdue`;
    }

    if (diffMinutes < 60) return `in ${diffMinutes}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  } catch {
    return dateString;
  }
}
