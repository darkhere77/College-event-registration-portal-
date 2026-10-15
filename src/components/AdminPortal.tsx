import React, { useState, useEffect, useRef } from 'react';
import { ConfirmedRegistration } from './RegistrationForm';
import { EventConfig, EventMission } from '../config/eventConfig';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Shield,
  KeyRound,
  Search,
  CheckCircle,
  Users,
  Settings,
  X,
  QrCode,
  Camera,
  FileSpreadsheet,
  FileCode,
  Lock,
  Megaphone,
  Eye,
  EyeOff,
  Sliders,
  Radio,
  Send,
  AlertTriangle,
  Plus,
  Trash2,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { AdminDataVisualizer } from './AdminDataVisualizer';

export interface AnnouncementItem {
  id?: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  channel: string;
  author: string;
  createdAt: string;
}

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  onUpdateConfig: (newConfig: EventConfig) => void;
  onNewAnnouncement?: (announcement: AnnouncementItem) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onNewAnnouncement,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'roster' | 'capacity' | 'broadcast' | 'config'>('overview');
  const [roster, setRoster] = useState<ConfirmedRegistration[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true); // Privacy-first default
  const [scanToken, setScanToken] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      title: 'Multiverse Briefing Room Relocated to Quantum Quad Hall B',
      content: 'Due to overwhelming recruit turnout for the Quantum Anomaly Hackathon, check-in orientation will open 30 minutes early in Hall B.',
      priority: 'URGENT',
      channel: 'Technology',
      author: 'Assembly Command Ops',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      title: 'Cosplay Armor Checkpoint Inspection Guidelines',
      content: 'All props, foam armor pieces, and acoustic equipment must be inspected at North Gate prior to stage entrance.',
      priority: 'NORMAL',
      channel: 'Cosplay',
      author: 'Security Protocol Team',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [newAnnChannel, setNewAnnChannel] = useState('WhatsApp');
  const [isPublishingAnn, setIsPublishingAnn] = useState(false);

  // Editable config state
  const [editCollege, setEditCollege] = useState(config.collegeName);
  const [editDate, setEditDate] = useState(config.eventDateDisplay);
  const [editVenue, setEditVenue] = useState(config.venueDisplay);
  const [editDeadline, setEditDeadline] = useState(config.registrationDeadlineDisplay);
  const [editContact, setEditContact] = useState(config.contactEmail);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Missions capacity management state
  const [missionsState, setMissionsState] = useState<EventMission[]>(config.missions);

  useEffect(() => {
    if (isAuthenticated) {
      loadRoster();
      loadAnnouncements();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === config.organizerPasscode || passcode.trim() === 'DOOMSDAY2026') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid Security Passcode. Access Denied.');
    }
  };

  const loadRoster = async () => {
    setIsLoadingRoster(true);
    let loaded: ConfirmedRegistration[] = [];

    try {
      const snap = await getDocs(collection(db, 'registrations'));
      loaded = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
    } catch (e) {
      try {
        const res = await fetch('/api/registrations');
        if (res.ok) {
          loaded = await res.json();
        }
      } catch (err) {
        loaded = JSON.parse(localStorage.getItem('campus_assembly_roster') || '[]');
      }
    }

    const local = JSON.parse(localStorage.getItem('campus_assembly_roster') || '[]');
    const mergedMap = new Map<string, ConfirmedRegistration>();
    [...local, ...loaded].forEach(item => {
      const key = item.confirmationCode || item.studentId;
      if (key) mergedMap.set(key, item);
    });

    setRoster(Array.from(mergedMap.values()));
    setIsLoadingRoster(false);
  };

  const loadAnnouncements = async () => {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setAnnouncements(list);
      }
    } catch (e) {
      // Local announcements preserved
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    setIsPublishingAnn(true);
    const ann: AnnouncementItem = {
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      priority: newAnnPriority,
      channel: newAnnChannel || 'WhatsApp',
      author: 'Organizer Command',
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'announcements'), ann);
      ann.id = docRef.id;
    } catch (e) {
      ann.id = `ann-${Date.now()}`;
    }

    setAnnouncements(prev => [ann, ...prev]);
    if (onNewAnnouncement) onNewAnnouncement(ann);

    // Broadcast across app storage
    const storedAnn = JSON.parse(localStorage.getItem('campus_announcements') || '[]');
    localStorage.setItem('campus_announcements', JSON.stringify([ann, ...storedAnn]));

    setNewAnnTitle('');
    setNewAnnContent('');
    setIsPublishingAnn(false);
  };

  const handleDeleteAnnouncement = async (id?: string) => {
    if (!id) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {
      // Local delete
    }
  };

  const handleToggleCheckIn = async (rec: ConfirmedRegistration) => {
    const nextStatus = rec.status === 'CHECKED_IN' ? 'CONFIRMED' : 'CHECKED_IN';
    const updated = roster.map(r =>
      r.confirmationCode === rec.confirmationCode ? { ...r, status: nextStatus as any } : r
    );
    setRoster(updated);
    localStorage.setItem('campus_assembly_roster', JSON.stringify(updated));

    if (rec.id) {
      try {
        await updateDoc(doc(db, 'registrations', rec.id), {
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        // Handled silently
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanningCamera(false);
  };

  const processScanToken = async (rawToken: string) => {
    const token = rawToken.trim();
    if (!token) {
      setScanMessage('Please scan a valid QR code or paste the pass payload first.');
      return;
    }

    let parsedPayload: Record<string, string> | null = null;
    try {
      parsedPayload = JSON.parse(token) as Record<string, string>;
    } catch (e) {
      // raw token may be plain code text without JSON
    }

    const normalized = token.toUpperCase();
    const candidate = roster.find(rec => {
      const recValues = [
        rec.confirmationCode,
        rec.studentId,
        rec.memberPassId,
        rec.fullName,
      ].filter(Boolean).map(v => v!.toUpperCase());
      const payloadMatches = parsedPayload
        ? [
            parsedPayload.confirmationCode,
            parsedPayload.studentId,
            parsedPayload.memberPassId,
            parsedPayload.fullName,
          ].filter(Boolean).some(value => recValues.includes(String(value).toUpperCase()))
        : false;

      return recValues.includes(normalized) || payloadMatches;
    });

    if (!candidate) {
      setScanMessage('No matching recruit was found for this QR token. Verify the pass or check roster availability.');
      return;
    }

    if (candidate.status !== 'CHECKED_IN') {
      await handleToggleCheckIn(candidate);
      setScanMessage(`${candidate.fullName} checked in successfully using QR pass.`);
    } else {
      setScanMessage(`${candidate.fullName} is already checked in.`);
    }

    setScanToken(token);
  };

  const startCameraScan = async () => {
    if (!('BarcodeDetector' in window)) {
      setScanMessage('This browser does not support live QR camera scanning. Use the manual pass entry field instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanningCamera(true);
      setScanMessage('Camera live. Hold the QR code steady in front of the scanner.');

      const detector = new BarcodeDetector({ formats: ['qr_code'] as any });
      const scanLoop = async () => {
        if (!isScanningCamera || !videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0 && barcodes[0]?.rawValue) {
            const rawValue = barcodes[0].rawValue;
            await processScanToken(rawValue);
            stopCamera();
            return;
          }
        } catch (e) {
          // Ignore transient scan errors and continue the loop.
        }

        if (isScanningCamera) {
          requestAnimationFrame(scanLoop);
        }
      };

      requestAnimationFrame(scanLoop);
    } catch (error) {
      setIsScanningCamera(false);
      setScanMessage('Unable to access camera. Please use the manual token entry field instead.');
    }
  };

  const handleQrImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!('BarcodeDetector' in window)) {
      setScanMessage('This browser does not support QR image scanning. Paste the QR payload instead.');
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        try {
          const detector = new BarcodeDetector({ formats: ['qr_code'] as any });
          const detected = await detector.detect(img);
          if (detected.length > 0 && detected[0]?.rawValue) {
            await processScanToken(detected[0].rawValue);
          } else {
            setScanMessage('No QR code was detected in the selected image.');
          }
          URL.revokeObjectURL(imageUrl);
        } catch (error) {
          setScanMessage('The uploaded image could not be decoded. Please try a clearer QR scan.');
        }
      };
      img.src = imageUrl;
    } catch (error) {
      setScanMessage('Unable to process the uploaded QR image.');
    }
  };

  const handleUpdateMissionCapacity = (missionId: string, newTotal: number) => {
    const updated = missionsState.map(m =>
      m.id === missionId ? { ...m, totalSeats: Math.max(10, newTotal) } : m
    );
    setMissionsState(updated);
    onUpdateConfig({ ...config, missions: updated });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: EventConfig = {
      ...config,
      collegeName: editCollege,
      eventDateDisplay: editDate,
      venueDisplay: editVenue,
      registrationDeadlineDisplay: editDeadline,
      contactEmail: editContact,
      missions: missionsState,
    };
    onUpdateConfig(updatedConfig);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 2500);
  };

  const exportCSV = () => {
    const headers = [
      'Confirmation Code',
      'Full Name',
      maskSensitiveData ? 'College Email (Masked)' : 'College Email',
      maskSensitiveData ? 'Student ID (Masked)' : 'Student ID',
      'Department',
      'Year',
      'Mission',
      'Role',
      'Team Name',
      'Status',
      'Created At',
    ];
    const rows = roster.map(r => [
      `"${r.confirmationCode}"`,
      `"${r.fullName}"`,
      `"${maskSensitiveData ? maskEmail(r.collegeEmail) : r.collegeEmail}"`,
      `"${maskSensitiveData ? 'REDACTED-PII' : r.studentId}"`,
      `"${r.department}"`,
      `"${r.yearOfStudy}"`,
      `"${r.eventName}"`,
      `"${r.squadRole}"`,
      `"${r.teamName || 'Solo'}"`,
      `"${r.status}"`,
      `"${r.createdAt}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Campus_Assembly_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const sanitized = roster.map(r => ({
      confirmationCode: r.confirmationCode,
      fullName: r.fullName,
      collegeEmail: maskSensitiveData ? maskEmail(r.collegeEmail) : r.collegeEmail,
      studentId: maskSensitiveData ? 'REDACTED-PII' : r.studentId,
      department: r.department,
      yearOfStudy: r.yearOfStudy,
      eventName: r.eventName,
      squadRole: r.squadRole,
      status: r.status,
      createdAt: r.createdAt,
    }));
    const jsonStr = JSON.stringify(sanitized, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Campus_Assembly_Roster_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return '***@campus.edu';
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const filteredRoster = roster.filter(r => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || r.squadRole === filterRole;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate high-level stats
  const totalCapacity = missionsState.reduce((sum, m) => sum + m.totalSeats, 0);
  const totalRegistered = roster.length + missionsState.reduce((sum, m) => sum + m.filledSeats, 0);
  const capacityPercent = Math.min(100, Math.round((totalRegistered / totalCapacity) * 100));

  const roleCounts = {
    Strategist: roster.filter(r => r.squadRole === 'Strategist').length,
    Engineer: roster.filter(r => r.squadRole === 'Engineer').length,
    Creator: roster.filter(r => r.squadRole === 'Creator').length,
    'Field Agent': roster.filter(r => r.squadRole === 'Field Agent').length,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className="w-full max-w-6xl bg-[#090e21] border border-slate-800 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b122c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="admin-title" className="text-base font-display font-bold text-white flex items-center gap-2">
                <span>REAL-TIME ORGANIZER COMMAND CENTER</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                  STAFF CLEARANCE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Live Assembly Telemetry, Participant Roster & Broadcast Console
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Organizer Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">RESTRICTED ORGANIZER ACCESS</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your event coordinator security passcode to unlock live recruitment metrics,
              capacity controls, and communication channels.
            </p>

            {authError && (
              <p className="text-xs text-rose-400 font-mono-tech mb-4">{authError}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode (Default: DOOMSDAY2026)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono-tech transition-colors cursor-pointer"
              >
                AUTHORIZE ORGANIZER CONSOLE
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto bg-[#0a0f26] scrollbar-none">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'overview'
                      ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Overview & Metrics</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Telemetry & Charts</span>
                </button>

                <button
                  onClick={() => setActiveTab('roster')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'roster'
                      ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Participant Roster ({roster.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('capacity')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'capacity'
                      ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Mission Capacity</span>
                </button>

                <button
                  onClick={() => setActiveTab('broadcast')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'broadcast'
                      ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Announcements ({announcements.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-3 py-2 rounded-t-xl text-xs font-mono-tech uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'config'
                      ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>

              {activeTab === 'roster' && (
                <div className="flex items-center gap-2 pb-2">
                  {/* Privacy Toggle Button */}
                  <button
                    onClick={() => setMaskSensitiveData(!maskSensitiveData)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono-tech flex items-center gap-1.5 cursor-pointer transition-colors ${
                      maskSensitiveData
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                    title="Toggle Privacy Mask for student PII"
                  >
                    {maskSensitiveData ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{maskSensitiveData ? 'PII MASKED (COMPLIANT)' : 'RAW DATA'}</span>
                  </button>

                  <button
                    onClick={exportCSV}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono-tech flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={exportJSON}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono-tech flex items-center gap-1 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB: OVERVIEW & REAL-TIME METRICS */}
            {activeTab === 'overview' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
                    <span className="text-[11px] font-mono-tech text-cyan-400 uppercase">
                      Total Recruits Enrolled
                    </span>
                    <h3 className="text-3xl font-display font-bold text-white mt-1">
                      {totalRegistered}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Across all campus missions
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
                    <span className="text-[11px] font-mono-tech text-amber-400 uppercase">
                      Overall Capacity
                    </span>
                    <h3 className="text-3xl font-display font-bold text-amber-300 mt-1">
                      {capacityPercent}%
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {totalRegistered} / {totalCapacity} Max Limit
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
                    <span className="text-[11px] font-mono-tech text-emerald-400 uppercase">
                      Check-in Readiness
                    </span>
                    <h3 className="text-3xl font-display font-bold text-emerald-300 mt-1">
                      {roster.filter(r => r.status === 'CHECKED_IN').length} Checked In
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Verified at gate checkpoints
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
                    <span className="text-[11px] font-mono-tech text-purple-400 uppercase">
                      Active Broadcasts
                    </span>
                    <h3 className="text-3xl font-display font-bold text-purple-300 mt-1">
                      {announcements.length}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Live directives published
                    </p>
                  </div>
                </div>

                {/* Real-Time Telemetry & Data Visualizer with Recharts */}
                <AdminDataVisualizer roster={roster} missions={missionsState} />

                {/* Mission Capacity Quick Glance */}
                <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
                  <h4 className="text-xs font-mono-tech uppercase text-slate-300 mb-4 font-bold flex items-center justify-between">
                    <span>Mission Track Seat Status</span>
                    <span className="text-[11px] text-cyan-400 font-normal">Real-time Seat Reservation Sync</span>
                  </h4>
                  <div className="space-y-3">
                    {missionsState.map(m => {
                      const pct = Math.min(100, Math.round((m.filledSeats / m.totalSeats) * 100));
                      return (
                        <div key={m.id} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-slate-200">{m.name}</span>
                            <span className="font-mono-tech text-slate-400">
                              {m.filledSeats} / {m.totalSeats} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pct > 85 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DEDICATED TELEMETRY & RECHARTS DATA VISUALIZER */}
            {activeTab === 'analytics' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <AdminDataVisualizer roster={roster} missions={missionsState} />
              </div>
            )}

            {/* TAB: PARTICIPANT ROSTER (WITH PRIVACY SAFELISTS) */}
            {activeTab === 'roster' && (
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                <div className="mb-4 p-4 rounded-2xl border border-cyan-500/30 bg-[#0b1228]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <QrCode className="w-4 h-4" />
                      <span className="text-xs font-mono-tech uppercase font-bold">QR CHECK-IN PORTAL</span>
                    </div>
                    <button
                      onClick={isScanningCamera ? stopCamera : startCameraScan}
                      className="rounded-lg border border-cyan-500/40 bg-cyan-900/40 px-3 py-1.5 text-[11px] font-mono-tech text-cyan-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isScanningCamera ? 'Stop Camera' : 'Scan with Camera'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={scanToken}
                        onChange={e => setScanToken(e.target.value)}
                        placeholder="Paste QR token, confirmation code, or student ID"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => processScanToken(scanToken)}
                        className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-tech cursor-pointer"
                      >
                        VERIFY CHECK-IN
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] font-mono-tech uppercase text-slate-300 cursor-pointer">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload QR image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleQrImageUpload} />
                    </label>

                    {scanMessage && (
                      <div className="text-[11px] text-slate-200 font-mono-tech">
                        {scanMessage}
                      </div>
                    )}
                  </div>

                  {isScanningCamera && (
                    <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-slate-950 p-2">
                      <video ref={videoRef} className="w-full max-h-64 rounded-xl object-cover bg-black" playsInline muted />
                    </div>
                  )}
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search participant name, dispatch code, or mission..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono-tech"
                  >
                    <option value="All">All Roles</option>
                    <option value="Strategist">Strategist</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Creator">Creator</option>
                    <option value="Field Agent">Field Agent</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono-tech"
                  >
                    <option value="All">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="WAITLISTED">Waitlisted</option>
                  </select>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0b1228] text-slate-400 font-mono-tech uppercase text-[10px] sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Recruit Name</th>
                        <th className="p-3">Email {maskSensitiveData && '(Protected)'}</th>
                        <th className="p-3">Campus ID</th>
                        <th className="p-3">Mission Assigned</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Dispatch Code</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredRoster.map(rec => (
                        <tr key={rec.confirmationCode} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-semibold text-white whitespace-nowrap">
                            {rec.fullName}
                          </td>
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {maskSensitiveData ? maskEmail(rec.collegeEmail) : rec.collegeEmail}
                          </td>
                          <td className="p-3 font-mono-tech text-slate-400 whitespace-nowrap">
                            {maskSensitiveData ? '••-••••-••' : rec.studentId}
                          </td>
                          <td className="p-3 text-slate-200 whitespace-nowrap truncate max-w-xs">
                            {rec.eventName}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                              {rec.squadRole}
                            </span>
                          </td>
                          <td className="p-3 font-mono-tech text-cyan-400 text-[11px] whitespace-nowrap">
                            {rec.confirmationCode}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`font-mono-tech text-[10px] px-2 py-0.5 rounded ${
                                rec.status === 'CHECKED_IN'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleToggleCheckIn(rec)}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono-tech cursor-pointer transition-colors ${
                                rec.status === 'CHECKED_IN'
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  : 'bg-emerald-600 text-slate-950 font-bold hover:bg-emerald-500'
                              }`}
                            >
                              {rec.status === 'CHECKED_IN' ? 'Undo Check-in' : 'Check In'}
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredRoster.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 font-mono-tech">
                            NO PARTICIPANTS MATCH THE CRITERIA.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: MISSION CAPACITY MANAGEMENT */}
            {activeTab === 'capacity' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-display font-bold text-white">
                      MANAGE EVENT MISSION CAPACITIES
                    </h3>
                    <p className="text-xs text-slate-400">
                      Adjust participant quotas and seat allocations in real time.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missionsState.map(m => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-[#0c1328] border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono-tech text-cyan-400 uppercase bg-slate-900 px-2 py-0.5 rounded">
                            {m.category}
                          </span>
                          <span className="text-xs font-mono-tech text-slate-400">
                            {m.filledSeats} Registered
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{m.name}</h4>
                        <p className="text-xs text-slate-400 mb-3">{m.venue}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-3">
                        <label className="text-xs font-mono-tech text-slate-300">
                          Total Quota:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={m.filledSeats}
                            max={1000}
                            value={m.totalSeats}
                            onChange={e =>
                              handleUpdateMissionCapacity(m.id, parseInt(e.target.value) || m.totalSeats)
                            }
                            className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono-tech text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-mono-tech">seats</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COMMUNICATION & BROADCAST CHANNEL */}
            {activeTab === 'broadcast' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold text-white mb-1 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>PUBLISH OFFICIAL ASSEMBLY ANNOUNCEMENT</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Broadcast logistical alerts, schedule shifts, or room updates directly to all recruit portals.
                  </p>
                </div>

                {/* Broadcast Form */}
                <form
                  onSubmit={handlePublishAnnouncement}
                  className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                        Announcement Headline
                      </label>
                      <input
                        type="text"
                        required
                        value={newAnnTitle}
                        onChange={e => setNewAnnTitle(e.target.value)}
                        placeholder="e.g. Schedule Update: Quantum Hackathon Opening Keynote"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                        Urgency Priority
                      </label>
                      <select
                        value={newAnnPriority}
                        onChange={e => setNewAnnPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono-tech"
                      >
                        <option value="NORMAL">Normal Notice</option>
                        <option value="URGENT">Urgent Broadcast</option>
                        <option value="EMERGENCY">Emergency Alert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      Delivery Channel
                    </label>
                    <select
                      value={newAnnChannel}
                      onChange={e => setNewAnnChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono-tech"
                    >
                      <option value="WhatsApp">WhatsApp (Primary)</option>
                      <option value="Campus Wide">Campus Wide</option>
                      <option value="Technology">Technology</option>
                      <option value="Cosplay">Cosplay</option>
                    </select>
                    <p className="mt-1 text-[11px] text-slate-400 font-mono-tech">
                      Primary intimation is sent via WhatsApp to the registered phone number for each recruit.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      Announcement Content Body
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newAnnContent}
                      onChange={e => setNewAnnContent(e.target.value)}
                      placeholder="Enter detailed directives, instructions, or venue details..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isPublishingAnn}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono-tech flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPublishingAnn ? 'BROADCASTING...' : 'DISPATCH ANNOUNCEMENT'}</span>
                    </button>
                  </div>
                </form>

                {/* Recent Announcements List */}
                <div>
                  <h4 className="text-xs font-mono-tech uppercase text-slate-400 mb-3 font-bold">
                    Active Mission Announcements
                  </h4>
                  <div className="space-y-3">
                    {announcements.map(ann => (
                      <div
                        key={ann.id}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-mono-tech px-2 py-0.5 rounded ${
                                ann.priority === 'EMERGENCY'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                                  : ann.priority === 'URGENT'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                                  : 'bg-cyan-950 text-cyan-400 border border-cyan-500/50'
                              }`}
                            >
                              {ann.priority}
                            </span>
                            <span className="text-[11px] font-mono-tech text-slate-500">
                              {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white mb-1">{ann.title}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVENT CONFIG */}
            {activeTab === 'config' && (
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={handleSaveConfig} className="max-w-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      College / Institute Name
                    </label>
                    <input
                      type="text"
                      value={editCollege}
                      onChange={e => setEditCollege(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                        Event Dates Display
                      </label>
                      <input
                        type="text"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                        Registration Deadline
                      </label>
                      <input
                        type="text"
                        value={editDeadline}
                        onChange={e => setEditDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      Venue / Campus Location
                    </label>
                    <input
                      type="text"
                      value={editVenue}
                      onChange={e => setEditVenue(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-300 mb-1">
                      Organizer Contact Email
                    </label>
                    <input
                      type="email"
                      value={editContact}
                      onChange={e => setEditContact(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono-tech transition-colors cursor-pointer"
                    >
                      SAVE CONFIGURATION
                    </button>
                    {configSavedNotice && (
                      <span className="text-xs text-emerald-400 font-mono-tech">
                        Event configuration updated successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
