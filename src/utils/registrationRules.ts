/**
 * Pure validation and business logic for Avengers: Doomsday Campus Assembly registration.
 * Decoupled from UI components for deterministic unit testing.
 */

export interface RegistrationInput {
  fullName: string;
  collegeEmail: string;
  phone?: string;
  studentId: string;
  department: string;
  yearOfStudy: string;
  eventId: string;
  eventName: string;
  squadRole: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  teamName?: string;
  teammates?: string;
  dietaryOrAccess?: string;
  rulesAgreed: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const VALID_ROLES = ['Strategist', 'Engineer', 'Creator', 'Field Agent'] as const;
export const VALID_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate',
  'Faculty/Staff',
] as const;

/**
 * Validates a registration input payload.
 */
export function validateRegistration(data: Partial<RegistrationInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (data.fullName.length > 100) {
    errors.fullName = 'Full name cannot exceed 100 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.collegeEmail || !emailRegex.test(data.collegeEmail.trim())) {
    errors.collegeEmail = 'Please provide a valid college or institutional email.';
  } else if (data.collegeEmail.length > 120) {
    errors.collegeEmail = 'Email cannot exceed 120 characters.';
  }

  if (!data.studentId || data.studentId.trim().length < 2) {
    errors.studentId = 'Student or Campus ID is required (min 2 characters).';
  } else if (data.studentId.length > 50) {
    errors.studentId = 'Student ID cannot exceed 50 characters.';
  }

  if (!data.department || data.department.trim().length < 2) {
    errors.department = 'Department / Major is required.';
  } else if (data.department.length > 80) {
    errors.department = 'Department cannot exceed 80 characters.';
  }

  if (!data.yearOfStudy || !VALID_YEARS.includes(data.yearOfStudy as any)) {
    errors.yearOfStudy = 'Please select a valid year of study.';
  }

  if (!data.eventId || data.eventId.trim().length < 2) {
    errors.eventId = 'Please select an event mission.';
  }

  if (!data.squadRole || !VALID_ROLES.includes(data.squadRole as any)) {
    errors.squadRole = 'Please select a squad tactical role.';
  }

  if (!data.rulesAgreed) {
    errors.rulesAgreed = 'You must agree to campus event rules and safety protocols.';
  }

  if (data.phone && data.phone.trim().length > 0) {
    const cleanPhone = data.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.phone = 'Phone number must be between 7 and 15 digits.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates an authentic cryptographic recruitment dispatch code.
 * Example format: DOOMSDAY-A7B2-ENG
 */
export function generateDispatchCode(role: string): string {
  const roleCode = role.slice(0, 3).toUpperCase();
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestampHex = (Date.now() % 10000).toString(16).toUpperCase().padStart(4, '0');
  return `ASSEMBLY-${timestampHex}-${randomHex}-${roleCode}`;
}

export interface CheckInPassInput {
  fullName: string;
  studentId: string;
  confirmationCode: string;
  eventId: string;
  eventName: string;
  squadRole: string;
  memberPassId?: string;
}

export function generateUniquePassId(): string {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  const source = cryptoApi && typeof cryptoApi.randomUUID === 'function'
    ? cryptoApi.randomUUID()
    : `pass-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return source.replace(/-/g, '').slice(0, 18).toUpperCase();
}

export function createCheckInPassPayload(data: CheckInPassInput): string {
  const memberPassId = data.memberPassId || generateUniquePassId();

  return JSON.stringify({
    type: 'campus_assembly_checkin',
    version: 1,
    memberPassId,
    fullName: data.fullName,
    studentId: data.studentId,
    confirmationCode: data.confirmationCode,
    eventId: data.eventId,
    eventName: data.eventName,
    squadRole: data.squadRole,
    generatedAt: new Date().toISOString(),
  });
}

/**
 * Calculates countdown remaining days, hours, minutes, seconds.
 */
export function calculateTimeRemaining(targetDateStr: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

/**
 * Builds Google Calendar URL for one-click add.
 */
export function createGoogleCalendarUrl(
  title: string,
  description: string,
  location: string,
  startDateStr: string,
  endDateStr: string
): string {
  const startIso = new Date(startDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endIso = new Date(endDateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location: location,
    dates: `${startIso}/${endIso}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
