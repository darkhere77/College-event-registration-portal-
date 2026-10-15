import React, { useState } from 'react';
import { AnnouncementItem } from './AdminPortal';
import { Megaphone, AlertCircle, X, ChevronRight } from 'lucide-react';

interface AnnouncementsTickerProps {
  announcements: AnnouncementItem[];
  onOpenAnnouncements?: () => void;
}

export const AnnouncementsTicker: React.FC<AnnouncementsTickerProps> = ({
  announcements,
  onOpenAnnouncements,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || announcements.length === 0) return null;

  const latest = announcements[0];

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3 relative z-30">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-tech uppercase font-bold shrink-0 text-[10px] border border-amber-500/40">
          <Megaphone className="w-3 h-3" />
          <span>{latest.priority} DIRECTIVE</span>
        </span>
        <span className="truncate font-medium text-slate-200">
          <strong>{latest.title}:</strong> {latest.content}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {announcements.length > 1 && (
          <span className="hidden sm:inline font-mono-tech text-[10px] text-slate-400">
            +{announcements.length - 1} more
          </span>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          aria-label="Dismiss announcement banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
