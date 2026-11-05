-- LifeOS Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor if you are connecting to Supabase

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS lifeos_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL DEFAULT 'Work' CHECK (category IN ('Work', 'Personal', 'Study', 'Health', 'Finance', 'Meeting', 'Creative', 'Other')),
  due_date DATE,
  due_time TEXT,
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'weekdays', 'monthly')),
  subtasks JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2. Reminders Table
CREATE TABLE IF NOT EXISTS lifeos_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  snoozed_until TIMESTAMPTZ,
  task_id UUID REFERENCES lifeos_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Memories Table (AI Memory)
CREATE TABLE IF NOT EXISTS lifeos_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fact' CHECK (category IN ('preference', 'fact', 'schedule', 'goal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habits Table
CREATE TABLE IF NOT EXISTS lifeos_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Health',
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  completed_dates DATE[] DEFAULT ARRAY[]::DATE[],
  streak INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Profile Table
CREATE TABLE IF NOT EXISTS lifeos_profiles (
  id TEXT PRIMARY KEY DEFAULT 'default_user',
  name TEXT NOT NULL DEFAULT 'Alex',
  greeting_title TEXT NOT NULL DEFAULT 'Chief Executive',
  email TEXT,
  daily_task_goal INTEGER DEFAULT 5,
  focus_goal_minutes INTEGER DEFAULT 120,
  ai_tone TEXT DEFAULT 'friendly' CHECK (ai_tone IN ('concise', 'friendly', 'executive', 'motivational')),
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON lifeos_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON lifeos_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_datetime ON lifeos_reminders(date_time);
