/**
 * 2D Character Avatar Asset Registry for Campus Assembly
 */

import engineerImg from './images/quantum_engineer_hero_1792045424047.jpg';
import strategistImg from './images/mystic_strategist_hero_1792045498264.jpg';
import creatorImg from './images/reality_creator_hero_1792045547220.jpg';
import fieldAgentImg from './images/field_agent_hero_1792045611048.jpg';

export interface HeroCharacter {
  id: string;
  name: string;
  heroAlias: string;
  role: 'Strategist' | 'Engineer' | 'Creator' | 'Field Agent';
  powerName: 'arc_pulse' | 'mystic_mandala' | 'reality_hex' | 'thunder_surge' | 'vibranium_shockwave';
  powerTitle: string;
  powerDescription: string;
  image: string;
  primaryColor: string;
  accentColor: string;
  quote: string;
}

export const HERO_CHARACTERS: Record<string, HeroCharacter> = {
  Strategist: {
    id: 'char-strategist',
    name: 'Astra Thorne',
    heroAlias: 'The Multiverse Sorcerer',
    role: 'Strategist',
    powerName: 'mystic_mandala',
    powerTitle: 'Mystic Eldritch Mandala',
    powerDescription: 'Projects rotating dimensional rune shields and spacetime rift calculations.',
    image: strategistImg,
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    quote: 'Every timeline has a solution. We just calculate the winning frequency.',
  },
  Engineer: {
    id: 'char-engineer',
    name: 'Dr. Valery Chen',
    heroAlias: 'The Quantum Vanguard',
    role: 'Engineer',
    powerName: 'arc_pulse',
    powerTitle: 'Arc Reactor Repulsor Surge',
    powerDescription: 'Fires focused tachyon energy blasts and holographic neural countermeasures.',
    image: engineerImg,
    primaryColor: '#06b6d4',
    accentColor: '#38bdf8',
    quote: 'Give me 24 hours and a quantum terminal, and I will re-engineer reality.',
  },
  Creator: {
    id: 'char-creator',
    name: 'Damian Vance',
    heroAlias: 'The Reality Architect',
    role: 'Creator',
    powerName: 'reality_hex',
    powerTitle: 'Chaos Hex Reality Warp',
    powerDescription: 'Bends light, matter, and visual perception using harmonic fractal crystals.',
    image: creatorImg,
    primaryColor: '#c084fc',
    accentColor: '#f43f5e',
    quote: 'Reality is malleable canvas. We paint the future we refuse to lose.',
  },
  'Field Agent': {
    id: 'char-field-agent',
    name: 'Captain Marcus Shaw',
    heroAlias: 'Shockwave Strike Agent',
    role: 'Field Agent',
    powerName: 'thunder_surge',
    powerTitle: 'Bifrost Thunder & Kinetic Surge',
    powerDescription: 'Channels ionized lightning bolts and kinetic ground-pound shockwaves.',
    image: fieldAgentImg,
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    quote: 'When an anomaly threatens campus, we don’t retreat. We charge straight through.',
  },
};

export interface MissionManifestationInfo {
  hero: HeroCharacter;
  manifestationClass: 'card-manifest-electric' | 'card-manifest-kinetic' | 'card-manifest-mystic' | 'card-manifest-hex';
  effectName: string;
  effectBadge: string;
  elementalColor: string;
  accentBorder: string;
}

export function getMissionManifestation(category: string): MissionManifestationInfo {
  switch (category) {
    case 'Technology':
    case 'Esports':
      return {
        hero: HERO_CHARACTERS['Engineer'],
        manifestationClass: 'card-manifest-electric',
        effectName: 'Electrical Arc Surge',
        effectBadge: '⚡ ELECTRICAL SURGE',
        elementalColor: 'text-cyan-400',
        accentBorder: 'border-cyan-500/50',
      };
    case 'Arts & Design':
    case 'Cosplay':
      return {
        hero: HERO_CHARACTERS['Creator'],
        manifestationClass: 'card-manifest-hex',
        effectName: 'Chaos Reality Distortion',
        effectBadge: '🔮 HEX REALITY WARP',
        elementalColor: 'text-rose-400',
        accentBorder: 'border-rose-500/50',
      };
    case 'Workshops':
    case 'Quizzes':
      return {
        hero: HERO_CHARACTERS['Strategist'],
        manifestationClass: 'card-manifest-mystic',
        effectName: 'Mystic Eldritch Mandala',
        effectBadge: '✨ MYSTIC AURA',
        elementalColor: 'text-amber-400',
        accentBorder: 'border-amber-500/50',
      };
    case 'Team Challenges':
    case 'Music':
    default:
      return {
        hero: HERO_CHARACTERS['Field Agent'],
        manifestationClass: 'card-manifest-kinetic',
        effectName: 'Kinetic Shockwave Pulse',
        effectBadge: '💥 KINETIC PULSE',
        elementalColor: 'text-purple-400',
        accentBorder: 'border-purple-500/50',
      };
  }
}
