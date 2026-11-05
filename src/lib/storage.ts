import fs from 'fs';
import path from 'path';
import { Task, Reminder, Memory, Habit, UserProfile, ChatMessage } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface DatabaseSchema {
  tasks: Task[];
  reminders: Reminder[];
  memories: Memory[];
  habits: Habit[];
  profile: UserProfile;
  chatHistory: ChatMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lifeos_db.json');

// Get dynamic date strings based on current date
function getRelativeDate(daysOffset: number = 0, hour: number = 10, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getTodayDateString(daysOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const defaultInitialData: DatabaseSchema = {
  profile: {
    name: 'Nayan',
    greetingTitle: 'Productivity Architect',
    email: 'nayan@lifeos.app',
    dailyTaskGoal: 6,
    focusGoalMinutes: 120,
    aiTone: 'friendly',
    theme: 'dark',
    aiModel: 'gpt-4o-mini',
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Complete React assignment & architecture test',
      description: 'Finish the full-stack state management, unit tests, and dashboard polish.',
      status: 'pending',
      priority: 'high',
      category: 'Study',
      dueDate: getTodayDateString(0),
      dueTime: '10:00 AM',
      recurrence: 'none',
      subtasks: [
        { id: 'sub-1', title: 'Implement AI chat function calling', completed: true },
        { id: 'sub-2', title: 'Design dark glassmorphism dashboard', completed: true },
        { id: 'sub-3', title: 'Write unit tests for task manager', completed: false },
      ],
      tags: ['React', 'University', 'Priority'],
      estimatedMinutes: 60,
      createdAt: getRelativeDate(-1),
      updatedAt: getRelativeDate(0),
    },
    {
      id: 'task-2',
      title: 'Schedule quarterly team sync for Friday',
      description: 'Review upcoming roadmap deliverables, cloud infrastructure, and AI features.',
      status: 'pending',
      priority: 'medium',
      category: 'Work',
      dueDate: getTodayDateString(2),
      dueTime: '02:00 PM',
      recurrence: 'weekly',
      subtasks: [
        { id: 'sub-4', title: 'Draft agenda slide deck', completed: true },
        { id: 'sub-5', title: 'Send calendar invite', completed: false },
      ],
      tags: ['Planning', 'Meetings'],
      estimatedMinutes: 45,
      createdAt: getRelativeDate(-2),
      updatedAt: getRelativeDate(-1),
    },
    {
      id: 'task-3',
      title: 'Review investment portfolio & monthly expenses',
      description: 'Check automated ETF allocations, subscription renewals, and balance ledger.',
      status: 'completed',
      priority: 'low',
      category: 'Finance',
      dueDate: getTodayDateString(-1),
      dueTime: '06:00 PM',
      recurrence: 'monthly',
      subtasks: [],
      tags: ['Budget', 'Finance'],
      estimatedMinutes: 30,
      createdAt: getRelativeDate(-3),
      updatedAt: getRelativeDate(-1),
      completedAt: getRelativeDate(-1),
    },
    {
      id: 'task-4',
      title: '30-minute cardio & stretching routine',
      description: 'Interval running on treadmill followed by spine mobility workout.',
      status: 'pending',
      priority: 'medium',
      category: 'Health',
      dueDate: getTodayDateString(0),
      dueTime: '06:30 PM',
      recurrence: 'daily',
      subtasks: [],
      tags: ['Fitness', 'Cardio'],
      estimatedMinutes: 30,
      createdAt: getRelativeDate(-1),
      updatedAt: getRelativeDate(0),
    },
    {
      id: 'task-5',
      title: 'Brainstorm creative features for LifeOS 2.0',
      description: 'Explore multi-agent workflows, voice wake word triggers, and smart ambient music.',
      status: 'pending',
      priority: 'high',
      category: 'Creative',
      dueDate: getTodayDateString(1),
      dueTime: '04:00 PM',
      recurrence: 'none',
      subtasks: [],
      tags: ['LifeOS', 'AI'],
      estimatedMinutes: 50,
      createdAt: getRelativeDate(0),
      updatedAt: getRelativeDate(0),
    },
  ],
  reminders: [
    {
      id: 'rem-1',
      title: 'Call friend Alex to catch up',
      dateTime: getRelativeDate(0, 20, 0), // Today at 8:00 PM
      priority: 'medium',
      isCompleted: false,
      createdAt: getRelativeDate(-1),
    },
    {
      id: 'rem-2',
      title: 'Submit assignment deliverables to portal',
      dateTime: getRelativeDate(1, 10, 0), // Tomorrow at 10:00 AM
      priority: 'high',
      isCompleted: false,
      createdAt: getRelativeDate(0),
    },
    {
      id: 'rem-3',
      title: 'Hydration break & 5-minute eye rest',
      dateTime: getRelativeDate(0, 14, 0),
      priority: 'low',
      isCompleted: false,
      createdAt: getRelativeDate(0),
    },
  ],
  memories: [
    {
      id: 'mem-1',
      key: 'study_habit',
      content: 'Prefers deep work and study sessions in 60-90 minute morning blocks.',
      category: 'preference',
      createdAt: getRelativeDate(-5),
    },
    {
      id: 'mem-2',
      key: 'current_focus',
      content: 'Currently learning React 19, TypeScript, and modern AI Agent architectures.',
      category: 'fact',
      createdAt: getRelativeDate(-3),
    },
    {
      id: 'mem-3',
      key: 'friend_name',
      content: 'Close friend is Alex; usually catches up during evening hours.',
      category: 'fact',
      createdAt: getRelativeDate(-2),
    },
  ],
  habits: [
    {
      id: 'hab-1',
      name: 'Hydration (2.5L Water)',
      category: 'Health',
      icon: 'Droplet',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [getTodayDateString(-2), getTodayDateString(-1), getTodayDateString(0)],
      streak: 5,
      color: '#06b6d4',
    },
    {
      id: 'hab-2',
      name: 'Deep Work Session (90 min)',
      category: 'Productivity',
      icon: 'Brain',
      targetDays: [1, 2, 3, 4, 5],
      completedDates: [getTodayDateString(-1), getTodayDateString(0)],
      streak: 4,
      color: '#8b5cf6',
    },
    {
      id: 'hab-3',
      name: 'Read 20 pages of Book',
      category: 'Learning',
      icon: 'BookOpen',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [getTodayDateString(-1)],
      streak: 3,
      color: '#10b981',
    },
    {
      id: 'hab-4',
      name: 'Posture & Mobility Stretch',
      category: 'Health',
      icon: 'Activity',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      completedDates: [getTodayDateString(0)],
      streak: 2,
      color: '#f59e0b',
    },
  ],
  chatHistory: [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Good day! I am **LifeOS Copilot**, your personal intelligence assistant. I am connected directly to your tasks, deadlines, and schedule. You can ask me to plan your day, schedule reminders, reschedule tasks, or generate customized study plans. What would you like to achieve today?',
      timestamp: getRelativeDate(0, 8, 30),
    },
  ],
};

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultInitialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring LifeOS database file:', err);
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading DB file, returning defaults:', err);
    return defaultInitialData;
  }
}

export function writeDatabase(data: DatabaseSchema): boolean {
  ensureDataFile();
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed writing DB file:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (innerErr) {
      console.error('Direct DB write failed:', innerErr);
      return false;
    }
  }
}

// ------------------- TASK REPOSITORY -------------------

export async function getTasks(): Promise<Task[]> {
  const db = readDatabase();
  return db.tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = readDatabase();
  return db.tasks.find(t => t.id === id) || null;
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Task> {
  const db = readDatabase();
  const newTask: Task = {
    ...taskData,
    id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    category: taskData.category || 'Work',
    recurrence: taskData.recurrence || 'none',
    subtasks: taskData.subtasks || [],
    tags: taskData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);
  writeDatabase(db);

  // Sync to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    supabase.from('lifeos_tasks').insert({
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.dueDate,
      due_time: newTask.dueTime,
      recurrence: newTask.recurrence,
      subtasks: newTask.subtasks,
      tags: newTask.tags,
      estimated_minutes: newTask.estimatedMinutes,
      created_at: newTask.createdAt,
      updated_at: newTask.updatedAt,
    }).then(({ error }) => {
      if (error) console.error('Supabase sync error on task create:', error);
    });
  }

  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const db = readDatabase();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  const existing = db.tasks[index];
  const isBeingCompleted = updates.status === 'completed' && existing.status !== 'completed';
  const isBeingUncompleted = updates.status && updates.status !== 'completed' && existing.status === 'completed';

  const updatedTask: Task = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    completedAt: isBeingCompleted ? new Date().toISOString() : (isBeingUncompleted ? undefined : existing.completedAt),
  };

  db.tasks[index] = updatedTask;
  writeDatabase(db);

  if (isSupabaseConfigured() && supabase) {
    supabase.from('lifeos_tasks').update({
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      category: updatedTask.category,
      due_date: updatedTask.dueDate,
      due_time: updatedTask.dueTime,
      recurrence: updatedTask.recurrence,
      subtasks: updatedTask.subtasks,
      tags: updatedTask.tags,
      estimated_minutes: updatedTask.estimatedMinutes,
      updated_at: updatedTask.updatedAt,
      completed_at: updatedTask.completedAt,
    }).eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase sync error on task update:', error);
    });
  }

  return updatedTask;
}

export async function deleteTask(id: string): Promise<boolean> {
  const db = readDatabase();
  const initialLen = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== id);
  if (db.tasks.length === initialLen) return false;

  writeDatabase(db);

  if (isSupabaseConfigured() && supabase) {
    supabase.from('lifeos_tasks').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase sync error on task delete:', error);
    });
  }

  return true;
}

// ------------------- REMINDER REPOSITORY -------------------

export async function getReminders(): Promise<Reminder[]> {
  const db = readDatabase();
  return db.reminders.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

export async function createReminder(reminderData: Omit<Reminder, 'id' | 'createdAt'> & { id?: string }): Promise<Reminder> {
  const db = readDatabase();
  const newReminder: Reminder = {
    ...reminderData,
    id: reminderData.id || `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isCompleted: reminderData.isCompleted ?? false,
    priority: reminderData.priority || 'medium',
    createdAt: new Date().toISOString(),
  };

  db.reminders.push(newReminder);
  writeDatabase(db);

  if (isSupabaseConfigured() && supabase) {
    supabase.from('lifeos_reminders').insert({
      id: newReminder.id,
      title: newReminder.title,
      date_time: newReminder.dateTime,
      priority: newReminder.priority,
      is_completed: newReminder.isCompleted,
      task_id: newReminder.taskId,
      created_at: newReminder.createdAt,
    }).then(({ error }) => {
      if (error) console.error('Supabase sync error on reminder create:', error);
    });
  }

  return newReminder;
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | null> {
  const db = readDatabase();
  const index = db.reminders.findIndex(r => r.id === id);
  if (index === -1) return null;

  db.reminders[index] = { ...db.reminders[index], ...updates };
  writeDatabase(db);
  return db.reminders[index];
}

export async function deleteReminder(id: string): Promise<boolean> {
  const db = readDatabase();
  const initialLen = db.reminders.length;
  db.reminders = db.reminders.filter(r => r.id !== id);
  if (db.reminders.length === initialLen) return false;

  writeDatabase(db);
  return true;
}

// ------------------- MEMORY REPOSITORY -------------------

export async function getMemories(): Promise<Memory[]> {
  const db = readDatabase();
  return db.memories;
}

export async function createMemory(key: string, content: string, category: Memory['category'] = 'fact'): Promise<Memory> {
  const db = readDatabase();
  // Check if key already exists, update if so
  const existingIndex = db.memories.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  if (existingIndex >= 0) {
    db.memories[existingIndex].content = content;
    db.memories[existingIndex].category = category;
    writeDatabase(db);
    return db.memories[existingIndex];
  }

  const newMem: Memory = {
    id: `mem-${Date.now()}`,
    key,
    content,
    category,
    createdAt: new Date().toISOString(),
  };
  db.memories.push(newMem);
  writeDatabase(db);
  return newMem;
}

export async function deleteMemory(id: string): Promise<boolean> {
  const db = readDatabase();
  const initialLen = db.memories.length;
  db.memories = db.memories.filter(m => m.id !== id);
  if (db.memories.length === initialLen) return false;
  writeDatabase(db);
  return true;
}

// ------------------- HABITS REPOSITORY -------------------

export async function getHabits(): Promise<Habit[]> {
  const db = readDatabase();
  return db.habits;
}

export async function toggleHabitDay(habitId: string, dateStr: string): Promise<Habit | null> {
  const db = readDatabase();
  const habit = db.habits.find(h => h.id === habitId);
  if (!habit) return null;

  if (habit.completedDates.includes(dateStr)) {
    habit.completedDates = habit.completedDates.filter(d => d !== dateStr);
    habit.streak = Math.max(0, habit.streak - 1);
  } else {
    habit.completedDates.push(dateStr);
    habit.streak += 1;
  }

  writeDatabase(db);
  return habit;
}

// ------------------- PROFILE & CHAT REPOSITORY -------------------

export async function getUserProfile(): Promise<UserProfile> {
  const db = readDatabase();
  return db.profile || defaultInitialData.profile;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const db = readDatabase();
  db.profile = { ...db.profile, ...updates };
  writeDatabase(db);
  return db.profile;
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const db = readDatabase();
  return db.chatHistory || [];
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const db = readDatabase();
  if (!db.chatHistory) db.chatHistory = [];
  db.chatHistory.push(msg);
  // Keep last 100 messages to prevent unbounded size
  if (db.chatHistory.length > 100) {
    db.chatHistory = db.chatHistory.slice(-100);
  }
  writeDatabase(db);
}
