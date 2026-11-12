'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
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
  Compass,
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
  const [mobileKanbanCol, setMobileKanbanCol] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

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
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#d95326', '#e06a3f', '#141514', '#f4f3ef'],
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
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8 pb-16 font-mono"
    >
      {/* 1. Header & View Switcher */}
      <div className="border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-white dark:bg-[#161816] p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-colors duration-200">
        <div className="space-y-2">
          <span className="bg-[#ff4d00] text-white px-2.5 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase tracking-widest inline-block">
            02 // FIELD OPERATIONS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy">
            Terrain & Tasks
          </h1>
          <p className="text-xs uppercase tracking-wider font-bold text-[#555] dark:text-[#aaa]">
            MANAGE BACKLOG · ROUTE PRIORITIES · PACK ESSENTIALS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Brutalist View Switcher Toggles */}
          <div className="flex items-center gap-1.5 p-1 border-2 border-black dark:border-white bg-[#ece9df] dark:bg-[#121312] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
            {[
              { id: 'list', label: '01 // LIST' },
              { id: 'kanban', label: '02 // BOARD' },
              { id: 'calendar', label: '03 // CALENDAR' },
            ].map(tab => {
              const isSelected = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id as any)}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                      : 'text-[#555] dark:text-[#aaa] hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenNewTask}
            className="px-4 py-2 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 text-xs uppercase tracking-wider font-black transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> + NEW TASK
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-black dark:text-white stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="SEARCH FIELD BACKLOG // TITLE, TAGS, DETAILS..."
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black text-[#141514] dark:text-[#f4f3ef] placeholder-[#777] focus:outline-none focus:bg-[#fffdf0] uppercase tracking-wider"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-white dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none uppercase tracking-wider cursor-pointer"
            >
              <option value="all">ALL STATUS</option>
              <option value="pending">PENDING ONLY</option>
              <option value="completed">COMPLETED ONLY</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none uppercase tracking-wider cursor-pointer"
            >
              <option value="all">ALL PRIORITIES</option>
              <option value="high">HIGH PRIORITY</option>
              <option value="medium">MEDIUM PRIORITY</option>
              <option value="low">LOW PRIORITY</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none uppercase tracking-wider cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-white dark:bg-[#121312] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none uppercase tracking-wider cursor-pointer"
            >
              <option value="dueDate">SORT: DUE DATE</option>
              <option value="priority">SORT: PRIORITY</option>
              <option value="title">SORT: TITLE</option>
              <option value="newest">SORT: NEWEST</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-black text-[#555] dark:text-[#aaa] uppercase tracking-widest pt-1">
          <span>SHOWING {filteredTasks.length} OF {tasks.length} TRAIL TASKS</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#ff4d00] hover:underline cursor-pointer"
            >
              CLEAR SEARCH FILTER
            </button>
          )}
        </div>
      </div>

      {/* 3. VIEW 1: SIGNATURE TRAILHEAD LIST VIEW */}
      {activeView === 'list' && (
        <div className="border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-white dark:bg-[#161816] divide-y-[2.5px] divide-black dark:divide-white">
          {filteredTasks.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#fffdf0] dark:bg-[#181a18]">
              <Compass className="w-12 h-12 text-[#ff4d00] mx-auto stroke-[2.5] animate-spin-slow" />
              <p className="text-base uppercase tracking-wider text-[#141514] dark:text-[#f4f3ef] font-black">
                NO TRAIL TASKS FOUND
              </p>
              <p className="text-xs font-bold text-[#555] dark:text-[#aaa] max-w-sm mx-auto uppercase">
                No items match your active filters. Adjust your filters or map a new trail task.
              </p>
              <button
                type="button"
                onClick={onOpenNewTask}
                className="mt-3 px-5 py-2.5 bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] text-xs uppercase tracking-wider font-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
              >
                + CREATE TASK
              </button>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const isDone = task.status === 'completed';
              const isExpanded = expandedTaskIds.has(task.id);
              const indexStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

              let pillBg = 'bg-[#ffe600] text-black';
              let pillLabel = 'FOR THE MILES AHEAD';
              if (task.priority === 'high') {
                pillLabel = 'HIGH PRIORITY';
                pillBg = 'bg-[#ff4d00] text-white';
              } else if (task.priority === 'medium') {
                pillLabel = 'MEDIUM PRIORITY';
                pillBg = 'bg-[#00e5ff] text-black';
              } else if (task.category) {
                pillLabel = task.category.toUpperCase();
                pillBg = 'bg-[#ccff00] text-black';
              }

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.25 }}
                  className="group py-5 sm:py-6 px-4 sm:px-6 transition-colors hover:bg-[#ffe600]/10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Index, Brutalist Checkbox & Chunky Title */}
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                      <span className="font-mono text-sm font-black text-[#888] shrink-0 group-hover:text-[#ff4d00] transition-colors">
                        {indexStr}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCheckbox(task)}
                        className={`w-6 h-6 rounded-none border-[2.5px] border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center justify-center shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                          isDone
                            ? 'bg-[#ccff00] text-black'
                            : 'bg-white dark:bg-[#202020] hover:bg-[#ffe600]'
                        }`}
                        title={isDone ? 'Mark pending' : 'Mark complete'}
                      >
                        <AnimatePresence>
                          {isDone && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-4 h-4 stroke-[3.5] text-black" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3
                            onClick={() => onOpenEditTask(task)}
                            className={`text-xl sm:text-2xl font-black tracking-tight truncate cursor-pointer transition-colors uppercase ${
                              isDone
                                ? 'line-through text-[#888] dark:text-[#777]'
                                : 'text-[#141514] dark:text-[#f4f3ef] group-hover:text-[#ff4d00]'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>

                        {task.description && (
                          <p className="text-xs font-bold text-[#555] dark:text-[#aaa] truncate max-w-xl mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-[#666] dark:text-[#bbb] mt-2">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[#141514] dark:text-[#f4f3ef] font-black">
                              <CalendarIcon className="w-3.5 h-3.5 text-[#ff4d00] stroke-[2.5]" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="flex items-center gap-1 text-[#141514] dark:text-[#f4f3ef] font-black">
                              <Clock className="w-3.5 h-3.5 text-[#ff4d00] stroke-[2.5]" />
                              {task.dueTime}
                            </span>
                          )}
                          {task.estimatedMinutes && (
                            <span className="bg-[#fffdf0] dark:bg-[#222] px-2 py-0.5 border border-black dark:border-white text-[11px] font-black">~{task.estimatedMinutes}M FOCUS</span>
                          )}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="flex items-center gap-1 text-[#ff4d00] font-black">
                              <Repeat className="w-3.5 h-3.5 stroke-[2.5]" /> {task.recurrence.toUpperCase()}
                            </span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(task.id)}
                              className="text-[#ff4d00] hover:underline font-black flex items-center gap-1 cursor-pointer"
                            >
                              ESSENTIALS ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Pill Badge, Category & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 pl-10 md:pl-0 shrink-0">
                      <span 
                        className={`px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-wider ${pillBg}`}
                      >
                        {pillLabel}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditTask(task)}
                          className="p-1.5 border-2 border-black dark:border-white bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {deletingId === task.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(task.id)}
                              className="px-2.5 py-1 text-xs font-black bg-[#ff4d00] text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000] uppercase cursor-pointer"
                            >
                              CONFIRM
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 text-xs font-bold border-2 border-black bg-white text-black uppercase cursor-pointer"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(task.id)}
                            className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-[#202020] text-black dark:text-white hover:bg-[#ff4d00] hover:text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}

                        <span 
                          onClick={() => onOpenEditTask(task)}
                          className="text-2xl font-black text-black dark:text-white group-hover:text-[#ff4d00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform cursor-pointer pl-1 inline-block"
                        >
                          ↗
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Animated Subtasks Checklist */}
                  <AnimatePresence>
                    {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden mt-4 pt-3 border-t-2 border-black dark:border-white pl-8 sm:pl-12 space-y-2"
                      >
                        <div className="text-xs font-black uppercase tracking-widest text-[#ff4d00]">
                          // TRAIL ESSENTIALS CHECKLIST
                        </div>
                        <div className="space-y-2">
                          {task.subtasks.map(sub => (
                            <label
                              key={sub.id}
                              className="flex items-center gap-3 text-xs font-bold text-[#141514] dark:text-[#f4f3ef] cursor-pointer hover:text-[#ff4d00] transition"
                            >
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(task, sub.id)}
                                className="w-4 h-4 rounded-none border-2 border-black accent-[#ff4d00] cursor-pointer"
                              />
                              <span className={sub.completed ? 'line-through text-[#888]' : ''}>
                                {sub.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* 4. VIEW 2: KANBAN BOARD VIEW */}
      {activeView === 'kanban' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 md:hidden border-2 border-black dark:border-white bg-white dark:bg-[#121312] p-1 text-xs uppercase font-black shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
            <button
              type="button"
              onClick={() => setMobileKanbanCol('all')}
              className={`py-1.5 transition cursor-pointer ${mobileKanbanCol === 'all' ? 'bg-[#ffe600] text-black border-2 border-black' : 'text-[#666]'}`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setMobileKanbanCol('todo')}
              className={`py-1.5 transition cursor-pointer ${mobileKanbanCol === 'todo' ? 'bg-[#ffe600] text-black border-2 border-black' : 'text-[#666]'}`}
            >
              TODO ({kanbanColumns.todo.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileKanbanCol('in_progress')}
              className={`py-1.5 transition cursor-pointer ${mobileKanbanCol === 'in_progress' ? 'bg-[#ff4d00] text-white border-2 border-black' : 'text-[#666]'}`}
            >
              ACTIVE ({kanbanColumns.in_progress.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileKanbanCol('completed')}
              className={`py-1.5 transition cursor-pointer ${mobileKanbanCol === 'completed' ? 'bg-[#ccff00] text-black border-2 border-black' : 'text-[#666]'}`}
            >
              DONE ({kanbanColumns.completed.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: TODO */}
            <div className={`${mobileKanbanCol !== 'all' && mobileKanbanCol !== 'todo' ? 'hidden md:block' : ''} border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] p-5 space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <span className="bg-[#ffe600] text-black px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-widest">
                  01 // BACKLOG
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">{kanbanColumns.todo.length}</span>
              </div>

              <div className="space-y-3 min-h-[250px]">
                {kanbanColumns.todo.map(task => (
                  <motion.div 
                    layout
                    key={task.id} 
                    className="p-4 border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] bg-white dark:bg-[#202220] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] transition-all"
                  >
                    <div className="flex items-center justify-between text-xs uppercase font-black">
                      <span className="bg-[#ccff00] text-black px-1.5 py-0.5 border border-black text-[10px]">{task.category || 'GENERAL'}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateTask(task.id, { status: 'in_progress' })}
                        className="hover:bg-[#ff4d00] hover:text-white px-2 py-0.5 border border-black text-[10px] font-black cursor-pointer transition"
                      >
                        START &rarr;
                      </button>
                    </div>
                    <h4 className="text-base font-black text-[#141514] dark:text-[#f4f3ef] uppercase">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs font-bold text-[#666] dark:text-[#aaa] pt-1">
                      <span>{task.dueDate ? formatDate(task.dueDate) : 'NO DATE'}</span>
                      <button 
                        type="button"
                        onClick={() => handleCheckbox(task)} 
                        className="px-2 py-0.5 bg-[#ffe600] text-black border border-black font-black flex items-center gap-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> DONE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className={`${mobileKanbanCol !== 'all' && mobileKanbanCol !== 'in_progress' ? 'hidden md:block' : ''} border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#fff5f0] dark:bg-[#1c1716] p-5 space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <span className="bg-[#ff4d00] text-white px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-widest">
                  02 // IN TRANSIT
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#ff4d00] text-white">{kanbanColumns.in_progress.length}</span>
              </div>

              <div className="space-y-3 min-h-[250px]">
                {kanbanColumns.in_progress.map(task => (
                  <motion.div 
                    layout
                    key={task.id} 
                    className="p-4 border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] bg-white dark:bg-[#202220] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] transition-all"
                  >
                    <div className="flex items-center justify-between text-xs uppercase font-black">
                      <span className="bg-[#ff4d00] text-white px-1.5 py-0.5 border border-black text-[10px]">{task.category || 'ACTIVE'}</span>
                      <button
                        type="button"
                        onClick={() => handleCheckbox(task)}
                        className="bg-[#ccff00] text-black px-2 py-0.5 border border-black text-[10px] font-black cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition"
                      >
                        RESOLVE &rarr;
                      </button>
                    </div>
                    <h4 className="text-base font-black text-[#141514] dark:text-[#f4f3ef] uppercase">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs font-bold text-[#666] dark:text-[#aaa] pt-1">
                      <span>{task.dueDate ? formatDate(task.dueDate) : 'NO DATE'}</span>
                      <button 
                        type="button"
                        onClick={() => onUpdateTask(task.id, { status: 'pending' })} 
                        className="px-2 py-0.5 border border-black hover:bg-[#ffe600] font-black cursor-pointer transition text-[10px]"
                      >
                        &larr; BACKLOG
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className={`${mobileKanbanCol !== 'all' && mobileKanbanCol !== 'completed' ? 'hidden md:block' : ''} border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000] dark:shadow-[5px_5px_0px_#fff] bg-[#f6fff0] dark:bg-[#161c16] p-5 space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <span className="bg-[#ccff00] text-black px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-widest">
                  03 // RESOLVED
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">{kanbanColumns.completed.length}</span>
              </div>

              <div className="space-y-3 min-h-[250px]">
                {kanbanColumns.completed.map(task => (
                  <motion.div 
                    layout
                    key={task.id} 
                    className="p-4 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-[#f9f9f9] dark:bg-[#1c1c1c] opacity-80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs uppercase font-black">
                      <span className="text-[#888]">{task.category || 'RESOLVED'}</span>
                      <button 
                        type="button"
                        onClick={() => handleCheckbox(task)} 
                        className="px-2 py-0.5 border border-black hover:bg-[#ffe600] text-[10px] font-black cursor-pointer transition"
                      >
                        REOPEN
                      </button>
                    </div>
                    <h4 className="text-base font-black line-through text-[#888] dark:text-[#777] uppercase">{task.title}</h4>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW 3: CALENDAR GRID VIEW */}
      {activeView === 'calendar' && (
        <div className="border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-[#fffdf0] dark:bg-[#161816] p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <span className="bg-[#ffe600] text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-widest">
              EXPEDITION SCHEDULE // 4-DAY PROJECTION
            </span>
            <span className="text-xs font-black text-[#555] dark:text-[#aaa]">CHRONOLOGICAL GROUPING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calendarDays.map(({ offset, dateKey, label }) => {
              const dayTasks = tasks.filter(t => t.dueDate === dateKey);

              return (
                <div
                  key={offset}
                  className={`p-4 border-[2.5px] border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] ${
                    offset === 0
                      ? 'bg-[#ffe600]/20 dark:bg-[#ffe600]/15'
                      : 'bg-white dark:bg-[#1c1e1c]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black dark:border-white">
                    <span className={`text-xs font-black uppercase tracking-wider ${offset === 0 ? 'bg-[#ffe600] text-black px-2 py-0.5 border border-black' : 'text-[#141514] dark:text-[#f4f3ef]'}`}>
                      {label}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">{dayTasks.length} ITEMS</span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="text-xs font-black text-[#888] py-8 text-center uppercase border-2 border-dashed border-black/30 dark:border-white/30">
                        TRAIL CLEAR
                      </div>
                    ) : (
                      dayTasks.map(t => (
                        <div
                          key={t.id}
                          className="p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#252825] text-xs"
                        >
                          <div className="font-black uppercase truncate text-[#141514] dark:text-[#f4f3ef]">{t.title}</div>
                          <div className="text-[10px] font-bold text-[#666] dark:text-[#aaa] mt-1 uppercase flex items-center justify-between">
                            <span>{t.dueTime || 'ANYTIME'}</span>
                            <span className="bg-[#ccff00] text-black px-1.5 py-0.2 border border-black">{t.priority}</span>
                          </div>
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
    </motion.div>
  );
}
