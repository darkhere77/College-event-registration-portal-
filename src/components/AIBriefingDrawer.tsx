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

const IRON_MAN_PERSONA = {
  name: 'Iron Man',
  title: 'Tony Stark',
  tagline: 'Armor systems online • Mission intel active',
};

const briefingBackdropImage = "linear-gradient(135deg, rgba(5,10,22,0.86), rgba(19,22,40,0.74)), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1600 1200%22%3E%3Cdefs%3E%3ClinearGradient id=%22bg%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%230b1224%22/%3E%3Cstop offset=%2248%25%22 stop-color=%22%23131e3c%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%230d0d18%22/%3E%3C/linearGradient%3E%3ClinearGradient id=%22flare%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%220%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23fbbf24%22/%3E%3Cstop offset=%2245%25%22 stop-color=%22%23f97316%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%23ef4444%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=%22url(%23bg)%22 width=%221600%22 height=%221200%22/%3E%3Ccircle cx=%221210%22 cy=%22240%22 r=%22280%22 fill=%22rgba(251,146,60,0.26)%22/%3E%3Ccircle cx=%22360%22 cy=%22240%22 r=%22300%22 fill=%22rgba(59,130,246,0.2)%22/%3E%3Cg opacity=%220.9%22%3E%3Cpath d=%22M900 100 L1320 260 L1150 1050 L780 1120 L560 760 Z%22 fill=%22url(%23flare)%22 opacity=%220.3%22/%3E%3Cpath d=%22M780 130 L1090 170 L950 980 L650 980 L520 510 Z%22 fill=%22rgba(15,23,42,0.72)%22/%3E%3C/g%3E%3Cg fill=%22rgba(255,255,255,0.45)%22%3E%3Ccircle cx=%22160%22 cy=%22180%22 r=%222.5%22/%3E%3Ccircle cx=%22260%22 cy=%22300%22 r=%223.5%22/%3E%3Ccircle cx=%22420%22 cy=%22140%22 r=%222.5%22/%3E%3Ccircle cx=%22610%22 cy=%22260%22 r=%222%22/%3E%3Ccircle cx=%22730%22 cy=%22190%22 r=%222.8%22/%3E%3Ccircle cx=%221070%22 cy=%22140%22 r=%222.8%22/%3E%3Ccircle cx=%221210%22 cy=%22320%22 r=%222.3%22/%3E%3Ccircle cx=%221380%22 cy=%22150%22 r=%222.5%22/%3E%3Ccircle cx=%221460%22 cy=%22320%22 r=%223%22/%3E%3Ccircle cx=%221235%22 cy=%22540%22 r=%222.4%22/%3E%3Ccircle cx=%221345%22 cy=%22760%22 r=%223%22/%3E%3Ccircle cx=%22180%22 cy=%22540%22 r=%222.2%22/%3E%3Ccircle cx=%22260%22 cy=%22700%22 r=%222.5%22/%3E%3C/g%3E%3Cg font-family=%22Arial, Helvetica, sans-serif%22 font-weight=%22800%22 letter-spacing=%2210%22 text-anchor=%22middle%22%3E%3Ctext x=%22800%22 y=%22670%22 fill=%22rgba(248,250,252,0.9)%22 font-size=%22124%22%3EAVENGERS%3C/text%3E%3Ctext x=%22800%22 y=%22800%22 fill=%22rgba(251,146,60,0.85)%22 font-size=%2296%22%3EDOOMSDAY%3C/text%3E%3C/g%3E%3C/svg%3E');";

const IronManPortrait: React.FC = () => (
  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-orange-400/40 bg-gradient-to-br from-slate-950 via-[#160d0d] to-[#2d160f] shadow-lg shadow-orange-500/20">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.25),_transparent_55%)]" />
    <svg viewBox="0 0 200 220" className="relative z-10 h-full w-full drop-shadow-[0_0_18px_rgba(251,146,60,0.35)]" aria-label="Iron Man portrait">
      <defs>
        <linearGradient id="armorRed" x1="0" x2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="armorGold" x1="0" x2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M55 60 L75 35 L125 35 L145 60 L160 160 L120 196 L80 196 L40 160 Z" fill="url(#armorRed)" opacity="0.96"/>
      <path d="M78 70 L92 52 H108 L122 70 L130 150 H70 Z" fill="#dbeafe" opacity="0.9"/>
      <path d="M88 70 H112 L118 104 H82 Z" fill="#94a3b8" opacity="0.8"/>
      <path d="M85 83 L95 76 L105 76 L115 83 L115 108 H85 Z" fill="#111827" opacity="0.95"/>
      <path d="M90 89 H110 L105 100 H95 Z" fill="#f8fafc" opacity="0.9"/>
      <path d="M82 113 L118 113 L116 150 H84 Z" fill="#dc2626" opacity="0.85"/>
      <path d="M75 141 L55 165 L86 170 L82 154 Z" fill="url(#armorGold)"/>
      <path d="M125 141 L145 165 L114 170 L118 154 Z" fill="url(#armorGold)"/>
      <path d="M90 120 H110 V130 H90 Z" fill="#facc15" opacity="0.9"/>
      <circle cx="90" cy="96" r="5" fill="#f8fafc"/>
      <circle cx="110" cy="96" r="5" fill="#f8fafc"/>
      <path d="M83 92 L79 98" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M117 92 L121 98" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M92 110 Q100 117 108 110" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M48 150 L84 164" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"/>
      <path d="M152 150 L116 164" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  </div>
);

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
      text: `Good news, recruit. I’m Iron Man, and the campus defense systems are fully online. We’ve got a multiverse-level event coming in hot, and I can break down the best missions, roles, timing, and prep fast. Ask me anything and I’ll keep it sharp and efficient.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' } ),
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
      <div
        className="w-full max-w-lg border-l border-slate-800 h-full flex flex-col shadow-2xl"
        style={{
          backgroundImage: briefingBackdropImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0f24]">
          <div className="flex items-center gap-3">
            <IronManPortrait />
            <div>
              <h2 id="briefing-title" className="text-sm font-display font-bold text-white flex items-center gap-2">
                <span>{IRON_MAN_PERSONA.name.toUpperCase()} AI</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-400/40">
                  ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">{IRON_MAN_PERSONA.tagline}</p>
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
                  <span className={`font-mono-tech text-[10px] uppercase font-bold ${
                    m.role === 'user' ? 'text-cyan-300' : 'text-orange-300'
                  }`}>
                    {m.role === 'user' ? 'RECRUIT' : `${IRON_MAN_PERSONA.name.toUpperCase()} MODE`}
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
  if (q.includes('iron') || q.includes('tony') || q.includes('stark')) {
    return `I’m Iron Man, and yes — the mission is already optimized. We do the smart play, the fast move, and the clean finish. Tell me what you need and I’ll turn it into a winning plan.`;
  }
  if (q.includes('fee') || q.includes('cost') || q.includes('price')) {
    return `Registration is 100% complimentary for all verified campus recruits. That’s right — no charge, no nonsense, just full access and a serious mission briefing.`;
  }
  if (q.includes('role') || q.includes('strategist') || q.includes('engineer')) {
    return `The 4 Squad Archetypes are:\n• Strategist: Coordinates timeline decisions & team logistics.\n• Engineer: Tech builders and code hackers.\n• Creator: UI/UX, generative art & sonic resonance.\n• Field Agent: Frontline esports, puzzle hunt & tactical operations.\nPick the one that matches your strengths and I’ll make it work.`;
  }
  if (q.includes('code') || q.includes('hack') || q.includes('tech')) {
    return `For technical recruits, the "Quantum Anomaly Hackathon" and the "AI Anomaly Defense Masterclass" are the big plays. Build fast, think faster, and leave the competition in the dust.`;
  }
  if (q.includes('date') || q.includes('when') || q.includes('time')) {
    return `The Campus Assembly takes place on ${config.eventDateDisplay}. Registration closes on ${config.registrationDeadlineDisplay}. We’re on schedule — no panic, no delay.`;
  }
  if (q.includes('bring') || q.includes('laptop') || q.includes('id')) {
    return `Bring the College ID, your digital recruit pass, and a charged laptop if you’re joining a tech, design, or build-heavy mission. That’s the baseline gear.`;
  }
  return `Understood, recruit. The multiverse anomaly needs every discipline: AI engineers, tactical strategists, designers, and field agents. Pick your mission, lock in your squad, and we’ll make this event look easy.`;
}
