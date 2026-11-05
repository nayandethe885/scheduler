export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export type Category = 
  | 'Work' 
  | 'Personal' 
  | 'Study' 
  | 'Health' 
  | 'Finance' 
  | 'Meeting' 
  | 'Creative' 
  | 'Other';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: Category;
  dueDate?: string; // YYYY-MM-DD or ISO timestamp
  dueTime?: string; // e.g. "10:00 AM" or "14:30"
  recurrence: Recurrence;
  subtasks: Subtask[];
  tags: string[];
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // ISO string
  priority: Priority;
  isCompleted: boolean;
  snoozedUntil?: string;
  taskId?: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  key: string;
  content: string;
  category: 'preference' | 'fact' | 'schedule' | 'goal';
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  icon: string;
  targetDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  color: string;
}

export interface UserProfile {
  name: string;
  greetingTitle: string;
  email?: string;
  dailyTaskGoal: number;
  focusGoalMinutes: number;
  aiTone: 'concise' | 'friendly' | 'executive' | 'motivational';
  theme: 'dark' | 'light';
  openaiApiKey?: string;
  aiModel?: string;
  geminiApiKey?: string;
}

export interface ActionReceipt {
  type: 
    | 'create_task' 
    | 'update_task' 
    | 'delete_task' 
    | 'create_reminder' 
    | 'delete_reminder'
    | 'study_plan' 
    | 'reschedule' 
    | 'remember' 
    | 'confirmation_required';
  summary: string;
  success: boolean;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationPayload?: {
    action: 'delete_task' | 'delete_reminder' | 'clear_completed';
    targetId: string;
    targetTitle: string;
  };
  confirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  receipt?: ActionReceipt;
}

export interface DailySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityCount: number;
  completionRate: number;
  upcomingRemindersCount: number;
  focusMinutesToday: number;
}
