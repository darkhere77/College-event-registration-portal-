import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidHexColor,
  hexToRgb,
  calculateRelativeLuminance,
  calculateContrastRatio,
  evaluateWCAG,
  suggestAccessibleColor,
} from './colorAccessibility.ts';

test('isValidHexColor validates hex format accurately', () => {
  assert.equal(isValidHexColor('#fff'), true);
  assert.equal(isValidHexColor('#050710'), true);
  assert.equal(isValidHexColor('#38bdf8'), true);
  assert.equal(isValidHexColor('rgb(0,0,0)'), false);
  assert.equal(isValidHexColor('#12345'), false);
  assert.equal(isValidHexColor('javascript:alert(1)'), false);
});

test('hexToRgb converts correctly', () => {
  const rgb = hexToRgb('#ffffff');
  assert.deepEqual(rgb, { r: 255, g: 255, b: 255 });

  const black = hexToRgb('#000');
  assert.deepEqual(black, { r: 0, g: 0, b: 0 });
});

test('calculateContrastRatio calculates 21:1 for pure black and white', () => {
  const ratio = calculateContrastRatio('#ffffff', '#000000');
  assert.equal(ratio, 21);
});

test('evaluateWCAG detects compliant and failing pairs', () => {
  // White on dark cosmic navy
  const highContrast = evaluateWCAG('#ffffff', '#050710');
  assert.equal(highContrast.isAccessible, true);
  assert.equal(highContrast.score, 'AAA');

  // Low contrast gray on dark
  const lowContrast = evaluateWCAG('#1e293b', '#050710');
  assert.equal(lowContrast.isAccessible, false);
  assert.equal(lowContrast.score, 'FAIL');
});

test('suggestAccessibleColor suggests light tint for dark background', () => {
  const suggestion = suggestAccessibleColor('#111827', '#050710');
  assert.equal(suggestion, '#f8fafc');
});
