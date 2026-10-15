import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ConfirmedRegistration } from './RegistrationForm';
import { EventConfig } from '../config/eventConfig';
import { createGoogleCalendarUrl } from '../utils/registrationRules';
import {
  CheckCircle2,
  Calendar,
  Download,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { HERO_CHARACTERS } from '../assets/heroAvatars';
import { HeroPowerType } from './HeroPowerEffectOverlay';

interface ConfirmationViewProps {
  registration: ConfirmedRegistration;
  config: EventConfig;
  onReset: () => void;
  onTriggerPower?: (power: HeroPowerType) => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  registration,
  config,
  onReset,
  onTriggerPower,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    // Confetti celebratory burst on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // Graceful fallback if confetti unavailable
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration.confirmationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareCard = () => {
    // Privacy-safe share text (strictly excludes email, phone, student ID)
    const shareText = `I just assembled as a Tactical ${registration.squadRole} for "${registration.eventName}" at ${config.collegeName}! Join the campus assembly: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: 'Avengers: Doomsday Campus Assembly',
        text: shareText,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const googleCalUrl = createGoogleCalendarUrl(
    `${config.eventName} — ${registration.eventName}`,
    `Reporting for ${registration.squadRole} role. Dispatch Code: ${registration.confirmationCode}. Venue: ${config.venueDisplay}`,
    config.venueDisplay,
    config.eventStartDateISO,
    config.eventEndDateISO
  );

  const downloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Campus Assembly//Recruit Pass//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${config.eventName}: ${registration.eventName}`,
      `DESCRIPTION:Tactical ${registration.squadRole} deployment. Code: ${registration.confirmationCode}`,
      `LOCATION:${config.venueDisplay}`,
      `DTSTART:20261024T090000Z`,
      `DTEND:20261025T200000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Campus_Assembly_${registration.confirmationCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-[#080d1e] border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[500px] h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        {/* Header Celebration */}
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono-tech mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>DISPATCH CONFIRMED & LOGGED</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-wide">
            YOU’RE ON THE ROSTER.
          </h2>

          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Your recruitment credentials have been registered in the campus defense ledger. Keep your
            dispatch pass ready for checkpoint verification.
          </p>
        </div>

        {/* Digital Recruit Pass Card (Sci-Fi Ticket Aesthetic) */}
        <div className="relative bg-[#0c1328] border-2 border-slate-700/80 rounded-2xl p-6 sm:p-8 mb-8 overflow-hidden">
          {/* Side cutouts for physical pass effect */}
          <div className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#080d1e] border-r-2 border-slate-700/80" />
          <div className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#080d1e] border-l-2 border-slate-700/80" />

          {/* Pass Header with 2D Guardian Avatar */}
          {(() => {
            const hero = HERO_CHARACTERS[registration.squadRole];
            return (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 mb-5 gap-4">
                <div className="flex items-center gap-4">
                  {hero && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-950/50 shrink-0">
                      <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-mono-tech uppercase text-cyan-400 flex items-center gap-1.5">
                      <span>Official Recruit Credential</span>
                      {hero && <span className="text-amber-400 font-bold">• {hero.heroAlias}</span>}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white">{registration.fullName}</h3>
                    <p className="text-xs text-slate-400">
                      {registration.department} • {registration.yearOfStudy}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-mono-tech text-slate-400">ROLE:</span>
                    <span className="text-xs font-mono-tech font-bold text-amber-300 uppercase">
                      {registration.squadRole}
                    </span>
                  </div>

                  {hero && onTriggerPower && (
                    <button
                      onClick={() => onTriggerPower(hero.powerName)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-cyan-950/50"
                      title="Activate your guardian character power across the screen"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>UNLEASH POWER</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-slate-400 block mb-1">ASSIGNED MISSION</span>
              <span className="text-cyan-300 font-bold text-sm block">{registration.eventName}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-slate-400 block mb-1">CAMPUS VENUE</span>
              <span className="text-slate-100 font-medium text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{config.venueDisplay}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-slate-400 block mb-1">MISSION DATES</span>
              <span className="text-slate-100 font-medium text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{config.eventDateDisplay}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-slate-400 block mb-1">DISPATCH CODE</span>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-mono-tech font-bold text-sm tracking-wider">
                  {registration.confirmationCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Copy dispatch code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mock Barcode for authentic ticket badge */}
          <div className="pt-4 border-t border-dashed border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono-tech text-[10px] text-slate-500 tracking-widest text-center sm:text-left">
              ||| | ||||| || |||||| | |||| ||| ||||||| ||| |||| || |||
              <br />
              SECURE_RECRUIT_HASH_{registration.confirmationCode.replace(/-/g, '_')}
            </div>
            <div className="text-[11px] font-mono-tech text-emerald-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>STATUS: CONFIRMED ENROLLED</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Calendar & Safe Share) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>ADD TO GOOGLE CALENDAR</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={downloadIcs}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>DOWNLOAD .ICS CALENDAR</span>
          </button>

          <button
            onClick={handleShareCard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Share2 className="w-4 h-4 text-slate-950" />
            <span>{copiedShare ? 'SHARE COPIED!' : 'SHARE RECRUIT STATUS'}</span>
          </button>
        </div>

        {/* Next Steps Guidance */}
        <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 text-xs text-slate-300">
          <p className="font-mono-tech text-cyan-400 uppercase text-[11px] font-bold mb-2">
            NEXT STEPS FOR RECRUITS
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300">
            <li>Screenshot or bookmark this recruit pass with your code: <strong>{registration.confirmationCode}</strong>.</li>
            <li>Arrive 20 minutes prior to mission start at {config.venueDisplay}.</li>
            <li>Direct any mission logistical questions to: <strong>{config.contactEmail}</strong>.</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onReset}
            className="text-xs font-mono-tech text-slate-400 hover:text-cyan-400 transition-colors underline cursor-pointer"
          >
            Register another recruit or modify squad
          </button>
        </div>
      </div>
    </section>
  );
};
