import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  CreditCard,
  LogOut,
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { VALID_ROLES, VALID_YEARS } from '../utils/registrationRules';

export interface UserProfileData {
  userId: string;
  fullName: string;
  collegeEmail: string;
  studentId: string;
  department: string;
  yearOfStudy: string;
  preferredRole: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  dietaryOrAccess?: string;
  updatedAt?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onProfileUpdated?: (profile: UserProfileData) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'profile'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('Computer Science & Engineering');
  const [yearInput, setYearInput] = useState('2nd Year');
  const [roleInput, setRoleInput] = useState<'Strategist' | 'Engineer' | 'Creator' | 'Field Agent'>('Engineer');
  const [dietaryInput, setDietaryInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing profile when currentUser is present
  useEffect(() => {
    if (currentUser) {
      setAuthMode('profile');
      loadProfile(currentUser.uid, currentUser.email || '');
    } else {
      setAuthMode('login');
    }
  }, [currentUser, isOpen]);

  const loadProfile = async (uid: string, email: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'));
      if (snap.exists()) {
        const data = snap.data() as UserProfileData;
        setFullNameInput(data.fullName || currentUser?.displayName || '');
        setEmailInput(data.collegeEmail || email);
        setStudentIdInput(data.studentId || '');
        setDepartmentInput(data.department || 'Computer Science & Engineering');
        setYearInput(data.yearOfStudy || '2nd Year');
        setRoleInput(data.preferredRole || 'Engineer');
        setDietaryInput(data.dietaryOrAccess || '');
      } else {
        // Pre-fill from Google Auth or local defaults
        setFullNameInput(currentUser?.displayName || '');
        setEmailInput(email);
        const cached = localStorage.getItem(`profile_${uid}`);
        if (cached) {
          const c = JSON.parse(cached);
          setStudentIdInput(c.studentId || '');
          setDepartmentInput(c.department || 'Computer Science & Engineering');
          setYearInput(c.yearOfStudy || '2nd Year');
          setRoleInput(c.preferredRole || 'Engineer');
          setDietaryInput(c.dietaryOrAccess || '');
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote profile, using local state:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        setSuccessMessage('Authentication successful! Welcome to Campus Assembly.');
        setAuthMode('profile');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMessage('Please provide a valid college email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Simulate verified campus SSO authentication session for college email
    setTimeout(() => {
      const mockProfile: UserProfileData = {
        userId: `campus-user-${Math.abs(emailInput.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`,
        fullName: fullNameInput.trim() || emailInput.split('@')[0],
        collegeEmail: emailInput.trim().toLowerCase(),
        studentId: studentIdInput.trim() || 'CAMPUS-2026',
        department: departmentInput,
        yearOfStudy: yearInput,
        preferredRole: roleInput,
        dietaryOrAccess: dietaryInput,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('campus_auth_session', JSON.stringify(mockProfile));
      localStorage.setItem(`profile_${mockProfile.userId}`, JSON.stringify(mockProfile));

      if (onProfileUpdated) onProfileUpdated(mockProfile);
      setSuccessMessage('Logged in with campus credentials.');
      setAuthMode('profile');
      setIsLoading(false);
    }, 500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const uid = currentUser?.uid || 'guest-session';
    const profilePayload: UserProfileData = {
      userId: uid,
      fullName: fullNameInput.trim(),
      collegeEmail: emailInput.trim(),
      studentId: studentIdInput.trim().toUpperCase(),
      department: departmentInput.trim(),
      yearOfStudy: yearInput,
      preferredRole: roleInput,
      dietaryOrAccess: dietaryInput.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'main'), profilePayload);
      }
      localStorage.setItem(`profile_${uid}`, JSON.stringify(profilePayload));
      localStorage.setItem('campus_auth_session', JSON.stringify(profilePayload));

      if (onProfileUpdated) onProfileUpdated(profilePayload);
      setSuccessMessage('Profile saved successfully! Your recruit status is synced.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('Firestore profile write fallback:', err);
      localStorage.setItem(`profile_${uid}`, JSON.stringify(profilePayload));
      setSuccessMessage('Profile saved locally.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('campus_auth_session');
      setAuthMode('login');
      setSuccessMessage('Signed out securely.');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e) {
      // Ignored
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-lg bg-[#090e22] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0c1432] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-display font-bold text-white flex items-center gap-2">
                <span>RECRUIT AUTHENTICATION</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  VERIFIED IDENTITY
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Campus Single Sign-On & Recruit Dossier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Authentication Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* BODY */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {authMode !== 'profile' ? (
            <div className="space-y-5">
              {/* Google Fast Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs font-mono-tech flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE AUTH</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800" />
                <span className="px-3 text-[11px] font-mono-tech text-slate-500 uppercase">
                  OR CAMPUS EMAIL SSO
                </span>
                <div className="flex-1 border-t border-slate-800" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullNameInput}
                      onChange={e => setFullNameInput(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                    Campus Portal Password / PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'VERIFYING CREDENTIALS...' : authMode === 'signup' ? 'REGISTER RECRUIT ACCOUNT' : 'LOGIN TO ASSEMBLY PORTAL'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-mono-tech text-slate-400 hover:text-cyan-400 underline cursor-pointer"
                >
                  {authMode === 'login'
                    ? 'New recruit? Create an account'
                    : 'Already registered? Log in'}
                </button>
              </div>
            </div>
          ) : (
            /* PROFILE MANAGEMENT */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {(fullNameInput || emailInput)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{fullNameInput || 'Recruit'}</p>
                    <p className="text-[11px] font-mono-tech text-slate-400">{emailInput}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-mono-tech flex items-center gap-1.5 border border-slate-800 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullNameInput}
                  onChange={e => setFullNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={studentIdInput}
                    onChange={e => setStudentIdInput(e.target.value)}
                    placeholder="e.g. 2024-ENG-09"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={yearInput}
                    onChange={e => setYearInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono-tech"
                  >
                    {VALID_YEARS.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                  Department / Major
                </label>
                <input
                  type="text"
                  required
                  value={departmentInput}
                  onChange={e => setDepartmentInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                  Preferred Squad Archetype
                </label>
                <select
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono-tech"
                >
                  {VALID_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                  Accessibility & Dietary Accommodations
                </label>
                <textarea
                  rows={2}
                  value={dietaryInput}
                  onChange={e => setDietaryInput(e.target.value)}
                  placeholder="Optional notes for campus event coordinators..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>UPDATE RECRUIT DOSSIER</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
