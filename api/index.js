const registrationsStore = [
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

function generateDispatchCode(role = 'ENGINEER') {
  const roleCode = String(role).slice(0, 3).toUpperCase();
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestampHex = (Date.now() % 10000).toString(16).toUpperCase().padStart(4, '0');
  return `ASSEMBLY-${timestampHex}-${randomHex}-${roleCode}`;
}

function validateRegistration(data = {}) {
  const errors = {};
  if (!data.fullName || String(data.fullName).trim().length < 2) errors.fullName = 'Full name must be at least 2 characters.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.collegeEmail || !emailRegex.test(String(data.collegeEmail).trim())) errors.collegeEmail = 'Please provide a valid college or institutional email.';
  if (!data.studentId || String(data.studentId).trim().length < 2) errors.studentId = 'Student or Campus ID is required (min 2 characters).';
  if (!data.department || String(data.department).trim().length < 2) errors.department = 'Department / Major is required.';
  if (!data.yearOfStudy) errors.yearOfStudy = 'Please select a valid year of study.';
  if (!data.eventId || String(data.eventId).trim().length < 2) errors.eventId = 'Please select an event mission.';
  if (!data.squadRole) errors.squadRole = 'Please select a squad tactical role.';
  if (!data.rulesAgreed) errors.rulesAgreed = 'You must agree to campus event rules and safety protocols.';
  if (data.phone && String(data.phone).trim().length > 0) {
    const cleanPhone = String(data.phone).replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) errors.phone = 'Phone number must be between 7 and 15 digits.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

async function readBody(req) {
  if (!req.body) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    if (!chunks.length) return {};
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

async function sendWhatsAppRegistrationConfirmation(registration) {
  if (!registration.whatsappOptIn) return;

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const missingConfig = [
    !accessToken && 'WHATSAPP_ACCESS_TOKEN',
    !phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID',
    !templateName && 'WHATSAPP_TEMPLATE_NAME',
  ].filter(Boolean);
  if (missingConfig.length) {
    registration.whatsappDeliveryStatus = 'FAILED';
    registration.whatsappDeliveryError = `WhatsApp is not configured on the server. Missing: ${missingConfig.join(', ')}.`;
    return;
  }

  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0';
  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: registration.phone.replace(/^\+/, ''),
          type: 'template',
          template: {
            name: templateName,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: registration.fullName },
                { type: 'text', text: registration.eventName },
                { type: 'text', text: registration.confirmationCode },
              ],
            }],
          },
        }),
      }
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      registration.whatsappDeliveryStatus = 'FAILED';
      registration.whatsappDeliveryError =
        result?.error?.message || `WhatsApp rejected the message (HTTP ${response.status}).`;
      console.error('WhatsApp Cloud API rejected a registration confirmation.');
      return;
    }
    registration.whatsappDeliveryStatus = 'SENT';
    registration.whatsappDeliveryError = undefined;
  } catch (error) {
    registration.whatsappDeliveryStatus = 'FAILED';
    registration.whatsappDeliveryError = 'Could not connect to WhatsApp. Please try again later.';
    console.error('WhatsApp Cloud API request failed:', error);
  }
}

export default async function handler(req, res) {
  const pathname = new URL(req.url, 'https://placeholder.local').pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    return res.status(200).json({
      status: 'ONLINE',
      service: 'Avengers: Doomsday Campus Assembly Core Engine',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'GET' && pathname === '/api/registrations') {
    const isStaff = req.headers['x-staff-passcode'] === 'DOOMSDAY2026';
    const sanitized = registrationsStore.map((r) => ({
      ...r,
      studentId: isStaff ? r.studentId : '••-••••-••',
      phone: isStaff ? r.phone : undefined,
      collegeEmail: isStaff ? r.collegeEmail : r.collegeEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    }));
    return res.status(200).json(isStaff ? registrationsStore : sanitized);
  }

  if (req.method === 'POST' && pathname === '/api/registrations') {
    const body = await readBody(req);
    const validation = validateRegistration(body);

    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid registration payload', details: validation.errors });
    }
    if (body.whatsappOptIn === true && (typeof body.phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(body.phone.trim()))) {
      return res.status(400).json({ error: 'A valid international-format WhatsApp number is required when opting in.' });
    }

    const existing = registrationsStore.find(
      (r) => r.collegeEmail.toLowerCase() === String(body.collegeEmail || '').toLowerCase() && r.eventId === body.eventId
    );

    if (existing) {
      return res.status(409).json({ error: 'Recruit already registered for this mission', existingConfirmation: existing.confirmationCode });
    }

    const dispatchCode = body.confirmationCode || generateDispatchCode(body.squadRole || 'ENGINEER');
    const newRec = {
      id: `reg-${Date.now()}`,
      fullName: String(body.fullName || '').trim(),
      collegeEmail: String(body.collegeEmail || '').trim().toLowerCase(),
      phone: body.phone ? String(body.phone).trim() : undefined,
      studentId: String(body.studentId || '').trim().toUpperCase(),
      department: String(body.department || '').trim(),
      yearOfStudy: body.yearOfStudy,
      eventId: body.eventId,
      eventName: body.eventName,
      squadRole: body.squadRole,
      teamName: body.teamName ? String(body.teamName).trim() : undefined,
      teammates: body.teammates ? String(body.teammates).trim() : undefined,
      dietaryOrAccess: body.dietaryOrAccess ? String(body.dietaryOrAccess).trim() : undefined,
      memberPassId: typeof body.memberPassId === 'string' ? body.memberPassId : undefined,
      whatsappOptIn: body.whatsappOptIn === true,
      whatsappDeliveryStatus: body.whatsappOptIn === true ? 'PENDING' : 'NOT_REQUESTED',
      confirmationCode: dispatchCode,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    registrationsStore.unshift(newRec);
    await sendWhatsAppRegistrationConfirmation(newRec);
    return res.status(201).json(newRec);
  }

  if (req.method === 'GET' && pathname === '/api/announcements') {
    return res.status(200).json(announcementsStore);
  }

  if (req.method === 'POST' && pathname === '/api/announcements') {
    const body = await readBody(req);
    const { title, content, priority, channel, author } = body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required.' });
    }

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: String(title),
      content: String(content),
      priority: priority || 'NORMAL',
      channel: channel || 'WhatsApp',
      author: author || 'Organizer Command',
      createdAt: new Date().toISOString(),
    };

    announcementsStore.unshift(newAnn);
    return res.status(201).json(newAnn);
  }

  if (req.method === 'GET' && pathname === '/api/stats') {
    const total = registrationsStore.length;
    const roleBreakdown = {
      Strategist: registrationsStore.filter((r) => r.squadRole === 'Strategist').length,
      Engineer: registrationsStore.filter((r) => r.squadRole === 'Engineer').length,
      Creator: registrationsStore.filter((r) => r.squadRole === 'Creator').length,
      'Field Agent': registrationsStore.filter((r) => r.squadRole === 'Field Agent').length,
    };

    return res.status(200).json({
      totalRecruits: total,
      roleBreakdown,
      activeAnnouncements: announcementsStore.length,
      lastUpdated: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && pathname === '/api/briefing') {
    const body = await readBody(req);
    const { message, mode } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const q = message.toLowerCase();
    let fallbackReply = 'Recruit, anomaly telemetry is clear: every division from coding to cosplay is essential. Check the Mission Directory to lock in your squad deployment!';

    if (q.includes('fee') || q.includes('cost') || q.includes('free')) {
      fallbackReply = 'Affirmative: All recruitment entries are 100% complimentary thanks to university academic innovation grants. Rations and credentials are included.';
    } else if (q.includes('hack') || q.includes('code') || q.includes('tech')) {
      fallbackReply = 'For tech specialists, report to the "Quantum Anomaly Hackathon" (24hr sprint in Turing Labs) or the "AI Anomaly Defense Masterclass".';
    } else if (q.includes('role') || q.includes('strategist') || q.includes('engineer')) {
      fallbackReply = 'Choose your tactical style:\n• Strategist: Coordinates timeline defense\n• Engineer: Hacks defensive code & circuits\n• Creator: Visual and acoustic reality warping\n• Field Agent: Frontline physical & esports assault.';
    } else if (q.includes('where') || q.includes('venue') || q.includes('location')) {
      fallbackReply = 'Main staging is at the Grand Quantum Quadrangle, Building 7, with satellite hubs across the Turing Labs and Campus Arena.';
    }

    return res.status(200).json({
      reply: fallbackReply,
      model: mode === 'thinking' ? 'thinking-fallback' : 'fallback-tactician',
    });
  }

  return res.status(404).json({ error: 'Not found' });
}
