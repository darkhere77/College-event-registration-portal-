import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegistration,
  generateDispatchCode,
  calculateTimeRemaining,
  createGoogleCalendarUrl,
} from './registrationRules.ts';

test('validateRegistration rejects empty input', () => {
  const result = validateRegistration({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.collegeEmail);
  assert.ok(result.errors.studentId);
  assert.ok(result.errors.rulesAgreed);
});

test('validateRegistration rejects invalid email format', () => {
  const result = validateRegistration({
    fullName: 'Peter Parker',
    collegeEmail: 'notanemail',
    studentId: 'ST-9021',
    department: 'Physics',
    yearOfStudy: '3rd Year',
    eventId: 'TECH_ANOMALY_HACK',
    eventName: 'Quantum Anomaly Hackathon',
    squadRole: 'Engineer',
    rulesAgreed: true,
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.collegeEmail.includes('valid'));
});

test('validateRegistration accepts complete valid recruit data', () => {
  const result = validateRegistration({
    fullName: 'Tony Stark',
    collegeEmail: 'tstark@mit.campus.edu',
    phone: '+1 555 019 4488',
    studentId: 'ST-0001',
    department: 'Robotics & AI',
    yearOfStudy: '4th Year',
    eventId: 'TECH_ANOMALY_HACK',
    eventName: 'Quantum Anomaly Hackathon',
    squadRole: 'Engineer',
    teamName: 'Iron Vanguard',
    teammates: 'Rhodey, Pepper',
    dietaryOrAccess: 'Vegan energy rations',
    rulesAgreed: true,
  });
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('generateDispatchCode produces formatted code with role suffix', () => {
  const code = generateDispatchCode('Strategist');
  assert.ok(code.startsWith('ASSEMBLY-'));
  assert.ok(code.endsWith('-STR'));
});

test('calculateTimeRemaining returns countdown components for future date', () => {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
  const res = calculateTimeRemaining(future);
  assert.equal(res.isExpired, false);
  assert.ok(res.days >= 1);
});

test('createGoogleCalendarUrl formats correct Google Calendar URL', () => {
  const url = createGoogleCalendarUrl(
    'Avengers Assembly',
    'Tactical briefing',
    'Main Quad',
    '2026-10-24T09:00:00Z',
    '2026-10-25T18:00:00Z'
  );
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
  assert.ok(url.includes('Avengers+Assembly') || url.includes('Avengers%20Assembly'));
});
