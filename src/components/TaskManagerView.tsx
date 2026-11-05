'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Search, 
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
  CheckCircle2,
} from 'lucide-react';
import { Task, Priority, Category, Subtask } from '@/types';
import { formatDate } from '@/lib/utils';
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
          colors: ['#4f46e5', '#3b82f6', '#10b981'],
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
  };

  const handleDeleteConfirm = async (id: string) => {
    await onDeleteTask(id);
    setDeletingId(null);
  };

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(t => (statusFilter === 'completed' ? t.status === 'completed' : t.status !== 'completed'));
    }

    if (priorityFilter !== 'all') {
      list = list.filter(t => t.priority === priorityFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter(t => t.category === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'newest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return 0;
    });

    return list;
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-150">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Tasks</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize, and manage your tasks with checklists and deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeView === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Calendar Schedule"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-150">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tags..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-950 transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
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
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
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
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="newest">Sort by Newest</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {activeView === 'list' && (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No tasks found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                No items match your filter criteria. Try adjusting filters or create a new task.
              </p>
              <button
                onClick={onOpenNewTask}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
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
                  ? 'border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                  : task.priority === 'medium'
                  ? 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40';

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/60 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/40 opacity-65'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleCheckbox(task)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 bg-white dark:bg-slate-950'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-semibold tracking-tight ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${priorityColor}`}>
                            {task.priority}
                          </span>

                          {/* Category badge */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {task.category}
                          </span>

                          {/* Recurrence badge */}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              {task.recurrence}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.dueTime}
                            </span>
                          )}
                          {task.estimatedMinutes && (
                            <span className="text-slate-500 dark:text-slate-400">
                              ~{task.estimatedMinutes}m focus
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {task.tags.map((tg, idx) => (
                                <span key={idx} className="text-slate-500 dark:text-slate-400">
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Subtasks toggle */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleExpand(task.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 ml-auto"
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {deletingId === task.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-lg border border-rose-200 dark:border-rose-900/50">
                          <button
                            onClick={() => handleDeleteConfirm(task.id)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Subtasks Checklist */}
                  {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                    <div className="px-10 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-1">
                        Subtasks & Checklist
                      </div>
                      {task.subtasks.map(sub => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(task, sub.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className={sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}>
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
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                {kanbanColumns.todo.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[300px]">
              {kanbanColumns.todo.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {task.category}
                    </span>
                    <button
                      onClick={() => onUpdateTask(task.id, { status: 'in_progress' })}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Start &rarr;
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3" /> Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                {kanbanColumns.in_progress.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[300px]">
              {kanbanColumns.in_progress.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                      {task.category}
                    </span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Complete &rarr;
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>{task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
                    <button
                      onClick={() => onUpdateTask(task.id, { status: 'pending' })}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      &larr; To Do
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                {kanbanColumns.completed.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[300px]">
              {kanbanColumns.completed.map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 opacity-70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-500">
                      {task.category}
                    </span>
                    <button
                      onClick={() => handleCheckbox(task)}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
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
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Schedule</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Grouped by Due Date</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calendarDays.map(({ offset, dateKey, label }) => {
              const dayTasks = tasks.filter(t => t.dueDate === dateKey);

              return (
                <div
                  key={offset}
                  className={`p-4 rounded-xl border ${
                    offset === 0
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50'
                      : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className={`text-xs font-bold ${offset === 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{dayTasks.length} tasks</span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 py-4 text-center">No tasks scheduled</div>
                    ) : (
                      dayTasks.map(t => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
                        >
                          <div className="font-medium truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.dueTime || t.priority}</div>
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
