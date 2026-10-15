import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THEME, initializeTheme } from './themeManager.ts';

test('initializeTheme applies saved palette on startup', () => {
  const styleEntries: Record<string, string> = {};
  const root = {
    style: {
      setProperty: (name: string, value: string) => {
        styleEntries[name] = value;
      },
    },
  };

  const body = {
    style: {},
  };

  const storage: Record<string, string> = {
    campus_assembly_theme_colors: JSON.stringify({
      ...DEFAULT_THEME,
      primary: '#ff0000',
      accent: '#00ff00',
      border: '#0000ff',
    }),
  };

  Object.defineProperty(globalThis, 'document', {
    value: {
      documentElement: root,
      body,
    },
    configurable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    },
    configurable: true,
  });

  const result = initializeTheme();

  assert.equal(result.primary, '#ff0000');
  assert.equal(styleEntries['--portal-primary'], '#ff0000');
  assert.equal(styleEntries['--portal-accent'], '#00ff00');
  assert.equal(styleEntries['--portal-border'], '#0000ff');
});
