'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import DashboardView from '@/components/DashboardView';
import TaskManagerView from '@/components/TaskManagerView';
import AIChatView from '@/components/AIChatView';
import AIChatWidget from '@/components/AIChatWidget';
import FocusTimerView from '@/components/FocusTimerView';
import HabitsView from '@/components/HabitsView';
import TaskModal from '@/components/TaskModal';
import ReminderModal from '@/components/ReminderModal';
import SettingsModal from '@/components/SettingsModal';
import AestheticSpotlight from '@/components/AestheticSpotlight';
import AuthView from '@/components/AuthView';
import CartoonMascot from '@/components/CartoonMascot';
import PhoneReminderTriggerBanner from '@/components/PhoneReminderTriggerBanner';
import { 
  registerServiceWorker, 
  sendPhoneNotification, 
  getNotifiedReminderIds, 
  markReminderAsNotified 
} from '@/lib/phoneReminders';
import { speakMascot } from '@/lib/speech';
import { Task, Reminder, Habit, UserProfile, ChatMessage } from '@/types';
import { sound } from '@/lib/sound';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function LifeOSApp() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayStr, setTodayStr] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Nayan',
    greetingTitle: 'Productivity Architect',
    dailyTaskGoal: 5,
    focusGoalMinutes: 120,
    aiTone: 'friendly',
    theme: 'dark',
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Modals & Drawers state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQuickAIOpen, setIsQuickAIOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [activePhoneAlert, setActivePhoneAlert] = useState<Reminder | null>(null);

  // Register service worker for background phone push & reminders
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Initialize today date client-side and restore sidebar state
  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    try {
      const saved = localStorage.getItem('lifeos_sidebar_open');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      }
    } catch {}
  }, []);

  // Sync profile when authenticated user is loaded
  useEffect(() => {
    if (user?.name) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        greetingTitle: user.title || prev.greetingTitle,
      }));
    }
  }, [user]);

  // Universal sidebar toggle for desktop & mobile
  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarOpen(prev => {
        const next = !prev;
        try {
          localStorage.setItem('lifeos_sidebar_open', String(next));
        } catch {}
        return next;
      });
    }
  }, []);

  // Keyboard shortcut Ctrl+\ or Cmd+\ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSidebar]);

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    try {
      const [tasksRes, remsRes, habitsRes, profileRes, chatRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json()),
        fetch('/api/habits').then(r => r.json()),
        fetch('/api/profile').then(r => r.json()),
        fetch('/api/ai/chat').then(r => r.json()),
      ]);

      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (remsRes.success) setReminders(remsRes.reminders);
      if (habitsRes.success) setHabits(habitsRes.habits);
      if (profileRes.success) setProfile(profileRes.profile);
      if (chatRes.success) setChatMessages(chatRes.messages);
    } catch (err) {
      console.error('Failed to load initial LifeOS data:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [loadInitialData, isAuthenticated]);

  // Refresh tasks and reminders
  const refreshTasks = async () => {
    try {
      const res = await fetch('/api/tasks').then(r => r.json());
      if (res.success) setTasks(res.tasks);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  const refreshReminders = async () => {
    try {
      const res = await fetch('/api/reminders').then(r => r.json());
      if (res.success) setReminders(res.reminders);
    } catch (err) {
      console.error('Error refreshing reminders:', err);
    }
  };

  // Completion calculation
  const todayTasks = useMemo(() => {
    if (!todayStr) return tasks;
    return tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && t.status !== 'completed'));
  }, [tasks, todayStr]);

  const completedToday = useMemo(() => {
    return todayTasks.filter(t => t.status === 'completed');
  }, [todayTasks]);

  const completionRate = todayTasks.length > 0 
    ? Math.round((completedToday.length / todayTasks.length) * 100) 
    : tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const upcomingRemindersCount = reminders.filter(r => !r.isCompleted).length;

  // Task Operations
  const handleToggleTaskComplete = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => (t.id === task.id ? data.task : t)));
      }
    } catch (err) {
      console.error('Failed toggling task status:', err);
      refreshTasks();
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (data.success) {
          setTasks(prev => prev.map(t => (t.id === editingTask.id ? data.task : t)));
          sound.playClick();
        }
      } else {
        // Create new
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (data.success) {
          setTasks(prev => [data.task, ...prev]);
          sound.playNotification();
        }
      }
    } catch (err) {
      console.error('Failed saving task:', err);
      throw err;
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => (t.id === id ? data.task : t)));
      }
    } catch (err) {
      console.error('Failed updating task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        sound.playClick();
      }
    } catch (err) {
      console.error('Failed deleting task:', err);
    }
  };

  // Reminder Operations
  const handleSaveReminder = async (remData: Omit<Reminder, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remData),
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => [...prev, data.reminder]);
        sound.playNotification();
      }
    } catch (err) {
      console.error('Failed saving reminder:', err);
      throw err;
    }
  };

  const handleToggleReminderComplete = async (reminder: Reminder) => {
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !reminder.isCompleted }),
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => (r.id === reminder.id ? data.reminder : r)));
        sound.playClick();
      }
    } catch (err) {
      console.error('Failed toggling reminder:', err);
    }
  };

  // Real-time phone reminder check loop
  useEffect(() => {
    if (!isAuthenticated || reminders.length === 0) return;

    const checkDueReminders = () => {
      const now = Date.now();
      const notifiedIds = getNotifiedReminderIds();

      reminders.forEach(rem => {
        if (rem.isCompleted) return;
        const dueTime = new Date(rem.dateTime).getTime();
        const diffSeconds = (dueTime - now) / 1000;

        // Trigger if due in upcoming 20 seconds or overdue within 3 minutes
        if (diffSeconds <= 20 && diffSeconds >= -180 && !notifiedIds.includes(rem.id)) {
          markReminderAsNotified(rem.id);

          // 1. Phone Lock-screen Push + Vibration + Sound
          sendPhoneNotification({
            title: `🚨 TRAILHEAD ALERT: ${rem.title}`,
            body: `Expedition reminder due! Tap to view details.`,
            tag: `reminder-${rem.id}`,
          });

          // 2. Vocalize with Pipo the mascot
          speakMascot(`Explorer Alert! Your reminder: ${rem.title} is due right now!`);

          // 3. Show in-app banner modal
          setActivePhoneAlert(rem);
        }
      });
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 12000);
    return () => clearInterval(interval);
  }, [reminders, isAuthenticated]);

  const handleSnoozeReminder = async (rem: Reminder, minutes: number) => {
    try {
      const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const res = await fetch(`/api/reminders/${rem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime: newTime }),
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => (r.id === rem.id ? data.reminder : r)));
        setActivePhoneAlert(null);
        sound.playClick();
        speakMascot(`Snoozed for ${minutes} minutes!`);
      }
    } catch (err) {
      console.error('Failed snoozing reminder:', err);
    }
  };

  const handleDismissPhoneAlert = async (rem: Reminder) => {
    await handleToggleReminderComplete(rem);
    setActivePhoneAlert(null);
  };

  // Habit Operations
  const handleToggleHabitDay = async (habitId: string, dateStr: string) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', habitId, date: dateStr }),
      });
      const data = await res.json();
      if (data.success) {
        setHabits(prev => prev.map(h => (h.id === habitId ? data.habit : h)));
      }
    } catch (err) {
      console.error('Failed toggling habit:', err);
    }
  };

  // Profile Operations
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (updates.theme && updates.theme !== theme) {
        setTheme(updates.theme);
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed updating profile:', err);
      throw err;
    }
  };

  // AI Chat Operations
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setChatMessages(prev => [...prev, data.message]);
        sound.playNotification();

        if (data.message.receipt) {
          await Promise.all([refreshTasks(), refreshReminders()]);
        }
      }
    } catch (err) {
      console.error('Error sending message to AI:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error communicating with the LifeOS engine. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleConfirmAction = async (action: string, targetId: string) => {
    try {
      const res = await fetch('/api/ai/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setChatMessages(prev => [...prev, data.message]);
        sound.playClick();
        await Promise.all([refreshTasks(), refreshReminders()]);
      }
    } catch (err) {
      console.error('Error executing confirmed action:', err);
    }
  };

  const handleSendQuickAIChat = (promptText: string) => {
    setActiveTab('ai');
    handleSendMessage(promptText);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center aesthetic-bg font-mono p-4 text-center select-none">
        <div className="w-12 h-12 border-4 border-black dark:border-white border-t-[#ff4d00] animate-spin mb-4 shadow-[4px_4px_0px_#000]" />
        <div className="text-sm font-extrabold uppercase tracking-widest text-[#141514] dark:text-[#f4f3ef]">
          INITIALIZING BASE STATION TELEMETRY...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onSuccess={loadInitialData} />;
  }

  return (
    <div className="min-h-screen flex flex-col aesthetic-bg text-[#141514] dark:text-[#f4f3ef] transition-colors duration-200 relative">
      {/* Global Interactive GSAP Mouse Spotlight */}
      <AestheticSpotlight />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          pendingTasksCount={pendingTasksCount}
          upcomingRemindersCount={upcomingRemindersCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            profile={profile}
            activeTab={activeTab}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onOpenNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenNewReminder={() => setIsReminderModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
            onOpenQuickAI={() => setIsQuickAIOpen(true)}
            onSelectTab={setActiveTab}
            completionRate={completionRate}
          />

          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView
                    tasks={tasks}
                    reminders={reminders}
                    profile={profile}
                    onToggleTaskComplete={handleToggleTaskComplete}
                    onDeleteTask={handleDeleteTask}
                    onOpenNewTask={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    onOpenNewReminder={() => setIsReminderModalOpen(true)}
                    onSelectTab={setActiveTab}
                    onSendQuickAIChat={handleSendQuickAIChat}
                    onToggleReminderComplete={handleToggleReminderComplete}
                    completionRate={completionRate}
                  />
                )}

                {activeTab === 'tasks' && (
                  <TaskManagerView
                    tasks={tasks}
                    onOpenNewTask={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    onOpenEditTask={task => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    onToggleTaskComplete={handleToggleTaskComplete}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                )}

                {activeTab === 'calendar' && (
                  <TaskManagerView
                    tasks={tasks}
                    onOpenNewTask={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    onOpenEditTask={task => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    onToggleTaskComplete={handleToggleTaskComplete}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                )}

                {activeTab === 'habits' && (
                  <HabitsView
                    habits={habits}
                    onToggleHabitDay={handleToggleHabitDay}
                  />
                )}

                {activeTab === 'focus' && (
                  <FocusTimerView
                    tasks={tasks}
                    onCompleteTask={handleToggleTaskComplete}
                  />
                )}

                {activeTab === 'ai' && (
                  <div className="max-w-4xl mx-auto">
                    <AIChatView
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      onConfirmAction={handleConfirmAction}
                      isThinking={isThinking}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Floating Copilot Widget (Accessible from all tabs) */}
      {activeTab !== 'ai' && (
        <AIChatWidget
          isOpen={isQuickAIOpen}
          onToggle={() => setIsQuickAIOpen(!isQuickAIOpen)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onConfirmAction={handleConfirmAction}
          isThinking={isThinking}
        />
      )}

      {/* Floating Interactive Cartoon Companion (Pipo) across whole portal */}
      <div className="fixed bottom-20 left-3 sm:bottom-6 sm:left-8 z-40">
        <CartoonMascot
          mode="portal"
          activeTab={activeTab}
          userName={user?.name || profile.name}
        />
      </div>

      {/* Real-time Phone Reminder Alert Banner */}
      <PhoneReminderTriggerBanner
        activeAlert={activePhoneAlert}
        onDismiss={handleDismissPhoneAlert}
        onSnooze={handleSnoozeReminder}
      />

      {/* Mobile Bottom Navigation (Smartphones & Tablets) */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
