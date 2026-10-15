import React, { useEffect, useMemo, useState } from 'react';
import { EventMission, SquadRoleConfig } from '../config/eventConfig';
import {
  validateRegistration,
  generateDispatchCode,
  VALID_YEARS,
} from '../utils/registrationRules';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  ShieldCheck,
  User,
  Mail,
  CreditCard,
  Building,
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { HERO_CHARACTERS, getMissionManifestation } from '../assets/heroAvatars';
import { HeroPowerType } from './HeroPowerEffectOverlay';

export interface ConfirmedRegistration {
  id?: string;
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
  confirmationCode: string;
  status: 'CONFIRMED' | 'WAITLISTED' | 'CHECKED_IN';
  createdAt: string;
}

interface RegistrationFormProps {
  missions: EventMission[];
  roles: SquadRoleConfig[];
  selectedMissionId: string;
  selectedRole: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  onMissionChange: (id: string) => void;
  onRoleChange: (role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => void;
  onRegistrationSuccess: (data: ConfirmedRegistration) => void;
  onTriggerPower?: (power: HeroPowerType) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  missions,
  roles,
  selectedMissionId,
  selectedRole,
  onMissionChange,
  onRoleChange,
  onRegistrationSuccess,
  onTriggerPower,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    collegeEmail: '',
    phone: '',
    studentId: '',
    department: '',
    yearOfStudy: '2nd Year',
    teamName: '',
    teammates: '',
    dietaryOrAccess: '',
    rulesAgreed: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [typedMessage, setTypedMessage] = useState('');
  const [roleAnnouncement, setRoleAnnouncement] = useState<string | null>(null);
  const [heroPulseKey, setHeroPulseKey] = useState<number>(0);

  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];
  const activeHero = HERO_CHARACTERS[selectedRole] || HERO_CHARACTERS.Engineer;
  const registrationProgress = useMemo(() => {
    const checks = [
      formData.fullName.trim(),
      formData.collegeEmail.trim(),
      formData.studentId.trim(),
      formData.department.trim(),
      activeMission.name,
      selectedRole,
      formData.rulesAgreed,
    ];
    const completeCount = checks.filter(Boolean).length;
    return Math.min(100, Math.round((completeCount / checks.length) * 100));
  }, [activeMission.name, formData.collegeEmail, formData.department, formData.fullName, formData.rulesAgreed, formData.studentId, selectedRole]);

  const assistantStatus = currentStep === 1
    ? formData.fullName.trim()
      ? 'Identity match established'
      : 'Scanning credentials'
    : currentStep === 2
      ? 'Mission sync active'
      : formData.rulesAgreed
        ? 'Clearance granted'
        : 'Awaiting final authorization';

  const heroMessage = (() => {
    if (roleAnnouncement && currentStep === 2) {
      return roleAnnouncement;
    }

    if (currentStep === 1) {
      if (formData.fullName.trim()) {
        return `${formData.fullName.split(' ')[0]}, your mission profile is being prepared. Let’s lock in your campus credentials before the portal opens.`;
      }
      return `Welcome, recruit. I’m ${activeHero.name}. Tell me your name and campus identity so I can verify your access to the event.`;
    }

    if (currentStep === 2) {
      if (activeMission) {
        return `${activeHero.heroAlias} here: ${activeMission.name} is a perfect match for your ${selectedRole.toLowerCase()} profile. Choose the squad that fits your strengths.`;
      }
      return `${activeHero.heroAlias} is scanning the field. Select the mission lane that best suits your tactical profile.`;
    }

    if (formData.rulesAgreed) {
      return `Protocol confirmed. ${activeHero.name} has synced your registration packet and is ready to finalize your event access badge.`;
    }

    return `${activeHero.heroAlias} is standing by. Review the final mission summary and confirm the code of conduct before I issue your clearance.`;
  })();

  useEffect(() => {
    setTypedMessage('');
    if (!heroMessage) return;

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedMessage(heroMessage.slice(0, index));
      if (index >= heroMessage.length) {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [heroMessage]);

  const handleRoleSelect = (role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => {
    const hero = HERO_CHARACTERS[role];
    setRoleAnnouncement(`${hero.heroAlias} detected ${selectedRole === role ? 'your current alignment' : 'your chosen power profile'}. ${hero.powerTitle} is primed for this mission. We are ready to assign your squad.`);
    setHeroPulseKey(prev => prev + 1);
    onRoleChange(role);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateCurrentStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        stepErrors.fullName = 'Full Name is required (at least 2 characters).';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.collegeEmail.trim() || !emailRegex.test(formData.collegeEmail)) {
        stepErrors.collegeEmail = 'Please provide a valid college or university email address.';
      }
      if (!formData.studentId.trim() || formData.studentId.length < 2) {
        stepErrors.studentId = 'Campus Student ID is required.';
      }
      if (!formData.department.trim() || formData.department.length < 2) {
        stepErrors.department = 'Academic Department / Major is required.';
      }
    } else if (step === 2) {
      if (!selectedMissionId) {
        stepErrors.eventId = 'Please select an event mission.';
      }
      if (!selectedRole) {
        stepErrors.squadRole = 'Please select a tactical squad role.';
      }
    } else if (step === 3) {
      if (!formData.rulesAgreed) {
        stepErrors.rulesAgreed = 'You must agree to campus assembly guidelines and safety protocols.';
      }
    }

    setValidationErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: (document.getElementById('assemble')?.offsetTop || 500) - 80, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(3)) return;

    // Full validation
    const fullCheck = validateRegistration({
      fullName: formData.fullName,
      collegeEmail: formData.collegeEmail,
      phone: formData.phone,
      studentId: formData.studentId,
      department: formData.department,
      yearOfStudy: formData.yearOfStudy,
      eventId: activeMission.id,
      eventName: activeMission.name,
      squadRole: selectedRole,
      teamName: formData.teamName,
      teammates: formData.teammates,
      dietaryOrAccess: formData.dietaryOrAccess,
      rulesAgreed: formData.rulesAgreed,
    });

    if (!fullCheck.isValid) {
      setValidationErrors(fullCheck.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const dispatchCode = generateDispatchCode(selectedRole);
    const nowIso = new Date().toISOString();

    const registrationRecord: ConfirmedRegistration = {
      fullName: formData.fullName.trim(),
      collegeEmail: formData.collegeEmail.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      studentId: formData.studentId.trim().toUpperCase(),
      department: formData.department.trim(),
      yearOfStudy: formData.yearOfStudy,
      eventId: activeMission.id,
      eventName: activeMission.name,
      squadRole: selectedRole,
      teamName: formData.teamName.trim() || undefined,
      teammates: formData.teammates.trim() || undefined,
      dietaryOrAccess: formData.dietaryOrAccess.trim() || undefined,
      confirmationCode: dispatchCode,
      status: 'CONFIRMED',
      createdAt: nowIso,
    };

    try {
      // 1. Try Firestore direct persistence
      try {
        const docRef = await addDoc(collection(db, 'registrations'), {
          fullName: registrationRecord.fullName,
          collegeEmail: registrationRecord.collegeEmail,
          phone: registrationRecord.phone || '',
          studentId: registrationRecord.studentId,
          department: registrationRecord.department,
          yearOfStudy: registrationRecord.yearOfStudy,
          eventId: registrationRecord.eventId,
          eventName: registrationRecord.eventName,
          squadRole: registrationRecord.squadRole,
          teamName: registrationRecord.teamName || '',
          teammates: registrationRecord.teammates || '',
          dietaryOrAccess: registrationRecord.dietaryOrAccess || '',
          confirmationCode: registrationRecord.confirmationCode,
          status: registrationRecord.status,
          userId: auth.currentUser?.uid || 'guest-recruit',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        registrationRecord.id = docRef.id;
      } catch (firestoreErr) {
        // Fall back to server API endpoint or local store
        console.warn('Direct Firestore write encountered issue, syncing to backend server:', firestoreErr);
        try {
          const res = await fetch('/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationRecord),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.id) registrationRecord.id = data.id;
          }
        } catch (serverErr) {
          console.warn('Local offline mode preserved for demo registration');
        }
      }

      // Save to local storage for persistent recruit re-access
      const savedRegistrations = JSON.parse(localStorage.getItem('campus_assembly_roster') || '[]');
      savedRegistrations.push(registrationRecord);
      localStorage.setItem('campus_assembly_roster', JSON.stringify(savedRegistrations));
      localStorage.setItem('campus_assembly_active_recruit', JSON.stringify(registrationRecord));

      onRegistrationSuccess(registrationRecord);
    } catch (err) {
      console.error('Registration submission failed:', err);
      setSubmissionError('Registration could not be completed. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="assemble" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono-tech mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CAMPUS ENROLLMENT PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            RECRUIT REGISTRATION
          </h2>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
            Step {currentStep} of 3: {currentStep === 1 && 'Recruit Identification'}
            {currentStep === 2 && 'Mission & Squad Assignment'}
            {currentStep === 3 && 'Verification & Security Oath'}
          </p>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] items-center">
          <div
            key={heroPulseKey}
            className="hero-interaction-card relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 shadow-2xl shadow-cyan-950/20"
            style={{ boxShadow: `0 0 30px ${activeHero.accentColor}25` }}
          >
            <div
              className="absolute inset-3 rounded-2xl opacity-80"
              style={{
                background: `radial-gradient(circle, ${activeHero.primaryColor}22 0%, transparent 60%)`,
                filter: 'blur(20px)',
              }}
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src={activeHero.image}
                alt={activeHero.name}
                className="h-52 w-full object-cover object-center grayscale-[10%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div
                className="absolute bottom-2 left-2 right-2 rounded-full border px-2 py-1 text-center text-[10px] font-mono-tech font-bold uppercase tracking-[0.2em]"
                style={{
                  borderColor: `${activeHero.accentColor}80`,
                  backgroundColor: `${activeHero.primaryColor}20`,
                  color: activeHero.accentColor,
                }}
              >
                {selectedRole}
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
            <div
              className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-l border-b border-slate-800 bg-slate-900/80 hidden sm:block"
            />
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: activeHero.primaryColor }} />
                <p className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-slate-400">
                  Guardian patron
                </p>
              </div>
              <span
                className="rounded-full border px-2 py-0.5 text-[9px] font-mono-tech uppercase tracking-[0.2em]"
                style={{
                  borderColor: `${activeHero.primaryColor}55`,
                  color: activeHero.accentColor,
                  backgroundColor: `${activeHero.primaryColor}10`,
                }}
              >
                {assistantStatus}
              </span>
            </div>
            <h3 className="text-xl font-display font-bold text-white">{activeHero.name}</h3>
            <p className="text-xs font-mono-tech uppercase tracking-[0.22em] text-slate-400 mb-3">
              {activeHero.heroAlias}
            </p>
            <div
              className="hero-speech rounded-2xl border p-3 text-sm leading-relaxed text-slate-200"
              style={{
                borderColor: `${activeHero.primaryColor}55`,
                background: `linear-gradient(135deg, ${activeHero.primaryColor}18, rgba(15, 23, 42, 0.9))`,
              }}
            >
              “{typedMessage}
              <span className="inline-block w-2 h-4 ml-1 align-middle rounded-sm bg-white/80 animate-pulse"> </span>”
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-[0.2em] text-slate-400">
                <span>Mission readiness</span>
                <span>{registrationProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${registrationProgress}%`,
                    background: `linear-gradient(90deg, ${activeHero.primaryColor}, ${activeHero.accentColor})`,
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-mono-tech text-slate-300">
                {activeMission.name}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-mono-tech text-slate-300">
                {activeHero.powerTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Accessible Step Progress Indicator */}
        <div className="flex items-center justify-between mb-8 max-w-lg mx-auto px-4" aria-label="Registration Progress">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono-tech text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                    : currentStep > step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors ${
                    currentStep > step ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {submissionError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label htmlFor="reg-fullname" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm focus:outline-none transition-colors ${
                      validationErrors.fullName
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="mt-1.5 text-xs text-rose-400 font-mono-tech">{validationErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                    College Email <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={formData.collegeEmail}
                      onChange={e => handleInputChange('collegeEmail', e.target.value)}
                      placeholder="recruit@campus.edu"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm focus:outline-none transition-colors ${
                        validationErrors.collegeEmail
                          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      }`}
                    />
                  </div>
                  {validationErrors.collegeEmail && (
                    <p className="mt-1.5 text-xs text-rose-400 font-mono-tech">{validationErrors.collegeEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-studentid" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                    Student ID / Enrollment # <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-studentid"
                      type="text"
                      required
                      value={formData.studentId}
                      onChange={e => handleInputChange('studentId', e.target.value)}
                      placeholder="e.g. 2024-CS-8921"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm focus:outline-none transition-colors ${
                        validationErrors.studentId
                          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      }`}
                    />
                  </div>
                  {validationErrors.studentId && (
                    <p className="mt-1.5 text-xs text-rose-400 font-mono-tech">{validationErrors.studentId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-department" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                    Department / Major <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-department"
                      type="text"
                      required
                      value={formData.department}
                      onChange={e => handleInputChange('department', e.target.value)}
                      placeholder="e.g. Computer Science & AI"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm focus:outline-none transition-colors ${
                        validationErrors.department
                          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      }`}
                    />
                  </div>
                  {validationErrors.department && (
                    <p className="mt-1.5 text-xs text-rose-400 font-mono-tech">{validationErrors.department}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-year" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                    Year of Study <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="reg-year"
                      value={formData.yearOfStudy}
                      onChange={e => handleInputChange('yearOfStudy', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      {VALID_YEARS.map(y => (
                        <option key={y} value={y} className="bg-slate-900 text-slate-100">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                  Contact Phone (Optional - For Emergency Mission Broadcasts)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: MISSION & SQUAD ROLE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label htmlFor="reg-mission" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                  Assigned Event Mission <span className="text-cyan-400">*</span>
                </label>
                <select
                  id="reg-mission"
                  value={selectedMissionId}
                  onChange={e => onMissionChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-semibold transition-colors"
                >
                  {missions.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                      {m.name} [{m.category} • Squad: {m.teamSize}]
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  Venue: {activeMission.venue} | Schedule: {activeMission.dateTime}
                </p>
              </div>

              {/* Guardian Character & Power Manifestation Feature Card */}
              {(() => {
                const missionManifest = getMissionManifestation(activeMission.category);
                const roleHero = HERO_CHARACTERS[selectedRole] || missionManifest.hero;
                return (
                  <div className={`p-4 rounded-2xl bg-slate-900/90 border ${missionManifest.accentBorder} space-y-3 relative overflow-hidden transition-all duration-300 shadow-xl`}>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* 2D Character Portrait */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-lg">
                        <img
                          src={roleHero.image}
                          alt={`${roleHero.name} - ${roleHero.heroAlias}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-mono-tech font-bold text-white uppercase bg-black/60 rounded px-1">
                          {selectedRole}
                        </span>
                      </div>

                      {/* Power & Guardian Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                          <span className="text-xs font-mono-tech text-cyan-400 font-bold uppercase tracking-wider">
                            GUARDIAN PATRON: {roleHero.heroAlias}
                          </span>
                          <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 ${missionManifest.elementalColor} font-bold`}>
                            {missionManifest.effectBadge}
                          </span>
                        </div>
                        <h4 className="text-base font-display font-bold text-white mb-1">
                          {roleHero.powerTitle}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {roleHero.powerDescription}
                        </p>

                        {/* Interactive Power Test Button */}
                        {onTriggerPower && (
                          <button
                            type="button"
                            onClick={() => onTriggerPower(roleHero.powerName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-cyan-950/50"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>TEST POWER ANIMATION</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                  Your Squad Tactical Role <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roles.map(r => {
                    const hero = HERO_CHARACTERS[r.id];
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          selectedRole === r.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md ring-1 ring-cyan-500/50'
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {hero && (
                          <div className="w-10 h-10 rounded-full overflow-hidden mb-2 border border-white/20">
                            <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-xs font-display">{r.title}</p>
                        <p className="text-[10px] font-mono-tech text-slate-400 mt-1">{r.id}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-900 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono-tech uppercase text-slate-300">
                    Squad & Teammates (Optional)
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reg-teamname" className="block text-xs text-slate-400 mb-1">
                      Team / Strike Squad Name
                    </label>
                    <input
                      id="reg-teamname"
                      type="text"
                      value={formData.teamName}
                      onChange={e => handleInputChange('teamName', e.target.value)}
                      placeholder="e.g. Multiverse Vanguard"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-teammates" className="block text-xs text-slate-400 mb-1">
                      Teammate Names & Student IDs (if registering as a squad)
                    </label>
                    <textarea
                      id="reg-teammates"
                      rows={2}
                      value={formData.teammates}
                      onChange={e => handleInputChange('teammates', e.target.value)}
                      placeholder="e.g. Alex Chen (2024-CS-12), Samira Khan (2024-EE-45)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOGISTICS & OATH */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label htmlFor="reg-access" className="block text-xs font-mono-tech uppercase text-slate-300 mb-2">
                  Accessibility Accommodations or Dietary Preferences (Optional)
                </label>
                <textarea
                  id="reg-access"
                  rows={2}
                  value={formData.dietaryOrAccess}
                  onChange={e => handleInputChange('dietaryOrAccess', e.target.value)}
                  placeholder="e.g. Wheelchair access required, vegetarian meals, sensory quiet zone..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Recruitment Dossier Summary Preview with 2D Guardian Avatar */}
              {(() => {
                const hero = HERO_CHARACTERS[selectedRole];
                return (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-mono-tech text-cyan-400 uppercase text-[11px] font-bold">
                        RECRUIT DOSSIER & GUARDIAN MATRIX
                      </span>
                      {hero && (
                        <span className="text-[10px] font-mono-tech text-amber-400">
                          {hero.heroAlias}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {hero && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/20">
                          <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Recruit:</span>
                          <span className="font-semibold text-white">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-slate-200">{formData.collegeEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mission:</span>
                          <span className="text-cyan-300 font-semibold">{activeMission.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tactical Role:</span>
                          <span className="text-amber-300 font-semibold">{selectedRole}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fee:</span>
                          <span className="text-emerald-400 font-bold">FREE / COMPLIMENTARY RECRUIT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Rules and Privacy Agreement */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={formData.rulesAgreed}
                    onChange={e => handleInputChange('rulesAgreed', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed group-hover:text-slate-200">
                    I agree to the campus assembly code of conduct, respect all recruits and staff, and
                    commit to maintaining timeline integrity during all activities.
                  </span>
                </label>
                {validationErrors.rulesAgreed && (
                  <p className="text-xs text-rose-400 font-mono-tech">{validationErrors.rulesAgreed}</p>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Privacy Notice:</strong> Your registration information is kept strictly confidential
                  and used solely by authorized campus assembly coordinators for event credentials, safety,
                  and logistics. It will never be sold or exposed publicly.
                </p>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-900 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono-tech flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PREVIOUS</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <span>NEXT STEP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm font-display tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ENCRYPTING & SUBMITTING...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>COMPLETE REGISTRATION</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
