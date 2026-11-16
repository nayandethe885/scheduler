'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Compass, Sparkles } from 'lucide-react';
import { Task, Priority, Category, Recurrence, Subtask } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Meeting', 'Creative', 'Other'];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'TAKE THE HIGH ROAD' },
  { value: 'medium', label: 'STAY A LITTLE LONGER' },
  { value: 'low', label: 'FOR THE MILES AHEAD' },
];

export default function TaskModal({ isOpen, onClose, onSave, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'medium');
      setCategory(initialTask.category || 'Work');
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setRecurrence(initialTask.recurrence || 'none');
      setSubtasks(initialTask.subtasks || []);
      setTagsInput(initialTask.tags ? initialTask.tags.join(', ') : '');
      setEstimatedMinutes(initialTask.estimatedMinutes || 30);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      setDueDate(today);
      setDueTime('10:00 AM');
      setRecurrence('none');
      setSubtasks([]);
      setTagsInput('');
      setEstimatedMinutes(30);
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        recurrence,
        subtasks,
        tags,
        estimatedMinutes: Number(estimatedMinutes) || 30,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-mono">
      <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto border-[3px] sm:border-[3.5px] border-black dark:border-white bg-[#fffdf0] dark:bg-[#181a18] shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] dark:shadow-[6px_6px_0px_#fff] p-4 xs:p-6 text-[#141514] dark:text-[#f4f3ef] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 xs:pb-4 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5 xs:gap-3">
            <div className="p-1.5 border-2 border-black bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] shrink-0">
              <Compass className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="bg-[#ff4d00] text-white px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-[10px] xs:text-xs font-black uppercase tracking-widest inline-block">
                // TERRAIN SPECIFICATION
              </span>
              <h2 className="text-base xs:text-lg font-black uppercase tracking-tight text-[#141514] dark:text-[#f4f3ef] font-display-heavy mt-0.5">
                {initialTask ? 'EDIT TRAIL TASK' : 'NEW TRAIL TASK'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#ff4d00] text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 border-2 border-black bg-[#ff4d00] text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
              TASK TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.G. PACK BACKPACKING GEAR & CHECKLIST"
              className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs text-[#141514] dark:text-[#f4f3ef] placeholder-[#888] focus:outline-none focus:bg-[#fffdf0] uppercase tracking-wider font-black"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
              FIELD NOTES / DETAILS
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ADD CONTEXT, ROUTE DETAILS, OR NOTES..."
              className="w-full px-3.5 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-bold text-[#141514] dark:text-[#f4f3ef] placeholder-[#888] focus:outline-none focus:bg-[#fffdf0] resize-none"
            />
          </div>

          {/* Priority Pills */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1.5">
              PRIORITY TERRAIN TIER
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`py-2 px-2 text-xs uppercase tracking-wider border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] transition text-center font-black cursor-pointer ${
                    priority === p.value
                      ? 'bg-[#ffe600] text-black'
                      : 'bg-white dark:bg-[#121312] text-[#555] dark:text-[#aaa] hover:bg-[#fff5f0]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                TERRAIN CATEGORY
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                ESTIMATED FOCUS (MINUTES)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none"
              />
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                DUE DATE
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
                TIME (E.G. 10:00 AM)
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-black text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#bbb] mb-1">
              TRAIL ESSENTIALS CHECKLIST ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-2 mb-2 max-h-36 overflow-y-auto">
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-xs font-bold"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4 h-4 rounded-none border-2 border-black accent-[#ff4d00] cursor-pointer"
                    />
                    <span className={sub.completed ? 'line-through text-[#888]' : ''}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="p-1 border border-black bg-[#ff4d00] text-white hover:bg-black transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="ADD STEP AND PRESS ENTER..."
                className="flex-1 px-3 py-2 text-xs border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-white dark:bg-[#121312] text-[#141514] dark:text-[#f4f3ef] uppercase tracking-wider font-bold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] bg-[#ffe600] text-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
              >
                + ADD
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black dark:border-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs uppercase tracking-wider font-black text-[#141514] dark:text-[#f4f3ef] bg-white dark:bg-[#202020] hover:bg-[#fffdf0] transition cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'SAVING...' : initialTask ? 'UPDATE TASK' : 'SAVE TO BACKLOG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
