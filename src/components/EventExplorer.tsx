import React, { useState } from 'react';
import { EventMission } from '../config/eventConfig';
import { getMissionManifestation } from '../assets/heroAvatars';
import { HeroPowerType } from './HeroPowerEffectOverlay';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronRight,
  Check,
  Zap,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface EventExplorerProps {
  missions: EventMission[];
  selectedMissionId: string;
  onSelectMission: (missionId: string) => void;
  onTriggerPower?: (power: HeroPowerType) => void;
}

export const EventExplorer: React.FC<EventExplorerProps> = ({
  missions,
  selectedMissionId,
  onSelectMission,
  onTriggerPower,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Technology',
    'Arts & Design',
    'Esports',
    'Workshops',
    'Team Challenges',
    'Quizzes',
    'Cosplay',
    'Music',
  ];

  const filteredMissions = missions.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="missions" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-cyan-400 text-xs font-mono-tech mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>TACTICAL ENGAGEMENTS & POWER MANIFESTATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            MISSION DIRECTORY
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl">
            Choose your arena of deployment. Hover over any mission card to trigger its elemental
            power manifestation or unleash its hero guardian power across the screen.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <label htmlFor="mission-search" className="sr-only">
            Search missions
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="mission-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search missions, venues..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-mono-tech uppercase font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mission Cards Grid with Hover Power Manifestations and 2D Character Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMissions.map(mission => {
          const isSelected = selectedMissionId === mission.id;
          const percentFilled = Math.min(
            100,
            Math.round((mission.filledSeats / mission.totalSeats) * 100)
          );
          const manifest = getMissionManifestation(mission.category);
          const hero = manifest.hero;

          return (
            <div
              key={mission.id}
              className={`rounded-2xl border flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                manifest.manifestationClass
              } ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-500/30 shadow-2xl shadow-cyan-950/40'
                  : 'bg-slate-950/85 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <div>
                {/* 2D Character Guardian Header Banner */}
                <div className="relative w-full h-40 overflow-hidden border-b border-slate-800/80 bg-slate-900">
                  <img
                    src={hero.image}
                    alt={`${hero.name} - ${hero.heroAlias}`}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Cosmic Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-[#070b19]/60 to-transparent" />

                  {/* Category & Badge Code */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono-tech text-white bg-slate-950/85 px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-sm">
                      {mission.category}
                    </span>
                    <span className="text-[10px] font-mono-tech text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                      {mission.badgeCode}
                    </span>
                  </div>

                  {/* Character Patron & Power Manifestation Pill */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-mono-tech text-slate-300 uppercase tracking-wide">
                        GUARDIAN: <span className="text-white font-bold">{hero.heroAlias}</span>
                      </p>
                      <p className={`text-[10px] font-mono-tech font-bold ${manifest.elementalColor}`}>
                        {manifest.effectBadge}
                      </p>
                    </div>

                    {/* Interactive Power Manifest Trigger Button */}
                    {onTriggerPower && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onTriggerPower(hero.powerName);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0a0f26]/90 hover:bg-cyan-950 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-[10px] font-mono-tech font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-950/50"
                        title={`Unleash ${hero.powerTitle}`}
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>UNLEASH</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-white mb-2 leading-snug">
                    {mission.name}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {mission.shortDescription}
                  </p>

                  {/* Character Quote Insight */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-5">
                    <p className="text-xs italic text-slate-300 line-clamp-2">
                      "{hero.quote}"
                    </p>
                  </div>

                  {/* Logistics Info List */}
                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-900 pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{mission.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{mission.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Squad: {mission.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{mission.eligibility}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0">
                {/* Capacity Roster Meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-mono-tech text-slate-400 mb-1">
                    <span>Roster Capacity</span>
                    <span>
                      {mission.filledSeats} / {mission.totalSeats} Recruits ({percentFilled}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percentFilled > 85 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Choose Button */}
                <button
                  onClick={() => onSelectMission(mission.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono-tech uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>MISSION SELECTED</span>
                    </>
                  ) : (
                    <>
                      <span>CHOOSE THIS MISSION</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12 bg-slate-950/60 border border-slate-900 rounded-2xl">
          <p className="text-slate-400 font-mono-tech text-sm">
            NO ACTIVE MISSIONS MATCH YOUR QUERY. TRY RESETTING CATEGORY FILTERS.
          </p>
        </div>
      )}
    </section>
  );
};
