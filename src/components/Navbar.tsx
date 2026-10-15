import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Shield,
  Bot,
  User,
  Lock,
  Menu,
  X,
  Sparkles,
  Palette,
} from 'lucide-react';

interface NavbarProps {
  currentUser: FirebaseUser | null;
  onOpenBriefing: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenTheme: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenBriefing,
  onOpenAuth,
  onOpenAdmin,
  onOpenTheme,
  onNavigateToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (id: string) => {
    onNavigateToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#060814]/95 border-b border-slate-800/80 backdrop-blur-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Insignia */}
          <div
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-950/50">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-white text-base tracking-wider">
                  DOOMSDAY
                </span>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  2026
                </span>
              </div>
              <p className="text-[10px] font-mono-tech text-slate-400 tracking-wider">
                CAMPUS ASSEMBLY
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-mono-tech uppercase">
            <button
              onClick={() => handleNavClick('story')}
              className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              The Anomaly
            </button>
            <button
              onClick={() => handleNavClick('missions')}
              className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Missions
            </button>
            <button
              onClick={() => handleNavClick('roles')}
              className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Squad Roles
            </button>
            <button
              onClick={() => handleNavClick('assemble')}
              className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Register
            </button>
            <button
              onClick={() => handleNavClick('faqs')}
              className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Intel FAQ
            </button>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme / Color Studio Button */}
            <button
              onClick={onOpenTheme}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-purple-400 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer hover:border-purple-500/50"
              title="Open Color Studio & WCAG Customizer"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span>THEME</span>
            </button>

            {/* AI Briefing Button */}
            <button
              onClick={onOpenBriefing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer hover:border-cyan-500/50"
              title="Open Tactical AI Briefing"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI BRIEFING</span>
            </button>

            {/* User Profile / Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentUser
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-slate-600'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentUser ? (currentUser.displayName || 'RECRUIT PROFILE') : 'RECRUIT LOGIN'}</span>
            </button>

            {/* Organizer Clearance Button */}
            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Organizer Staff Command Center"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500/80" />
              <span className="hidden md:inline">STAFF</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenBriefing}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
              aria-label="AI Briefing"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-slate-800/80 bg-[#080c1d] space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech uppercase">
            <button
              onClick={() => handleNavClick('story')}
              className="p-2.5 rounded-lg bg-slate-900 text-left text-slate-200"
            >
              The Anomaly
            </button>
            <button
              onClick={() => handleNavClick('missions')}
              className="p-2.5 rounded-lg bg-slate-900 text-left text-slate-200"
            >
              Missions
            </button>
            <button
              onClick={() => handleNavClick('roles')}
              className="p-2.5 rounded-lg bg-slate-900 text-left text-slate-200"
            >
              Squad Roles
            </button>
            <button
              onClick={() => handleNavClick('assemble')}
              className="p-2.5 rounded-lg bg-slate-900 text-left text-slate-200"
            >
              Register
            </button>
            <button
              onClick={() => handleNavClick('faqs')}
              className="col-span-2 p-2.5 rounded-lg bg-slate-900 text-left text-slate-200"
            >
              Intel FAQ
            </button>
          </div>

          <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-cyan-300 text-xs font-mono-tech flex items-center justify-center gap-2 border border-slate-700"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>{currentUser ? 'MY RECRUIT PROFILE' : 'STUDENT RECRUIT LOGIN'}</span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900/60 text-amber-300 text-xs font-mono-tech flex items-center justify-center gap-2 border border-slate-800"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>ORGANIZER STAFF CONSOLE</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
