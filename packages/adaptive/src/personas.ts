export type ReactPersona = 'spark' | 'builder' | 'craftsman' | 'consultant';
export type SpfxPersona = 'explorer' | 'maker' | 'architect' | 'integrator';
export type Persona = ReactPersona | SpfxPersona;

export interface PersonaDefinition {
  id: Persona;
  label: string;
  tagline: string;
  description: string;
  contentDepth: 'beginner' | 'intermediate' | 'advanced';
  color: string;
}

export const REACT_PERSONAS: PersonaDefinition[] = [
  {
    id: 'spark',
    label: 'Spark',
    tagline: 'New to web development',
    description: 'You know HTML and CSS but React is new territory. We start from the why, not the how.',
    contentDepth: 'beginner',
    color: 'oklch(0.70 0.18 60)',
  },
  {
    id: 'builder',
    label: 'Builder',
    tagline: 'JavaScript developer learning React',
    description: 'You write JS confidently. Now you want to understand React patterns, not just syntax.',
    contentDepth: 'intermediate',
    color: 'oklch(0.55 0.22 250)',
  },
  {
    id: 'craftsman',
    label: 'Craftsman',
    tagline: 'Senior dev going deep',
    description: 'You ship React daily. You want internals, performance, and the things most tutorials skip.',
    contentDepth: 'advanced',
    color: 'oklch(0.45 0.20 290)',
  },
  {
    id: 'consultant',
    label: 'Consultant',
    tagline: 'Delivering React for clients',
    description: 'You need real-world trade-offs, cost of decisions, and what to tell clients when they ask why.',
    contentDepth: 'intermediate',
    color: 'oklch(0.60 0.20 160)',
  },
];

export const SPFX_PERSONAS: PersonaDefinition[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    tagline: 'SharePoint admin, minimal coding',
    description: 'You manage SharePoint but rarely write code. SPFx feels intimidating — we start gentle.',
    contentDepth: 'beginner',
    color: 'oklch(0.70 0.18 60)',
  },
  {
    id: 'maker',
    label: 'Maker',
    tagline: 'React dev new to SPFx',
    description: 'You know React. Now you want to deploy it inside SharePoint using SPFx and the Heft toolchain.',
    contentDepth: 'intermediate',
    color: 'oklch(0.55 0.22 250)',
  },
  {
    id: 'architect',
    label: 'Architect',
    tagline: 'Enterprise SPFx solutions',
    description: 'You build production SPFx solutions. You care about extensions, governance, and CI/CD.',
    contentDepth: 'advanced',
    color: 'oklch(0.45 0.20 290)',
  },
  {
    id: 'integrator',
    label: 'Integrator',
    tagline: 'Microsoft partner / consultant',
    description: 'You deliver SPFx for clients. Estimation, tenant setup, licensing, and handoff matter to you.',
    contentDepth: 'intermediate',
    color: 'oklch(0.60 0.20 160)',
  },
];
