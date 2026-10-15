import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Zap, Brain, Loader2, ChevronDown } from 'lucide-react';
import { EventConfig } from '../config/eventConfig';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AIBriefingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  onSelectMission?: (id: string) => void;
  onSelectRole?: (role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => void;
}

export const AIBriefingDrawer: React.FC<AIBriefingDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSelectMission,
  onSelectRole,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Greetings Recruit. I am the Campus Assembly Tactical AI Counselor. A level-4 multiverse disruption has been detected across the university quadrant. How may I assist your deployment? You can ask me about mission categories, which squad role suits your skills, event schedules, or preparation tips.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'flash' | 'thinking'>('flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          mode: mode,
          history: messages.slice(-8).map(m => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.reply || 'Mission telemetry received. Prepare your squad.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Briefing server unavailable');
      }
    } catch (err) {
      // Deterministic intelligent client-side briefing fallback
      const replyFallback = generateLocalBriefingFallback(userMessage.text, config);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
    >
      <div className="w-full max-w-lg bg-[#070b1a] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0f24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 id="briefing-title" className="text-sm font-display font-bold text-white flex items-center gap-2">
                <span>TACTICAL BRIEFING AI</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">Campus Assembly Mission Command</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed vs High-Thinking Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono-tech">
              <button
                onClick={() => setMode('flash')}
                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                  mode === 'flash' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Low-latency quick answers"
              >
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </button>
              <button
                onClick={() => setMode('thinking')}
                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                  mode === 'thinking' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Deep tactical reasoning"
              >
                <Brain className="w-3 h-3" />
                <span>Deep</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Briefing Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2.5 bg-[#080d20] border-b border-slate-900 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-mono-tech text-slate-500 uppercase shrink-0">Prompts:</span>
          {[
            'Which mission fits a coder?',
            'Explain the 4 Squad Roles',
            'Is there any entry fee?',
            'What should I bring?',
          ].map(quick => (
            <button
              key={quick}
              onClick={() => {
                setInput(quick);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono-tech transition-colors cursor-pointer"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-900/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-4">
                  <span className="font-mono-tech text-[10px] uppercase text-cyan-300 font-bold">
                    {m.role === 'user' ? 'RECRUIT' : 'TACTICAL ADVISOR'}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="font-mono-tech">
                  {mode === 'thinking' ? 'Synthesizing multiverse probability matrix...' : 'Relaying tactical telemetry...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0a0f24]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about missions, roles, logistics..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function generateLocalBriefingFallback(query: string, config: EventConfig): string {
  const q = query.toLowerCase();
  if (q.includes('fee') || q.includes('cost') || q.includes('price')) {
    return `Registration is 100% complimentary for all verified campus recruits! Student council sponsorship provides full credential passes, rations, and admission.`;
  }
  if (q.includes('role') || q.includes('strategist') || q.includes('engineer')) {
    return `The 4 Squad Archetypes are:\n• Strategist: Coordinates timeline decisions & team logistics.\n• Engineer: Tech builders and code hackers.\n• Creator: UI/UX, generative art & sonic resonance.\n• Field Agent: Frontline esports, puzzle hunt & tactical operations.\nRoles are for fun and personalize your recruit pass!`;
  }
  if (q.includes('code') || q.includes('hack') || q.includes('tech')) {
    return `For technical recruits, the "Quantum Anomaly Hackathon" (24hr build sprint in Turing Lab) and the "AI Anomaly Defense Masterclass" are your highest priority missions!`;
  }
  if (q.includes('date') || q.includes('when') || q.includes('time')) {
    return `The Campus Assembly takes place on ${config.eventDateDisplay}. Registration closes on ${config.registrationDeadlineDisplay}.`;
  }
  if (q.includes('bring') || q.includes('laptop') || q.includes('id')) {
    return `Recruits should bring their College ID, digital recruit pass (or code), and a laptop/charger if joining technical or design tracks.`;
  }
  return `Understood, recruit. The multiverse anomaly requires every discipline: from AI engineers and tactical strategists to sonic creators and field agents. Select your preferred mission in the Directory and secure your spot on the Roster!`;
}
