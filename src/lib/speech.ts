/**
 * Trailhead Cartoon Mascot Speech & Audio Synthesizer
 * Powers spoken welcomes, vocal tips, and real-time lip sync for "Pipo" the mascot.
 */

import { sound } from './sound';

const MUTE_STORAGE_KEY = 'trailhead_mascot_muted';

export function isMascotAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(MUTE_STORAGE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export function setMascotAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
    if (muted) {
      cancelMascotSpeech();
    }
  } catch {}
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let simulatedTimeout: NodeJS.Timeout | null = null;

export function cancelMascotSpeech(): void {
  if (typeof window === 'undefined') return;
  if (simulatedTimeout) {
    clearTimeout(simulatedTimeout);
    simulatedTimeout = null;
  }
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}
  activeUtterance = null;
}

export function speakMascot(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  options?: { pitch?: number; rate?: number }
): void {
  if (typeof window === 'undefined') return;

  cancelMascotSpeech();

  const muted = isMascotAudioMuted();

  // If muted or speechSynthesis is unsupported, run visual speech simulation
  if (muted || !('speechSynthesis' in window)) {
    onStart?.();
    const duration = Math.min(Math.max(text.length * 55, 1800), 5000);
    simulatedTimeout = setTimeout(() => {
      onEnd?.();
      simulatedTimeout = null;
    }, duration);
    return;
  }

  try {
    const synth = window.speechSynthesis;
    // Resume synth if locked in background
    if (synth.paused) synth.resume();

    // Clean text of markdown formatting for natural vocalization
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#_~]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // remove raw emojis for clear speech

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtterance = utterance;

    // Cheerful, expressive cartoon mascot pitch & cadence
    utterance.pitch = options?.pitch ?? 1.25;
    utterance.rate = options?.rate ?? 1.05;

    // Pick best available voice
    const voices = synth.getVoices?.() || [];
    const bestVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Samantha') || 
        v.name.includes('Google US English') ||
        v.name.includes('Jenny') ||
        v.name.includes('Natural') ||
        v.name.includes('Zira') ||
        v.name.includes('Alex')
      )
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      sound.playMascotChirp();
      onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      onEnd?.();
    };

    synth.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis fallback:', err);
    onStart?.();
    simulatedTimeout = setTimeout(() => {
      onEnd?.();
      simulatedTimeout = null;
    }, 2000);
  }
}
