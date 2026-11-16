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
  User,
  Compass
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
  'What should I focus on today?',
  'Schedule deep work tomorrow at 9 AM',
  'Remind me to check camp equipment at 7 PM',
  'Summarize my pending tasks',
  'Add task: Review trail navigation markers',
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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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
    <div className="flex flex-col h-[calc(100dvh-175px)] sm:h-[calc(100vh-140px)] max-h-[850px] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] overflow-hidden animate-fadeIn font-mono transition-colors duration-200">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-black dark:border-white bg-[#ffe600] text-black">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border-2 border-black bg-black text-[#ffe600] shadow-[2px_2px_0px_#000]">
            <Compass className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black uppercase tracking-tight text-black font-display-heavy">
                Trailhead Copilot
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider border-2 border-black bg-black text-[#ccff00] px-2 py-0.5 shadow-[1px_1px_0px_#000]">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-black font-bold uppercase tracking-wider">
              FIELD NATURAL LANGUAGE DISPATCH
            </p>
          </div>
        </div>

        {/* Audio / Voice readout toggle */}
        <button
          type="button"
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2 px-3 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
            ttsEnabled
              ? 'bg-[#ff4d00] text-white'
              : 'bg-white text-black hover:bg-[#ccff00]'
          }`}
          title={ttsEnabled ? 'Disable audio synthesis' : 'Enable audio synthesis'}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4 text-white stroke-[2.5]" /> : <VolumeX className="w-4 h-4 stroke-[2.5]" />}
          <span className="hidden sm:inline">{ttsEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
        </button>
      </div>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Stamp */}
              <div
                className={`w-8 h-8 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center justify-center shrink-0 text-xs font-black ${
                  isUser
                    ? 'bg-[#ffe600] text-black'
                    : 'bg-[#ff4d00] text-white'
                }`}
              >
                {isUser ? 'YOU' : 'AI'}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div
                  className={`p-4 border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] text-xs sm:text-sm font-bold leading-relaxed ${
                    isUser
                      ? 'bg-[#ffe600] text-black'
                      : 'bg-white dark:bg-[#202220] text-[#141514] dark:text-[#f4f3ef]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Confirmation Request Card */}
                  {msg.receipt && msg.receipt.requiresConfirmation && msg.receipt.confirmationPayload && (
                    <div className="mt-3 p-3 border-2 border-black bg-[#ff4d00] text-white shadow-[2px_2px_0px_#000] space-y-2 text-xs font-black">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                        CONFIRMATION REQUIRED
                      </div>
                      <p className="font-bold">
                        TARGET: &quot;{msg.receipt.confirmationPayload.targetTitle}&quot;
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            onConfirmAction(
                              msg.receipt!.confirmationPayload!.action,
                              msg.receipt!.confirmationPayload!.targetId
                            )
                          }
                          className="px-3 py-1 bg-black text-[#ffe600] border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-xs font-black uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition cursor-pointer"
                        >
                          CONFIRM ACTION
                        </button>
                        <span className="text-[10px] text-white/90">OR IGNORE TO ABORT</span>
                      </div>
                    </div>
                  )}

                  {/* Verified Action Receipt */}
                  {msg.receipt && !msg.receipt.requiresConfirmation && msg.receipt.success && (
                    <div className="mt-3 pt-2 border-t-2 border-black dark:border-white flex items-center gap-1.5 text-xs text-[#ff4d00] font-black">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span className="uppercase tracking-wider">{msg.receipt.summary}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] font-black uppercase tracking-wider text-[#666] dark:text-[#aaa] px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-black bg-[#ff4d00] text-white shadow-[2px_2px_0px_#000] flex items-center justify-center text-xs font-black">
              AI
            </div>
            <div className="p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-[#ffe600] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d00] animate-ping" />
              <span>PARSING ROUTE & EXECUTING...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Command Pills */}
      <div className="px-4 py-2.5 border-t-2 border-black dark:border-white bg-[#ece9df] dark:bg-[#121312] overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-black uppercase tracking-widest text-[#555] dark:text-[#aaa]">
            SUGGESTED:
          </span>
          {SAMPLE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(cmd)}
              className="px-3 py-1 text-xs uppercase tracking-wider font-black border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_#000] dark:shadow-[1.5px_1.5px_0px_#fff] bg-white dark:bg-[#202220] text-black dark:text-white hover:bg-[#ffe600] hover:text-black transition shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t-2 border-black dark:border-white bg-white dark:bg-[#121312]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 xs:p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] transition cursor-pointer shrink-0 ${
              isListening
                ? 'bg-[#ff4d00] text-white animate-pulse'
                : 'bg-white dark:bg-[#202020] text-black dark:text-white hover:bg-[#ffe600] hover:text-black'
            }`}
            title={isListening ? 'Listening...' : 'Voice command'}
          >
            <Mic className="w-4 h-4 stroke-[2.5]" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={isListening ? 'LISTENING TO FIELD AUDIO...' : 'ENTER DISPATCH INSTRUCTION...'}
            className="flex-1 min-w-0 px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] bg-[#fffdf0] dark:bg-[#181a18] text-xs font-black text-[#141514] dark:text-[#f4f3ef] placeholder-[#777] uppercase tracking-wider focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="px-3.5 xs:px-5 py-2.5 xs:py-3 bg-[#ff4d00] hover:bg-[#e04400] text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">DISPATCH</span>
          </button>
        </div>
      </form>
    </div>
  );
}
