'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar as CalendarIcon, 
  Repeat, 
  List, 
  Kanban, 
  CalendarDays,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Task, Priority, Category, TaskStatus, Subtask } from '@/types';
import { formatDate, formatTime, getRelativeTimeString } from '@/lib/utils';
import { sound } from '@/lib/sound';

interface TaskManagerViewProps {
  tasks: Task[];
  onOpenNewTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onToggleTaskComplete: (task: Task) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Meeting', 'Creative', 'Other'];

export default function TaskManagerView({
  tasks,
  onOpenNewTask,
  onOpenEditTask,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
}: TaskManagerViewProps) {
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'newest'>('dueDate');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<{ offset: number; dateKey: string; label: string }[]>([]);

  React.useEffect(() => {
    const list = [-1, 0, 1, 2].map(offset => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const dateKey = d.toISOString().split('T')[0];
      const label =
        offset === -1 ? 'Yesterday' : offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : formatDate(dateKey);
      return { offset, dateKey, label };
    });
    setCalendarDays(list);
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTaskIds(next);
  };

  const handleCheckbox = async (task: Task) => {
    const willBeCompleted = task.status !== 'completed';
    if (willBeCompleted) {
      sound.playTaskComplete();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#3b82f6', '#10b981'],
        });
      } catch {}
    } else {
      sound.playClick();
    }
    await onToggleTaskComplete(task);
  };

  const handleToggleSubtask = async (task: Task, subId: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
    sound.playClick();
  };

  const handleDeleteConfirm = async (id: string) => {
    await onDeleteTask(id);
    setDeletingId(null);
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchTags = t.tags?.some(tag => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }
        // Status
        if (statusFilter === 'pending' && t.status === 'completed') return false;
        if (statusFilter === 'completed' && t.status !== 'completed') return false;
        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        // Category
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          const weight = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  // Kanban column buckets
  const kanbanColumns = useMemo(() => {
    return {
      todo: filteredTasks.filter(t => t.status === 'pending'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      completed: filteredTasks.filter(t => t.status === 'completed'),
    };
  }, [filteredTasks]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Smart Task Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize, prioritize, and conquer your goals with full scheduling and subtask checklists
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'list'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'calendar'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Calendar Schedule"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="newest">Sort by Newest</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Clear search filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {activeView === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl glass-panel border border-dashed border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No tasks found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                No items match your filter criteria. Try adjusting filters or create a new task.
              </p>
              <button
                onClick={onOpenNewTask}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                + Create New Task
              </button>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isDone = task.status === 'completed';
              const isExpanded = expandedTaskIds.has(task.id);
              const priorityColor =
                task.priority === 'high'
                  ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                  : task.priority === 'medium'
                  ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                  : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10';

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border transition-all ${
                    isDone
                      ? 'glass-panel bg-slate-950/30 border-slate-900/60 opacity-65'
                      : 'glass-panel bg-slate-900/80 border-slate-800/80 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleCheckbox(task)}
                        className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 hover:border-indigo-400 bg-slate-950'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-semibold tracking-tight ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${priorityColor}`}>
                            {task.priority}
                          </span>

                          {/* Category badge */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {task.category}
                          </span>

                          {/* Recurrence badge */}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              {task.recurrence}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <CalendarIcon className="w-3 h-3 text-indigo-400" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="flex items-center gap-1 text-indigo-300">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          )}
                          {task.estimatedMinutes && (
                            <span className="text-slate-400">
                              ~{task.estimatedMinutes}m focus
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-slate-500" />
                              {task.tags.map((tg, idx) => (
                                <span key={idx} className="text-slate-400">
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Subtasks toggle */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleExpand(task.id)}
                              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 ml-auto"
                            >
                              Checklist ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {deletingId === task.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/20 p-1 rounded-lg border border-rose-500/40">
                          <button
                            onClick={() => handleDeleteConfirm(task.id)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-500 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(task.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Subtasks Checklist */}
                  {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                    <div className="px-12 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pt-2">
                        Subtasks & Checklist
                      </div>
                      {task.subtasks.map(sub => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition"
                        >
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(task, sub.id)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className={sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {sub.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD VIEW */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: To Do */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-white">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300">
                {kanbanColumns.todo.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {kanbanColumns.todo.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                      {task.category}
                    </span>
                    <button
                      onClick={() => onUpdateTask(task.id, { status: 'in_progress' })}
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Start &rarr;
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-white">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300">
                {kanbanColumns.in_progress.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {kanbanColumns.in_progress.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-500/50 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {task.category}
                    </span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Complete &rarr;
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
                    <button
                      onClick={() => onUpdateTask(task.id, { status: 'pending' })}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      &larr; Back to To Do
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-white">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300">
                {kanbanColumns.completed.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {kanbanColumns.completed.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 opacity-70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-400">
                      {task.category}
                    </span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="text-[10px] text-slate-400 hover:text-indigo-300"
                    >
                      Reopen
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-400 line-through">{task.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CALENDAR GRID VIEW */}
      {activeView === 'calendar' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Upcoming Days Schedule</h3>
            <span className="text-xs text-slate-400">Grouped by Due Date</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calendarDays.map(({ offset, dateKey, label }) => {
              const dayTasks = tasks.filter(t => t.dueDate === dateKey);

              return (
                <div
                  key={offset}
                  className={`p-4 rounded-2xl border ${
                    offset === 0
                      ? 'bg-indigo-950/30 border-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className={`text-xs font-bold ${offset === 0 ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-500">{dayTasks.length} tasks</span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="text-[11px] text-slate-500 py-4 text-center">No tasks scheduled</div>
                    ) : (
                      dayTasks.map(t => (
                        <div
                          key={t.id}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                        >
                          <div className="font-medium truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{t.dueTime || t.priority}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
