import React from 'react';
import { SquadRoleConfig } from '../config/eventConfig';
import { HERO_CHARACTERS } from '../assets/heroAvatars';
import { Compass, Cpu, Sparkles, Shield, CheckCircle2, Zap } from 'lucide-react';
import { HeroPowerType } from './HeroPowerEffectOverlay';

interface RoleSelectorProps {
  roles: SquadRoleConfig[];
  selectedRole: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  onSelectRole: (role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => void;
  onTriggerPower?: (power: HeroPowerType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRole,
  onSelectRole,
  onTriggerPower,
}) => {
  const handleRoleClick = (roleId: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => {
    onSelectRole(roleId);
    if (onTriggerPower) {
      const char = HERO_CHARACTERS[roleId];
      if (char) {
        onTriggerPower(char.powerName);
      }
    }
  };

  const getIcon = (roleId: string) => {
    switch (roleId) {
      case 'Strategist':
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 'Engineer':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Creator':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Field Agent':
      default:
        return <Shield className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <section id="roles" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-cyan-400 text-xs font-mono-tech mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SQUAD ARCHETYPE & GUARDIAN MATRIX</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          CHOOSE YOUR SQUAD ROLE & HERO POWER
        </h2>
        <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Select your tactical specialization. Each role is represented by an original dimensional
          guardian hero wielding signature multiverse powers that animate across your recruit HUD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map(role => {
          const isSelected = selectedRole === role.id;
          const hero = HERO_CHARACTERS[role.id];

          return (
            <div
              key={role.id}
              onClick={() => handleRoleClick(role.id)}
              className={`relative group rounded-3xl p-5 cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-500/30 shadow-2xl shadow-cyan-950/50 transform -translate-y-1'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div>
                {/* 2D Character Hero Portrait Artwork */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-4 border border-slate-850 group-hover:border-slate-700 transition-colors">
                  <img
                    src={hero.image}
                    alt={`${hero.name} - ${hero.heroAlias}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f20] via-transparent to-transparent opacity-90" />

                  {/* Hero Alias Overlay Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0f24]/85 border border-white/20 text-[10px] font-mono-tech text-white">
                    {getIcon(role.id)}
                    <span className="font-bold">{role.id}</span>
                  </div>

                  {/* Power Trigger Pill on Top-Right */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono-tech flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>TAP POWER</span>
                  </div>

                  {/* Character Name in Image Base */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-display font-bold text-base leading-tight">
                      {hero.name}
                    </p>
                    <p className="text-cyan-300 text-xs font-mono-tech">{hero.heroAlias}</p>
                  </div>
                </div>

                {/* Role Details */}
                <h3 className="text-lg font-display font-bold text-white mb-1">{role.title}</h3>
                <p className="text-xs text-amber-400 font-mono-tech mb-2 font-semibold">
                  ⚡ Power: {hero.powerTitle}
                </p>
                <p className="text-slate-300 text-xs leading-relaxed mb-4">{role.description}</p>
              </div>

              <div>
                {/* Quote */}
                <blockquote className="text-[11px] italic text-slate-400 border-l-2 border-slate-700 pl-2.5 mb-4">
                  "{hero.quote}"
                </blockquote>

                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {role.attributes.slice(0, 2).map((attr, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ASSIGNED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono-tech text-slate-500 group-hover:text-cyan-400">
                        SELECT →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
