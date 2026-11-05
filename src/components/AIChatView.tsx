'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2,
  HelpCircle,
  RefreshCw,
  User
} from 'lucide-react';
import { ChatMessage, ActionReceipt } from '@/types';
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
  'Remind me to complete my assignment tomorrow at 10 AM.',
  'Schedule a meeting for Friday.',
  'Remind me to call my friend at 8 PM.',
  'What important work is pending?',
  'Create a study plan for the next 7 days.',
  'I completed my React assignment.',
  'Move my pending task to tomorrow.',
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
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] glass-panel rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden animate-fadeIn">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">LifeOS Copilot</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">Natural language personal productivity assistant</p>
          </div>
        </div>

        {/* Audio / Voice readout toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
              ttsEnabled
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={ttsEnabled ? 'Disable voice readout' : 'Enable voice readout'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Speech On' : 'Speech Off'}</span>
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
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Confirmation Request Card */}
                  {msg.receipt && msg.receipt.requiresConfirmation && msg.receipt.confirmationPayload && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Destructive Action Confirmation
                      </div>
                      <p className="text-slate-300">
                        Target: <strong className="text-white">&quot;{msg.receipt.confirmationPayload.targetTitle}&quot;</strong>
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            onConfirmAction(
                              msg.receipt!.confirmationPayload!.action,
                              msg.receipt!.confirmationPayload!.targetId
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
                        >
                          Confirm & Delete
                        </button>
                        <span className="text-[11px] text-slate-400">or ignore to cancel</span>
                      </div>
                    </div>
                  )}

                  {/* Verified Action Receipt */}
                  {msg.receipt && !msg.receipt.requiresConfirmation && msg.receipt.success && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">Database Verified: {msg.receipt.summary}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-slate-400 px-1 ${
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>LifeOS is analyzing your request...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Sample Commands Pills Drawer */}
      <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
            Try:
          </span>
          {SAMPLE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(cmd)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 transition shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {/* Voice Input Mic */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice input (Speak command)'}
          >
            {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Ask LifeOS to manage tasks, schedule reminders, plan your week...'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
