'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isMascotAudioMuted, setMascotAudioMuted, cancelMascotSpeech } from '@/lib/speech';
import { sound } from '@/lib/sound';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, title?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (name?: string) => void;
  signOut: () => Promise<void>;
  mascotMuted: boolean;
  toggleMascotMute: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = 'trailhead_auth_user';
const LOCAL_STORAGE_USERS_KEY = 'trailhead_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mascotMuted, setMascotMutedState] = useState<boolean>(false);

  // Restore session & mascot audio preference on mount
  useEffect(() => {
    setMascotMutedState(isMascotAudioMuted());

    async function initAuth() {
      try {
        // 1. Check Supabase session if configured
        if (isSupabaseConfigured() && supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && !error) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || 'explorer@trailhead.os',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Explorer',
              title: session.user.user_metadata?.title || 'Field Commander',
              avatarUrl: session.user.user_metadata?.avatar_url,
              createdAt: session.user.created_at || new Date().toISOString(),
            };
            setUser(authUser);
            setIsLoading(false);
            return;
          }
        }

        // 2. Check local storage persistent session
        const stored = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const toggleMascotMute = useCallback(() => {
    setMascotMutedState(prev => {
      const next = !prev;
      setMascotAudioMuted(next);
      return next;
    });
  }, []);

  // Save session locally
  const persistUser = (authUser: AuthUser | null) => {
    setUser(authUser);
    if (authUser) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authUser));
      // Sync with profile name if available
      try {
        fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authUser.name, greetingTitle: authUser.title || 'Productivity Architect' }),
        }).catch(() => {});
      } catch {}
    } else {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. If Supabase configured, attempt real remote auth
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            title: data.user.user_metadata?.title || 'Productivity Architect',
            avatarUrl: data.user.user_metadata?.avatar_url,
            createdAt: data.user.created_at,
          };
          persistUser(authUser);
          sound.playMascotCheer();
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Local / Mock Auth Verification
      if (!email.includes('@')) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid expedition email address.' };
      }
      if (password.length < 4) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 4 characters.' };
      }

      // Check registered users in localStorage
      let usersDb: Record<string, { name: string; passwordHash: string; title?: string }> = {};
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (raw) usersDb = JSON.parse(raw);
      } catch {}

      const cleanEmail = email.toLowerCase().trim();
      const existing = usersDb[cleanEmail];

      if (existing && existing.passwordHash !== password) {
        setIsLoading(false);
        return { success: false, error: 'Invalid expedition password. Please try again.' };
      }

      const userName = existing?.name || (cleanEmail.startsWith('nayan') ? 'Nayan' : cleanEmail.split('@')[0]);
      const authUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        title: existing?.title || 'Productivity Architect',
        createdAt: new Date().toISOString(),
      };

      persistUser(authUser);
      sound.playMascotCheer();
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Authentication failed.' };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    title: string = 'Productivity Architect'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!name.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your explorer name.' };
      }
      if (!email.includes('@')) {
        setIsLoading(false);
        return { success: false, error: 'Please provide a valid email.' };
      }
      if (password.length < 4) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 4 characters.' };
      }

      // 1. Supabase auth if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, title },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name,
            title,
            createdAt: new Date().toISOString(),
          };
          persistUser(authUser);
          sound.playMascotCheer();
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Local Auth storage
      let usersDb: Record<string, { name: string; passwordHash: string; title?: string }> = {};
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (raw) usersDb = JSON.parse(raw);
      } catch {}

      const cleanEmail = email.toLowerCase().trim();
      usersDb[cleanEmail] = {
        name: name.trim(),
        passwordHash: password,
        title,
      };
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersDb));

      const authUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name.trim(),
        title,
        createdAt: new Date().toISOString(),
      };

      persistUser(authUser);
      sound.playMascotCheer();
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const loginAsGuest = (guestName: string = 'Nayan') => {
    const authUser: AuthUser = {
      id: `guest-${Date.now()}`,
      email: `${guestName.toLowerCase()}@trailhead.os`,
      name: guestName,
      title: 'Field Architect (Guest)',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    persistUser(authUser);
    sound.playMascotCheer();
  };

  const signOut = async () => {
    cancelMascotSpeech();
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    persistUser(null);
    sound.playClick();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        signUp,
        loginAsGuest,
        signOut,
        mascotMuted,
        toggleMascotMute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

