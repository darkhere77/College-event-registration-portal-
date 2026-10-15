/**
 * Color accessibility calculations and WCAG 2.1 contrast evaluation utilities.
 * Decoupled pure logic for unit testing.
 */

export interface WCAGReport {
  ratio: number;
  score: 'AAA' | 'AA' | 'FAIL';
  largeScore: 'AAA' | 'AA' | 'FAIL';
  isAccessible: boolean;
  message: string;
}

/**
 * Validates a standard 3 or 6 digit hex color code.
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex.trim());
}

/**
 * Converts a hex string (#fff or #ffffff) to RGB components [0-255].
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null;

  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map(char => char + char)
      .join('');
  }

  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Computes the relative luminance of an sRGB color per WCAG 2.1 specification.
 */
export function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG contrast ratio between two hex colors.
 * Returns a value between 1.0 (identical) and 21.0 (black vs white).
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);

  if (!fgRgb || !bgRgb) return 1.0;

  const lum1 = calculateRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const lum2 = calculateRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return parseFloat(ratio.toFixed(2));
}

/**
 * Generates an accessibility report for a foreground and background pair.
 */
export function evaluateWCAG(fgHex: string, bgHex: string): WCAGReport {
  const ratio = calculateContrastRatio(fgHex, bgHex);

  let score: 'AAA' | 'AA' | 'FAIL' = 'FAIL';
  let largeScore: 'AAA' | 'AA' | 'FAIL' = 'FAIL';

  if (ratio >= 7.0) {
    score = 'AAA';
    largeScore = 'AAA';
  } else if (ratio >= 4.5) {
    score = 'AA';
    largeScore = 'AAA';
  } else if (ratio >= 3.0) {
    score = 'FAIL';
    largeScore = 'AA';
  }

  const isAccessible = ratio >= 4.5;
  const message = isAccessible
    ? `Contrast ratio of ${ratio}:1 complies with WCAG AA standard.`
    : `Warning: Contrast ratio of ${ratio}:1 is below the WCAG AA minimum of 4.5:1 for body text.`;

  return {
    ratio,
    score,
    largeScore,
    isAccessible,
    message,
  };
}

/**
 * Recommends an accessible alternative shade (lighter or darker) when contrast fails.
 */
export function suggestAccessibleColor(fgHex: string, bgHex: string): string {
  const bgRgb = hexToRgb(bgHex);
  if (!bgRgb) return '#ffffff';

  const bgLum = calculateRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // If background is dark (luminance < 0.5), recommend a crisp light tint
  if (bgLum < 0.5) {
    return '#f8fafc';
  } else {
    // If background is light, recommend a high-contrast dark tint
    return '#090d1e';
  }
}
