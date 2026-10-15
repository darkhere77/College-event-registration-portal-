import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { validateRegistration, generateDispatchCode } from './src/utils/registrationRules';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent cache for server-side store & fallback
interface ServerRegistration {
  id: string;
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

const registrationsStore: ServerRegistration[] = [
  {
    id: 'reg-demo-1',
    fullName: 'Maya Lin',
    collegeEmail: 'm.lin@campus.edu',
    studentId: '2024-CS-1092',
    department: 'Computer Science & AI',
    yearOfStudy: '3rd Year',
    eventId: 'TECH_ANOMALY_HACK',
    eventName: 'Quantum Anomaly Hackathon',
    squadRole: 'Engineer',
    teamName: 'Singularity Solvers',
    confirmationCode: 'ASSEMBLY-8F12-ENG',
    status: 'CHECKED_IN',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'reg-demo-2',
    fullName: 'Julian Santos',
    collegeEmail: 'j.santos@campus.edu',
    studentId: '2023-DS-8841',
    department: 'Media Arts & Interactive Design',
    yearOfStudy: '4th Year',
    eventId: 'DESIGN_MULTIVERSE_FORGE',
    eventName: 'Multiverse Design Forge',
    squadRole: 'Creator',
    confirmationCode: 'ASSEMBLY-9A33-CRE',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'reg-demo-3',
    fullName: 'Priya Narayanan',
    collegeEmail: 'p.narayanan@campus.edu',
    studentId: '2025-EE-4100',
    department: 'Quantum Engineering',
    yearOfStudy: '2nd Year',
    eventId: 'CHALLENGE_CAMPUS_DEFENSE',
    eventName: 'Campus Anomaly Hunt: Strike Protocol',
    squadRole: 'Strategist',
    teamName: 'Chronos Vanguard',
    confirmationCode: 'ASSEMBLY-B204-STR',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

const announcementsStore = [
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
];

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI();
}

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Avengers: Doomsday Campus Assembly Core Engine',
    timestamp: new Date().toISOString(),
  });
});

// 2. Registrations List (PII Protection compliant)
app.get('/api/registrations', (req: Request, res: Response) => {
  const isStaff = req.headers['x-staff-passcode'] === 'DOOMSDAY2026';
  if (!isStaff) {
    // Mask sensitive PII for non-privileged requests
    const sanitized = registrationsStore.map(r => ({
      ...r,
      studentId: '••-••••-••',
      phone: undefined,
      collegeEmail: r.collegeEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    }));
    return res.json(sanitized);
  }
  res.json(registrationsStore);
});

// 3. Create Registration (Server-side validation & duplicate check)
app.post('/api/registrations', (req: Request, res: Response) => {
  const body = req.body;
  const validation = validateRegistration(body);

  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid registration payload',
      details: validation.errors,
    });
  }

  // Prevent duplicate submissions by email + eventId
  const existing = registrationsStore.find(
    r =>
      r.collegeEmail.toLowerCase() === body.collegeEmail.toLowerCase() &&
      r.eventId === body.eventId
  );

  if (existing) {
    return res.status(409).json({
      error: 'Recruit already registered for this mission',
      existingConfirmation: existing.confirmationCode,
    });
  }

  const dispatchCode = body.confirmationCode || generateDispatchCode(body.squadRole);
  const newRec: ServerRegistration = {
    id: `reg-${Date.now()}`,
    fullName: body.fullName.trim(),
    collegeEmail: body.collegeEmail.trim().toLowerCase(),
    phone: body.phone ? body.phone.trim() : undefined,
    studentId: body.studentId.trim().toUpperCase(),
    department: body.department.trim(),
    yearOfStudy: body.yearOfStudy,
    eventId: body.eventId,
    eventName: body.eventName,
    squadRole: body.squadRole,
    teamName: body.teamName ? body.teamName.trim() : undefined,
    teammates: body.teammates ? body.teammates.trim() : undefined,
    dietaryOrAccess: body.dietaryOrAccess ? body.dietaryOrAccess.trim() : undefined,
    confirmationCode: dispatchCode,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  registrationsStore.unshift(newRec);
  res.status(201).json(newRec);
});

// 4. Announcements
app.get('/api/announcements', (_req: Request, res: Response) => {
  res.json(announcementsStore);
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const { title, content, priority, channel, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required.' });
  }

  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    priority: priority || 'NORMAL',
    channel: channel || 'Campus Wide',
    author: author || 'Organizer Command',
    createdAt: new Date().toISOString(),
  };

  announcementsStore.unshift(newAnn);
  res.status(201).json(newAnn);
});

// 5. Event Stats & Capacity Telemetry
app.get('/api/stats', (_req: Request, res: Response) => {
  const total = registrationsStore.length;
  const roleBreakdown = {
    Strategist: registrationsStore.filter(r => r.squadRole === 'Strategist').length,
    Engineer: registrationsStore.filter(r => r.squadRole === 'Engineer').length,
    Creator: registrationsStore.filter(r => r.squadRole === 'Creator').length,
    'Field Agent': registrationsStore.filter(r => r.squadRole === 'Field Agent').length,
  };

  res.json({
    totalRecruits: total,
    roleBreakdown,
    activeAnnouncements: announcementsStore.length,
    lastUpdated: new Date().toISOString(),
  });
});

// 6. Gemini AI Tactical Briefing Endpoint
app.post('/api/briefing', async (req: Request, res: Response) => {
  const { message, mode, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const systemInstruction = `You are JARVIS / TACTICAL MISSION COMMANDER for "Avengers: Doomsday — Campus Assembly" at Nova Institute of Advanced Technology & Multiverse Sciences.
A level-4 multiverse disruption has appeared on campus. You assist student recruits in discovering missions, understanding squad archetypes (Strategist, Engineer, Creator, Field Agent), navigating the schedule (Oct 24-25, 2026), and preparing equipment.
Keep answers witty, sharp, supportive, in-character, and concise (under 120 words).`;

  if (ai) {
    try {
      const selectedModel = mode === 'thinking' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';
      const promptText = `${systemInstruction}\n\nRecruit Query: ${message}`;

      const aiResponse = await ai.models.generateContent({
        model: selectedModel,
        contents: promptText,
      });

      return res.json({
        reply: aiResponse.text || 'Mission telemetry received. Prepare your squad.',
        model: selectedModel,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local tactician logic:', err.message);
    }
  }

  // Fallback intelligent responses
  const q = message.toLowerCase();
  let fallbackReply = `Recruit, anomaly telemetry is clear: every division from coding to cosplay is essential. Check the Mission Directory to lock in your squad deployment!`;

  if (q.includes('fee') || q.includes('cost') || q.includes('free')) {
    fallbackReply = `Affirmative: All recruitment entries are 100% complimentary thanks to university academic innovation grants. Rations and credentials are included.`;
  } else if (q.includes('hack') || q.includes('code') || q.includes('tech')) {
    fallbackReply = `For tech specialists, report to the "Quantum Anomaly Hackathon" (24hr sprint in Turing Labs) or the "AI Anomaly Defense Masterclass".`;
  } else if (q.includes('role') || q.includes('strategist') || q.includes('engineer')) {
    fallbackReply = `Choose your tactical style:\n• Strategist: Coordinates timeline defense\n• Engineer: Hacks defensive code & circuits\n• Creator: Visual and acoustic reality warping\n• Field Agent: Frontline physical & esports assault.`;
  } else if (q.includes('where') || q.includes('venue') || q.includes('location')) {
    fallbackReply = `Main staging is at the Grand Quantum Quadrangle, Building 7, with satellite hubs across the Turing Labs and Campus Arena.`;
  }

  res.json({ reply: fallbackReply, model: 'fallback-tactician' });
});

// Setup Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CAMPUS_ASSEMBLY_SERVER] Online at http://localhost:${PORT}`);
  });
}

startServer();
