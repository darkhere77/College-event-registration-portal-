/**
 * CENTRAL EVENT CONFIGURATION
 * 
 * Edit this file to customize event dates, college details, contact info,
 * mission categories, and fee structure for your campus.
 */

export interface EventMission {
  id: string;
  name: string;
  category: 'Technology' | 'Arts & Design' | 'Esports' | 'Workshops' | 'Cosplay' | 'Quizzes' | 'Team Challenges' | 'Music';
  shortDescription: string;
  fullBrief: string;
  dateTime: string;
  venue: string;
  eligibility: string;
  teamSize: string;
  minTeam: number;
  maxTeam: number;
  totalSeats: number;
  filledSeats: number;
  badgeCode: string;
  accentColor: string;
}

export interface SquadRoleConfig {
  id: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  title: string;
  tagline: string;
  description: string;
  attributes: string[];
  insignia: string; // SVG icon identifier
  color: string;
}

export interface EventConfig {
  eventName: string;
  edition: string;
  eyebrow: string;
  mainHeadline: string;
  supportingCopy: string;
  collegeName: string;
  eventDateDisplay: string;
  eventStartDateISO: string;
  eventEndDateISO: string;
  venueDisplay: string;
  venueAddress: string;
  venueCoordinates?: { lat: number; lng: number };
  registrationDeadlineDisplay: string;
  registrationDeadlineISO: string;
  contactEmail: string;
  contactPhone: string;
  registrationFee: string;
  websiteLanguage: string;
  organizerPasscode: string; // Default organizer PIN for demo/testing
  missions: EventMission[];
  roles: SquadRoleConfig[];
  faqs: { question: string; answer: string; category: string }[];
}

export const INITIAL_EVENT_CONFIG: EventConfig = {
  eventName: "AVENGERS: DOOMSDAY — CAMPUS ASSEMBLY",
  edition: "CAMPUS PROTOCOL 2026",
  eyebrow: "AN ANOMALY HAS BEEN DETECTED",
  mainHeadline: "THE CAMPUS NEEDS YOU.",
  supportingCopy: "One campus. Infinite possibilities. One team. A dimensional fracture has appeared across our academic timeline—recruit your squad and assemble.",
  collegeName: "Nova Institute of Advanced Technology & Multiverse Sciences",
  eventDateDisplay: "October 24 – 25, 2026",
  eventStartDateISO: "2026-10-24T09:00:00Z",
  eventEndDateISO: "2026-10-25T20:00:00Z",
  venueDisplay: "Grand Quantum Quadrangle & Innovation Labs",
  venueAddress: "Building 7, High-Energy Research Complex, Campus North Grounds",
  registrationDeadlineDisplay: "October 22, 2026 • 23:59 IST",
  registrationDeadlineISO: "2026-10-22T23:59:00Z",
  contactEmail: "assembly.command@nova-tech.edu",
  contactPhone: "+1 (555) 019-3000",
  registrationFee: "FREE / RECRUIT ENTRY COMPLIMENTARY",
  websiteLanguage: "English (US/UK)",
  organizerPasscode: "DOOMSDAY2026",
  roles: [
    {
      id: "Strategist",
      title: "Tactical Strategist",
      tagline: "Mastermind behind timeline integrity & squad cohesion",
      description: "You analyze shifting multiverse anomalies, coordinate logistics, and keep team decision-making razor-sharp under pressure.",
      attributes: ["Crisis Decision-Making", "Resource Allocation", "Scenario Mapping"],
      insignia: "compass",
      color: "from-amber-500/20 to-amber-700/30 border-amber-500/50 text-amber-300"
    },
    {
      id: "Engineer",
      title: "Quantum Engineer",
      tagline: "Builders of tachyon stabilizers & neural countermeasures",
      description: "You decode anomaly frequencies, construct robust software/hardware defenses, and bridge corrupted dimensional protocols.",
      attributes: ["Rapid Prototyping", "Signal Synthesis", "Defensive Architectures"],
      insignia: "cpu",
      color: "from-cyan-500/20 to-blue-700/30 border-cyan-500/50 text-cyan-300"
    },
    {
      id: "Creator",
      title: "Dimensional Creator",
      tagline: "Visionaries crafting reality, soundscapes & visual artifacts",
      description: "You reshape perception through striking UI/UX, dimensional audio resonance, and compelling multiverse narratives.",
      attributes: ["Visual Transmission", "Atmospheric Audio", "Multiverse Narrative"],
      insignia: "sparkles",
      color: "from-purple-500/20 to-fuchsia-700/30 border-purple-500/50 text-purple-300"
    },
    {
      id: "Field Agent",
      title: "Frontline Field Agent",
      tagline: "Rapid-response operatives executing campus-wide missions",
      description: "You lead physical campus recon, esports tactical assaults, and fast-paced anomaly containment trials on the ground.",
      attributes: ["Reflex Execution", "Campus Recon", "Tactical Mobility"],
      insignia: "shield",
      color: "from-rose-500/20 to-red-700/30 border-rose-500/50 text-rose-300"
    }
  ],
  missions: [
    {
      id: "TECH_ANOMALY_HACK",
      name: "Quantum Anomaly Hackathon",
      category: "Technology",
      shortDescription: "24-hour sprint to build AI, security, or web solutions that detect and seal timeline disruptions.",
      fullBrief: "Participants develop working prototypes utilizing modern web tech, LLMs, or distributed nodes to solve simulated timeline fractures.",
      dateTime: "Oct 24, 10:00 AM – Oct 25, 10:00 AM",
      venue: "Turing Lab & Quantum Annex (Hall B)",
      eligibility: "Open to all enrolled undergraduate & graduate students",
      teamSize: "2 – 4 Members",
      minTeam: 2,
      maxTeam: 4,
      totalSeats: 120,
      filledSeats: 86,
      badgeCode: "MISSION-HACK-01",
      accentColor: "border-cyan-500/40 text-cyan-400"
    },
    {
      id: "DESIGN_MULTIVERSE_FORGE",
      name: "Multiverse Design Forge",
      category: "Arts & Design",
      shortDescription: "UI/UX & speculative 3D visual design challenge for interdimensional communication systems.",
      fullBrief: "Craft intuitive interfaces, kinetic posters, or 3D holographic models that make complex anomaly telemetry comprehensible for non-experts.",
      dateTime: "Oct 24, 02:00 PM – 06:00 PM",
      venue: "Media Arts Studio 3, Digital Arts Wing",
      eligibility: "All disciplines welcome (Designers, Illustrators, Architects)",
      teamSize: "Solo or Duo (1 – 2)",
      minTeam: 1,
      maxTeam: 2,
      totalSeats: 60,
      filledSeats: 42,
      badgeCode: "MISSION-FORGE-02",
      accentColor: "border-fuchsia-500/40 text-fuchsia-400"
    },
    {
      id: "ESPORTS_CHRONOS_ARENA",
      name: "Chronos Esports Showdown",
      category: "Esports",
      shortDescription: "High-octane tactical squad tournament across battle arenas to determine the campus's apex strike force.",
      fullBrief: "Double-elimination bracket with live shoutcasting, synchronized HUDs, and tactical spectator arenas.",
      dateTime: "Oct 24, 11:00 AM – 08:00 PM",
      venue: "Student Union Arena & Gaming Lounge",
      eligibility: "Campus students with verified team rosters",
      teamSize: "5 Members + 1 Sub",
      minTeam: 5,
      maxTeam: 6,
      totalSeats: 96,
      filledSeats: 75,
      badgeCode: "MISSION-ARENA-03",
      accentColor: "border-emerald-500/40 text-emerald-400"
    },
    {
      id: "WORKSHOP_PORTAL_AI",
      name: "AI Anomaly Defense Masterclass",
      category: "Workshops",
      shortDescription: "Hands-on guided workshop on agentic AI workflows, multimodal models, and prompt architectures.",
      fullBrief: "Bring your laptop for guided coding, building autonomous reasoning pipelines, and real-time anomaly telemetry classifiers.",
      dateTime: "Oct 25, 10:30 AM – 01:00 PM",
      venue: "Auditorium Delta, Science Center",
      eligibility: "Beginner to Intermediate programmers",
      teamSize: "Individual / Solo",
      minTeam: 1,
      maxTeam: 1,
      totalSeats: 150,
      filledSeats: 114,
      badgeCode: "MISSION-CLASS-04",
      accentColor: "border-amber-500/40 text-amber-400"
    },
    {
      id: "CHALLENGE_CAMPUS_DEFENSE",
      name: "Campus Anomaly Hunt: Strike Protocol",
      category: "Team Challenges",
      shortDescription: "Campus-wide physical and cryptographic puzzle hunt across secret checkpoints and historic landmarks.",
      fullBrief: "Decode cipher coordinates, scan physical QR nodes, and recover timeline relics scattered across campus grounds within a 3-hour window.",
      dateTime: "Oct 25, 02:30 PM – 05:30 PM",
      venue: "Central Quad (Briefing & Start Line)",
      eligibility: "Teams of 3 to 4 students",
      teamSize: "3 – 4 Members",
      minTeam: 3,
      maxTeam: 4,
      totalSeats: 200,
      filledSeats: 158,
      badgeCode: "MISSION-HUNT-05",
      accentColor: "border-rose-500/40 text-rose-400"
    },
    {
      id: "QUIZ_OMNIVERSE_INTEL",
      name: "Omniverse Brainiac Intel Quiz",
      category: "Quizzes",
      shortDescription: "Intellectual battlefield covering astrophysics, theoretical timelines, sci-fi cinema, and pop culture.",
      fullBrief: "Multi-round multimedia quiz with buzzer rounds, audio identification, and high-stakes speculative science dilemmas.",
      dateTime: "Oct 24, 04:00 PM – 06:30 PM",
      venue: "Hall of Sciences, Room 101",
      eligibility: "All undergraduate & graduate cohorts",
      teamSize: "2 – 3 Members",
      minTeam: 2,
      maxTeam: 3,
      totalSeats: 80,
      filledSeats: 59,
      badgeCode: "MISSION-QUIZ-06",
      accentColor: "border-indigo-500/40 text-indigo-400"
    },
    {
      id: "COSPLAY_ARMOR_PROTOCOL",
      name: "Armor & Multiverse Cosplay Showcase",
      category: "Cosplay",
      shortDescription: "Celebration of craftsmanship, armor smithing, multiverse variants, and theatrical stage performance.",
      fullBrief: "Judged on craftsmanship, original variant concepts, material engineering, and 90-second stage presence.",
      dateTime: "Oct 25, 06:00 PM – 08:30 PM",
      venue: "Main Amphitheater",
      eligibility: "Solo contestants or Duo presentations",
      teamSize: "Solo or Duo (1 – 2)",
      minTeam: 1,
      maxTeam: 2,
      totalSeats: 50,
      filledSeats: 38,
      badgeCode: "MISSION-COS-07",
      accentColor: "border-violet-500/40 text-violet-400"
    },
    {
      id: "MUSIC_CYBER_RESONANCE",
      name: "Cyber Sonic Resonance Stage",
      category: "Music",
      shortDescription: "Electronic synth, ambient orchestral, and live band performances scoring the ultimate campus assembly.",
      fullBrief: "Live battle of campus musicians and electronic music producers performing original sci-fi & battle-themed compositions.",
      dateTime: "Oct 25, 08:30 PM – 11:00 PM",
      venue: "Amphitheater Open Air Stage",
      eligibility: "Solo performers or bands (up to 6 members)",
      teamSize: "1 – 6 Members",
      minTeam: 1,
      maxTeam: 6,
      totalSeats: 300,
      filledSeats: 210,
      badgeCode: "MISSION-SONIC-08",
      accentColor: "border-sky-500/40 text-sky-400"
    }
  ],
  faqs: [
    {
      category: "Registration & Eligibility",
      question: "Who is eligible to participate in the Campus Assembly?",
      answer: "All currently enrolled students, researchers, and campus faculty from any department or year of study are eligible. Cross-department squads are strongly encouraged!"
    },
    {
      category: "Registration & Eligibility",
      question: "Is there any registration fee for participants?",
      answer: "No. Registration is 100% complimentary for all recruits thanks to campus student council and academic innovation sponsorship. Official recruit credentials, meal rations, and event badges are included."
    },
    {
      category: "Squads & Teams",
      question: "Can I register as an individual if I don't have a team yet?",
      answer: "Yes! Solo recruits will be paired into balanced tactical strike squads during the opening orientation assembly or can select solo missions like the Masterclass or Cosplay Showcase."
    },
    {
      category: "Squads & Teams",
      question: "What does the Squad Role (Strategist, Engineer, Creator, Field Agent) mean?",
      answer: "Squad Roles are fun tactical specializations that highlight how you like to contribute to your team. They personalize your digital recruit dossier and badge. You are free to pick whichever matches your style!"
    },
    {
      category: "Event Logistics",
      question: "What should I bring on mission days?",
      answer: "Bring your college ID card, your digital recruit pass (QR code or confirmation code on phone), a laptop and charger (if participating in Hackathon, Masterclass, or Design Forge), and your squad spirit."
    },
    {
      category: "Event Logistics",
      question: "Are accommodations or dietary needs supported?",
      answer: "Yes! The registration form includes an optional field for accessibility accommodations, wheelchair access, or specific dietary requirements so organizers can prepare in advance."
    }
  ]
};
