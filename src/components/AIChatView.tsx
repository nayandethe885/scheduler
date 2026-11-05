'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  User
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { formatTime } from '@/lib/utils';
import { sound } from '@/lib/sound';

interface AIChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onConfirmAction: (action: string, targetId: string) => Promise<void>;
  isThinking: boolean;
}

const SAMPLE_COMMANDS = [
  'What are my tasks for today?',
  'Remind me to complete assignment tomorrow at 10 AM',
  'Schedule a meeting for Friday',
  'Remind me to call friend at 8 PM',
  'What important work is pending?',
  'Create a study plan for next 7 days',
  'What should I focus on today?',
];

export default function AIChatView({
  messages,
  onSendMessage,
  onConfirmAction,
  isThinking,
}: AIChatViewProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Read latest message if TTS enabled
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'assistant' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastMsg.text.replace(/[*_#`]/g, ''));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, ttsEnabled]);

  // Web Speech API Voice Recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const text = inputText.trim();
    setInputText('');
    sound.playClick();
    await onSendMessage(text);
  };

  const handlePromptClick = async (prompt: string) => {
    sound.playClick();
    await onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn transition-colors duration-150">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">LifeOS Copilot</h2>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Natural language productivity assistant</p>
          </div>
        </div>

        {/* Audio / Voice readout toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              ttsEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={ttsEnabled ? 'Disable voice readout' : 'Enable voice readout'}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Confirmation Request Card */}
                  {msg.receipt && msg.receipt.requiresConfirmation && msg.receipt.confirmationPayload && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-900/60 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Confirmation Required
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Target: <strong className="text-slate-900 dark:text-white">&quot;{msg.receipt.confirmationPayload.targetTitle}&quot;</strong>
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            onConfirmAction(
                              msg.receipt!.confirmationPayload!.action,
                              msg.receipt!.confirmationPayload!.targetId
                            )
                          }
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow transition"
                        >
                          Confirm
                        </button>
                        <span className="text-[11px] text-slate-400">or ignore to cancel</span>
                      </div>
                    </div>
                  )}

                  {/* Verified Action Receipt */}
                  {msg.receipt && !msg.receipt.requiresConfirmation && msg.receipt.success && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium">{msg.receipt.summary}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Processing request...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Sample Commands Pills */}
      <div className="px-4 sm:px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Try:
          </span>
          {SAMPLE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(cmd)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 transition shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Voice Input Mic */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-xl border transition ${
              isListening
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border-slate-200 dark:border-slate-800'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input (Speak command)'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type a command or message (e.g. Schedule meeting for tomorrow 3 PM)...'}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
