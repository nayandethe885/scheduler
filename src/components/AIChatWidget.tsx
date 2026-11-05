'use client';

import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, Bot } from 'lucide-react';
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
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition flex items-center gap-2 group"
          title="Open LifeOS Copilot"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            LifeOS AI
          </span>
        </button>
      )}

      {/* Slide-in drawer or modal when open */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full sm:max-w-xl h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col bg-slate-950">
            {/* Close handle */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onToggle}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                title="Close AI Assistant"
              >
                <X className="w-5 h-5" />
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
