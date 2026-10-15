import React from 'react';
import { Shield, Sparkles, ArrowUp, Heart, Terminal } from 'lucide-react';
import { EventConfig } from '../config/eventConfig';

interface FooterProps {
  config: EventConfig;
  onRegisterClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onRegisterClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#04060e] border-t border-slate-900 pt-20 pb-12 relative overflow-hidden">
      {/* FINAL CREATIVE MOMENT SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono-tech mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>ALL TIMELINES CONVERGE HERE</span>
        </div>

        <blockquote className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-wide leading-tight mb-8">
          “THE FUTURE ISN’T SAVED BY ONE HERO. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
            IT’S BUILT BY ALL OF US.”
          </span>
        </blockquote>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          The recruitment roster remains open. Join your fellow students, engineers, artists, and
          strategists on the campus assembly grounds.
        </p>

        <button
          onClick={onRegisterClick}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-base font-display tracking-wider shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          REGISTER NOW FOR ASSEMBLY
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-white tracking-wider">
                AVENGERS: DOOMSDAY — CAMPUS ASSEMBLY
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              An immersive collegiate event uniting multidisciplinary students across hackathons,
              speculative design, esports championships, AI defense workshops, and campus-wide tactical challenges.
            </p>
            <p className="text-xs font-mono-tech text-cyan-400">
              {config.collegeName} • {config.edition}
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-mono-tech uppercase text-slate-300 font-bold mb-3">
              Mission Arenas
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono-tech">
              <li>Quantum Anomaly Hack</li>
              <li>Multiverse Design Forge</li>
              <li>Chronos Esports Showdown</li>
              <li>AI Defense Masterclass</li>
              <li>Strike Challenge Hunt</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-mono-tech uppercase text-slate-300 font-bold mb-3">
              Logistics & Venue
            </h4>
            <p className="text-xs text-slate-400 mb-1">{config.venueDisplay}</p>
            <p className="text-xs text-slate-500 mb-3">{config.venueAddress}</p>
            <p className="text-xs text-slate-400">
              Direct Inquiries: <br />
              <a href={`mailto:${config.contactEmail}`} className="text-cyan-400 hover:underline">
                {config.contactEmail}
              </a>
            </p>
          </div>
        </div>

        {/* Legal Fan-Event Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-[11px] text-slate-500 leading-relaxed mb-8">
          <strong>Fan Event Disclaimer:</strong> “Avengers: Doomsday — Campus Assembly” is an original,
          non-commercial fan-inspired university event produced by the student council, innovation labs, and
          faculty mentors at {config.collegeName}. This event is not sponsored by, endorsed by, or affiliated
          with Marvel Studios, The Walt Disney Company, or any of their affiliates. All original artwork,
          lore briefs, and logos are created for educational and community celebration purposes.
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech text-slate-500">
          <div>
            © 2026 {config.collegeName}. Designed with Zero-PII Exposure Protocol.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
