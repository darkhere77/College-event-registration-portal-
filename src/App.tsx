import React, { useState, useEffect } from 'react';
import { INITIAL_EVENT_CONFIG, EventConfig } from './config/eventConfig';
import { ThreePortalScene } from './components/ThreePortalScene';
import { StoryBriefing } from './components/StoryBriefing';
import { EventExplorer } from './components/EventExplorer';
import { RoleSelector } from './components/RoleSelector';
import { RegistrationForm, ConfirmedRegistration } from './components/RegistrationForm';
import { ConfirmationView } from './components/ConfirmationView';
import { FAQSection } from './components/FAQSection';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIBriefingDrawer } from './components/AIBriefingDrawer';
import { AuthModal, UserProfileData } from './components/AuthModal';
import { AdminPortal, AnnouncementItem } from './components/AdminPortal';
import { AnnouncementsTicker } from './components/AnnouncementsTicker';
import { ColorCustomizerDrawer } from './components/ColorCustomizerDrawer';
import { HeroPowerEffectOverlay, HeroPowerType } from './components/HeroPowerEffectOverlay';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [config, setConfig] = useState<EventConfig>(INITIAL_EVENT_CONFIG);
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    INITIAL_EVENT_CONFIG.missions[0].id
  );
  const [selectedRole, setSelectedRole] = useState<
    'Strategist' | 'Engineer' | 'Creator' | 'Field Agent'
  >('Engineer');

  // Hero Power in-screen canvas animation state
  const [activePower, setActivePower] = useState<HeroPowerType>(null);

  // Confirmed registration state (null if not registered or registering)
  const [confirmedRegistration, setConfirmedRegistration] =
    useState<ConfirmedRegistration | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  // Modals state
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ann-init-1',
      title: 'Multiverse Orientation Staging Relocated to Quad Hall B',
      content: 'Early check-in for the Quantum Anomaly Hackathon opens at 09:30 AM in Hall B.',
      priority: 'URGENT',
      channel: 'Technology',
      author: 'Assembly Command',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Test Firebase connection and listen for Auth state
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        const storedProfile = localStorage.getItem(`profile_${user.uid}`);
        if (storedProfile) {
          try {
            setUserProfile(JSON.parse(storedProfile));
          } catch (e) {}
        }
      }
    });

    // Check for previous recruit session
    const cachedActiveRecruit = localStorage.getItem('campus_assembly_active_recruit');
    if (cachedActiveRecruit) {
      try {
        setConfirmedRegistration(JSON.parse(cachedActiveRecruit));
      } catch (e) {}
    }

    // Load announcements from server or storage
    fetch('/api/announcements')
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (data && data.length > 0) setAnnouncements(data);
      })
      .catch(() => {});

    return () => unsubscribe();
  }, []);

  const handleSelectMission = (missionId: string) => {
    setSelectedMissionId(missionId);
    // Smooth scroll to registration form
    const elem = document.getElementById('assemble');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRole = (role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent') => {
    setSelectedRole(role);
  };

  const handleTriggerPower = (power: HeroPowerType) => {
    setActivePower(power);
  };

  const handleRegistrationSuccess = (reg: ConfirmedRegistration) => {
    setConfirmedRegistration(reg);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleResetRegistration = () => {
    setConfirmedRegistration(null);
    localStorage.removeItem('campus_assembly_active_recruit');
  };

  const handleNavigateToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewAnnouncement = (ann: AnnouncementItem) => {
    setAnnouncements(prev => [ann, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#050710] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Real-time Announcements Ticker Bar */}
      <AnnouncementsTicker announcements={announcements} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onNavigateToSection={handleNavigateToSection}
      />

      <main className="flex-1">
        {/* Hero Section with Three.js 3D Multiverse Portal */}
        <section id="hero" className="relative">
          <ThreePortalScene
            onExploreMissions={() => handleNavigateToSection('missions')}
            onJoinAssembly={() => handleNavigateToSection('assemble')}
          />
        </section>

        {/* Story Briefing with Anomaly Lore & Countdown */}
        <StoryBriefing
          config={config}
          onJoinClick={() => handleNavigateToSection('assemble')}
        />

        {/* Event Explorer Directory with Hover Power Manifestations & 2D Character Images */}
        <EventExplorer
          missions={config.missions}
          selectedMissionId={selectedMissionId}
          onSelectMission={handleSelectMission}
          onTriggerPower={handleTriggerPower}
        />

        {/* Choose Your Role Personalization */}
        <RoleSelector
          roles={config.roles}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          onTriggerPower={handleTriggerPower}
        />

        {/* Registration Flow OR Confirmed Recruit Pass View */}
        {confirmedRegistration ? (
          <ConfirmationView
            registration={confirmedRegistration}
            config={config}
            onReset={handleResetRegistration}
            onTriggerPower={handleTriggerPower}
          />
        ) : (
          <RegistrationForm
            missions={config.missions}
            roles={config.roles}
            selectedMissionId={selectedMissionId}
            selectedRole={selectedRole}
            onMissionChange={id => setSelectedMissionId(id)}
            onRoleChange={role => setSelectedRole(role)}
            onRegistrationSuccess={handleRegistrationSuccess}
            onTriggerPower={handleTriggerPower}
          />
        )}

        {/* Intel FAQ & Logistics Section */}
        <FAQSection config={config} />
      </main>

      {/* Footer with Final Declaration & Disclaimer */}
      <Footer
        config={config}
        onRegisterClick={() => handleNavigateToSection('assemble')}
      />

      {/* AI Briefing Drawer */}
      <AIBriefingDrawer
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        config={config}
        onSelectMission={handleSelectMission}
        onSelectRole={handleSelectRole}
      />

      {/* User Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={profile => {
          setUserProfile(profile);
          if (profile.preferredRole) setSelectedRole(profile.preferredRole);
        }}
      />

      {/* Organizer Command Center / Real-Time Admin Dashboard */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onUpdateConfig={newConf => setConfig(newConf)}
        onNewAnnouncement={handleNewAnnouncement}
      />

      {/* Advanced Real-Time Color Customization & WCAG Accessibility Studio */}
      <ColorCustomizerDrawer
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />

      {/* Floating Theme Customization Trigger Pill */}
      <button
        onClick={() => setIsThemeOpen(true)}
        className="fixed bottom-6 right-6 z-30 px-3.5 py-2.5 rounded-full bg-[#0a0f26]/90 hover:bg-[#121c45] border border-purple-500/50 text-purple-300 font-mono-tech text-xs shadow-xl shadow-purple-950/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
        aria-label="Open UI Color Customization Studio"
        title="Customize portal colors in real time"
      >
        <span className="text-base">🎨</span>
        <span className="hidden sm:inline font-bold">THEME STUDIO</span>
      </button>

      {/* Screen-Wide Hero Power Manifestation Canvas & HUD Arsenal Overlay */}
      <HeroPowerEffectOverlay
        activePower={activePower}
        onAnimationComplete={() => setActivePower(null)}
        triggerPower={handleTriggerPower}
      />
    </div>
  );
}
