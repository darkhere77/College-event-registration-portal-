import React, { useState, useEffect } from 'react';
import { EventConfig } from '../config/eventConfig';
import { calculateTimeRemaining } from '../utils/registrationRules';
import { Radio, AlertTriangle, ShieldCheck, Zap, Volume2, VolumeX, Clock } from 'lucide-react';

interface StoryBriefingProps {
  config: EventConfig;
  onJoinClick: () => void;
}

export const StoryBriefing: React.FC<StoryBriefingProps> = ({ config, onJoinClick }) => {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeRemaining(config.registrationDeadlineISO)
  );
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(config.registrationDeadlineISO));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.registrationDeadlineISO]);

  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Subtle procedural tech hum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setAudioEnabled(true);
      } catch (e) {
        setAudioEnabled(false);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  return (
    <section id="story" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-900">
      {/* Countdown Alert Banner */}
      <div className="mb-16 bg-gradient-to-r from-slate-950 via-[#0a1024] to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono-tech text-cyan-400 uppercase tracking-wider block">
              REGISTRATION COUNTDOWN • ZERO DISRUPTION WINDOW
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold text-white">
              Assembly Registration Deadline: {config.registrationDeadlineDisplay}
            </h3>
          </div>
        </div>

        {/* Countdown Digits */}
        <div className="flex items-center gap-3 font-mono-tech">
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINUTES', val: timeLeft.minutes },
            { label: 'SECONDS', val: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl sm:text-2xl font-bold text-cyan-300 shadow-inner">
                {String(item.val).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Audio Toggle (Strictly off by default) */}
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono-tech text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          title={audioEnabled ? 'Mute ambient tech frequency' : 'Enable subtle ambient frequency'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span>{audioEnabled ? 'Frequency: ACTIVE' : 'Sound: OFF'}</span>
        </button>
      </div>

      {/* 4 Story Briefing Pillars */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono-tech mb-3">
          <Radio className="w-3.5 h-3.5" />
          <span>DECODED TRANSMISSION ARCHIVE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          THE CAMPUS MISSION BRIEFING
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Understand the disruption. Deploy your knowledge. Protect the academic timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pillar 1 */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono-tech text-rose-400 uppercase">Phase 01</span>
            <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">The Signal</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              At 04:18 hours, high-energy telemetry sensors registered quantum anomalies across campus
              laboratories. Multiple timelines are intersecting directly over our quadrangle.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 font-mono-tech text-[10px] text-slate-500">
            TRANSMISSION_STATUS: VERIFIED
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono-tech text-cyan-400 uppercase">Phase 02</span>
            <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">The Mission</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              We cannot close the fracture through force alone. It requires human ingenuity, code sprints,
              generative design, tactical gameplay, and collaborative campus intelligence.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 font-mono-tech text-[10px] text-slate-500">
            TACTICAL_OBJECTIVE: MULTIDISCIPLINARY
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono-tech text-amber-400 uppercase">Phase 03</span>
            <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">Campus Response</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {config.collegeName} has converted all facilities into specialized operation arenas:
              Turing Labs for code, the Arena for esports, and the Amphitheater for sonic resonance.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 font-mono-tech text-[10px] text-slate-500">
            FACILITIES_PREPARED: 100% ONLINE
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono-tech text-purple-400 uppercase">Phase 04</span>
            <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">Call To Action</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Students, researchers, and creators: step forward. Your unique perspective is the missing
              variable needed to stabilize our timeline.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900">
            <button
              onClick={onJoinClick}
              className="text-xs font-mono-tech font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>CLAIM RECRUIT DOSSIER</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
