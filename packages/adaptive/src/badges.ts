export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  criterion: 'lesson' | 'module' | 'lab' | 'quiz-perfect';
  targetSlug?: string;
}

export interface BadgeEvent {
  type: 'lesson' | 'module' | 'lab' | 'quiz-perfect';
  slug: string;
}

const BADGE_KEY = 'earned_badges';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-lesson', name: 'First Step', emoji: '🚀', description: 'Complete your first lesson', criterion: 'lesson' },
  { id: 'foundations-complete', name: 'Rock Solid', emoji: '🪨', description: 'Complete the Foundations module', criterion: 'module', targetSlug: 'module-1-foundations' },
  { id: 'hooks-complete', name: 'Hook, Line & Sinker', emoji: '🪝', description: 'Complete the Hooks module', criterion: 'module', targetSlug: 'module-2-hooks' },
  { id: 'patterns-complete', name: 'Pattern Master', emoji: '🧩', description: 'Complete the Patterns module', criterion: 'module', targetSlug: 'module-3-patterns' },
  { id: 'first-lab', name: 'Lab Rat', emoji: '🧪', description: 'Complete your first lab', criterion: 'lab' },
  { id: 'quiz-perfect', name: 'Sharp Mind', emoji: '🎯', description: 'Score 100% on a lesson quiz', criterion: 'quiz-perfect' },
  { id: 'spfx-intro-complete', name: 'SPFx Explorer', emoji: '🗺️', description: 'Complete SPFx Introduction module', criterion: 'module', targetSlug: 'module-1-spfx-intro' },
  { id: 'spfx-deploy-complete', name: 'Ship It!', emoji: '📦', description: 'Complete the SPFx Deployment module', criterion: 'module', targetSlug: 'module-3-deployment' },
];

export function getEarnedBadges(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(BADGE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function awardBadge(id: string): string[] {
  const current = getEarnedBadges();
  if (current.includes(id)) return current;
  const updated = [...current, id];
  localStorage.setItem(BADGE_KEY, JSON.stringify(updated));
  return updated;
}

export function checkBadge(event: BadgeEvent, earned: string[]): BadgeDefinition | null {
  for (const badge of BADGE_DEFINITIONS) {
    if (earned.includes(badge.id)) continue;
    if (badge.criterion === event.type) {
      if (!badge.targetSlug || badge.targetSlug === event.slug) {
        return badge;
      }
    }
    if (badge.id === 'first-lesson' && event.type === 'lesson' && earned.length === 0) {
      return badge;
    }
  }
  return null;
}
