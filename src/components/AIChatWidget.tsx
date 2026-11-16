'use client';

import React from 'react';
import { Compass, X } from 'lucide-react';
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
          type="button"
          onClick={onToggle}
          className="fixed bottom-20 right-3 xs:right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 xs:p-3 sm:px-4 sm:py-3 bg-[#ffe600] text-black border-[2.5px] border-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 group font-mono text-xs uppercase tracking-wider font-black cursor-pointer"
          title="Open Trailhead Copilot"
        >
          <Compass className="w-4 h-4 animate-spin-slow stroke-[2.5]" />
          <span className="hidden sm:inline">
            DISPATCH COPILOT ↗
          </span>
        </button>
      )}

      {/* Slide-in drawer when open */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="relative w-full sm:max-w-xl h-[88dvh] sm:h-[650px] max-h-[100dvh] shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] dark:shadow-[6px_6px_0px_#fff] overflow-hidden border-[3px] sm:border-[3.5px] border-black dark:border-white flex flex-col bg-[#fffdf0] dark:bg-[#181a18]">
            {/* Close handle */}
            <div className="absolute top-3 xs:top-3.5 right-3 xs:right-4 z-10">
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 bg-[#ff4d00] text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
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
