'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import AIChatView from './AIChatView';
import { ChatMessage } from '@/types';

interface AIChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onConfirmAction: (action: string, targetId: string) => Promise<void>;
  isThinking: boolean;
}

export default function AIChatWidget({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  onConfirmAction,
  isThinking,
}: AIChatWidgetProps) {
  return (
    <>
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group active:scale-95"
          title="Open LifeOS Copilot"
        >
          <Sparkles className="w-5 h-5 text-indigo-100" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-200 text-xs font-semibold pr-1">
            Copilot
          </span>
        </button>
      )}

      {/* Slide-in drawer or modal when open */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-xl h-[85vh] sm:h-[650px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
            {/* Close handle */}
            <div className="absolute top-3.5 right-4 z-10">
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AIChatView
              messages={messages}
              onSendMessage={onSendMessage}
              onConfirmAction={onConfirmAction}
              isThinking={isThinking}
            />
          </div>
        </div>
      )}
    </>
  );
}
