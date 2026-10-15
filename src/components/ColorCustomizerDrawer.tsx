import React, { useState, useEffect } from 'react';
import {
  ThemeColors,
  DEFAULT_THEME,
  PRESET_THEMES,
  applyTheme,
  saveTheme,
  resetTheme,
} from '../utils/themeManager';
import {
  evaluateWCAG,
  suggestAccessibleColor,
  isValidHexColor,
} from '../utils/colorAccessibility';
import {
  Palette,
  X,
  RotateCcw,
  Check,
  AlertTriangle,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  Eye,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ColorCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColorCustomizerDrawer: React.FC<ColorCustomizerDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentColors, setCurrentColors] = useState<ThemeColors>(DEFAULT_THEME);
  const [activePresetId, setActivePresetId] = useState<string>('quantum-midnight');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    // Load persisted theme on mount
    const saved = localStorage.getItem('campus_assembly_theme_colors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentColors(parsed);
        applyTheme(parsed);
      } catch (e) {}
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  const handleColorChange = (key: keyof ThemeColors, hexVal: string) => {
    const updated = { ...currentColors, [key]: hexVal };
    setCurrentColors(updated);
    applyTheme(updated);
    setActivePresetId('custom');
  };

  const handleSelectPreset = (preset: typeof PRESET_THEMES[0]) => {
    setActivePresetId(preset.id);
    setCurrentColors(preset.colors);
    applyTheme(preset.colors);
    saveTheme(preset.colors);
  };

  const handleSave = () => {
    saveTheme(currentColors);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    const def = resetTheme();
    setCurrentColors(def);
    setActivePresetId('quantum-midnight');
  };

  // WCAG evaluations
  const textContrast = evaluateWCAG(currentColors.text, currentColors.background);
  const buttonContrast = evaluateWCAG(currentColors.primaryText, currentColors.primary);

  const handleAutoFixTextContrast = () => {
    const fixed = suggestAccessibleColor(currentColors.text, currentColors.background);
    handleColorChange('text', fixed);
  };

  const handleAutoFixButtonContrast = () => {
    const fixed = suggestAccessibleColor(currentColors.primaryText, currentColors.primary);
    handleColorChange('primaryText', fixed);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-studio-title"
    >
      <div className="w-full max-w-md bg-[#090e24] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b122e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-studio-title" className="text-sm font-display font-bold text-white flex items-center gap-2">
                <span>UI COLOR STUDIO</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Live Contrast & Accessibility Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Color Customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Accessibility Guard Panel */}
          <div className="p-4 rounded-2xl bg-[#0c1430] border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-cyan-400 font-bold flex items-center gap-1.5 uppercase text-[11px]">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>WCAG 2.1 Contrast Telemetry</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono-tech">ISO/IEC Compliant</span>
            </div>

            {/* Check 1: Body Text on Background */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">Body Text on Background</span>
                <span className="text-[11px] font-mono-tech text-slate-400">
                  Ratio: {textContrast.ratio}:1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono-tech text-[10px] font-bold ${
                    textContrast.isAccessible
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {textContrast.score}
                </span>
                {!textContrast.isAccessible && (
                  <button
                    onClick={handleAutoFixTextContrast}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer"
                  >
                    Auto-Fix
                  </button>
                )}
              </div>
            </div>

            {/* Check 2: Button Text on Button Background */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-semibold block">Button Text on CTA</span>
                <span className="text-[11px] font-mono-tech text-slate-400">
                  Ratio: {buttonContrast.ratio}:1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono-tech text-[10px] font-bold ${
                    buttonContrast.isAccessible
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {buttonContrast.score}
                </span>
                {!buttonContrast.isAccessible && (
                  <button
                    onClick={handleAutoFixButtonContrast}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer"
                  >
                    Auto-Fix
                  </button>
                )}
              </div>
            </div>

            {(!textContrast.isAccessible || !buttonContrast.isAccessible) && (
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Selected colors may impair readability for recruits with visual sensitivities.</span>
              </div>
            )}
          </div>

          {/* Predefined Palettes */}
          <div>
            <h3 className="text-xs font-mono-tech uppercase text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Brand Theme Palettes</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_THEMES.map(preset => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/30 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.background }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.accent }}
                        />
                      </div>
                      <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-mono-tech text-cyan-400 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Color Pickers */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono-tech uppercase text-slate-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Granular Element Controls</span>
            </h3>

            {[
              { label: 'Page Background', key: 'background' as const },
              { label: 'Card Surface', key: 'surface' as const },
              { label: 'Primary Action / Button', key: 'primary' as const },
              { label: 'Button Text', key: 'primaryText' as const },
              { label: 'Body Text', key: 'text' as const },
              { label: 'Accent & Badges', key: 'accent' as const },
              { label: 'Borders & Grid Lines', key: 'border' as const },
            ].map(item => (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    id={`color-picker-${item.key}`}
                    aria-label={`Color picker for ${item.label}`}
                    value={currentColors[item.key]}
                    onChange={e => handleColorChange(item.key, e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <div>
                    <label htmlFor={`color-picker-${item.key}`} className="font-semibold text-slate-200 block cursor-pointer">
                      {item.label}
                    </label>
                    <span className="text-[10px] font-mono-tech text-slate-400 uppercase">
                      {currentColors[item.key]}
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  value={currentColors[item.key]}
                  onChange={e => {
                    const val = e.target.value;
                    if (isValidHexColor(val) || val.startsWith('#')) {
                      handleColorChange(item.key, val);
                    }
                  }}
                  className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-100 font-mono-tech text-xs text-center focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#0a0f26] flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULT</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedNotice ? 'SAVED TO BROWSER!' : 'SAVE PREFERENCES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
