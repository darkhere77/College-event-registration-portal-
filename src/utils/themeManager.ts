/**
 * Real-time Theme & Color Customization Manager using CSS variables.
 * Enables live UI customization across background, surfaces, buttons, text, borders, and page typography.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
}

export interface ThemeSettings extends ThemeColors {
  fontScale: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'Dark' | 'Light' | 'Vibrant' | 'Pastel';
  colors: ThemeColors;
}

export const DEFAULT_THEME: ThemeColors = {
  background: '#050710',
  surface: '#0a0f24',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  primary: '#06b6d4', // Cyan 500
  primaryText: '#020617', // Near-black for contrast
  accent: '#38bdf8', // Sky 400
  border: '#1e293b', // Slate 800
};

export const DEFAULT_FONT_SCALE = 1;
const MIN_FONT_SCALE = 0.85;
const MAX_FONT_SCALE = 1.4;

export function normalizeThemeSettings(input: Partial<ThemeSettings> | ThemeColors): ThemeSettings {
  const colors = { ...DEFAULT_THEME, ...(input || {}) } as ThemeColors;
  const rawScale = Number((input as Partial<ThemeSettings>)?.fontScale ?? DEFAULT_FONT_SCALE);
  const safeScale = Number.isFinite(rawScale)
    ? Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, rawScale))
    : DEFAULT_FONT_SCALE;

  return {
    ...colors,
    fontScale: safeScale,
  };
}

export const PRESET_THEMES: ThemePreset[] = [
  {
    id: 'quantum-midnight',
    name: 'Quantum Midnight (Default)',
    description: 'Deep cosmic obsidian with electric cyan tactical energy',
    category: 'Dark',
    colors: DEFAULT_THEME,
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon & High Voltage',
    description: 'Ultra-saturated cyber blue and violet battle arena palette',
    category: 'Vibrant',
    colors: {
      background: '#030712',
      surface: '#0b1329',
      text: '#f8fafc',
      textMuted: '#64748b',
      primary: '#00f0ff',
      primaryText: '#020617',
      accent: '#818cf8',
      border: '#1e294f',
    },
  },
  {
    id: 'solar-gold-crimson',
    name: 'Solar Gold & Anomaly Crimson',
    description: 'Warm regal gold paired with tachyon crimson for leadership squads',
    category: 'Vibrant',
    colors: {
      background: '#0c0812',
      surface: '#170f24',
      text: '#fef3c7',
      textMuted: '#d97706',
      primary: '#f59e0b',
      primaryText: '#0f0a02',
      accent: '#f43f5e',
      border: '#3b1c3b',
    },
  },
  {
    id: 'campus-daylight',
    name: 'Campus Daylight (Light Mode)',
    description: 'Clean academic light theme with high contrast blue accents',
    category: 'Light',
    colors: {
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textMuted: '#475569',
      primary: '#0284c7',
      primaryText: '#ffffff',
      accent: '#0369a1',
      border: '#cbd5e1',
    },
  },
  {
    id: 'aurora-pastel',
    name: 'Multiverse Aurora Pastel',
    description: 'Dreamy lavender, soft cyan, and rose celestial variant',
    category: 'Pastel',
    colors: {
      background: '#0f0f1c',
      surface: '#191830',
      text: '#f1f0f9',
      textMuted: '#a5a4c4',
      primary: '#c084fc',
      primaryText: '#180728',
      accent: '#2dd4bf',
      border: '#2c2950',
    },
  },
  {
    id: 'matrix-emerald',
    name: 'Emerald Matrix Protocol',
    description: 'Terminal tactical green for code sprints and security operatives',
    category: 'Dark',
    colors: {
      background: '#020d08',
      surface: '#061a11',
      text: '#ecfdf5',
      textMuted: '#6ee7b7',
      primary: '#10b981',
      primaryText: '#022c22',
      accent: '#34d399',
      border: '#133e2b',
    },
  },
];

const STORAGE_KEY = 'campus_assembly_theme_colors';

/**
 * Applies dynamic CSS variables directly onto document.documentElement in real time.
 */
export function applyTheme(colors: ThemeColors | ThemeSettings) {
  if (typeof document === 'undefined') return;
  const normalized = normalizeThemeSettings(colors as Partial<ThemeSettings>);
  const root = document.documentElement;

  root.style.setProperty('--portal-bg', normalized.background);
  root.style.setProperty('--portal-surface', normalized.surface);
  root.style.setProperty('--portal-text', normalized.text);
  root.style.setProperty('--portal-text-muted', normalized.textMuted);
  root.style.setProperty('--portal-primary', normalized.primary);
  root.style.setProperty('--portal-primary-text', normalized.primaryText);
  root.style.setProperty('--portal-accent', normalized.accent);
  root.style.setProperty('--portal-border', normalized.border);
  root.style.setProperty('--portal-font-scale', normalized.fontScale.toString());
  root.style.fontSize = `${16 * normalized.fontScale}px`;

  // Sync body background and text
  document.body.style.backgroundColor = normalized.background;
  document.body.style.color = normalized.text;
}

/**
 * Loads the saved palette and applies it immediately during app startup.
 */
export function initializeTheme(): ThemeSettings {
  const theme = loadSavedTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Saves customized theme to localStorage.
 */
export function saveTheme(colors: ThemeColors | ThemeSettings) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeThemeSettings(colors as Partial<ThemeSettings>)));
}

/**
 * Loads saved theme preferences or falls back to default.
 */
export function loadSavedTheme(): ThemeSettings {
  if (typeof localStorage === 'undefined') return normalizeThemeSettings(DEFAULT_THEME);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeThemeSettings(DEFAULT_THEME);
  try {
    const parsed = JSON.parse(raw);
    return normalizeThemeSettings(parsed);
  } catch (e) {
    return normalizeThemeSettings(DEFAULT_THEME);
  }
}

/**
 * Resets all theme variables to default sci-fi dark palette.
 */
export function resetTheme(): ThemeSettings {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  const defaultTheme = normalizeThemeSettings(DEFAULT_THEME);
  applyTheme(defaultTheme);
  return defaultTheme;
}
