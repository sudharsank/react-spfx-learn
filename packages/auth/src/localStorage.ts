export interface GuestProgress {
  persona: string | null;
  completedLessons: string[];
  adaptiveScore: Record<string, number>;
}

const KEY = 'learn_guest_progress';

export function getGuestProgress(): GuestProgress {
  if (typeof window === 'undefined') {
    return { persona: null, completedLessons: [], adaptiveScore: {} };
  }
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null') ?? {
      persona: null,
      completedLessons: [],
      adaptiveScore: {},
    };
  } catch {
    return { persona: null, completedLessons: [], adaptiveScore: {} };
  }
}

export function setGuestProgress(progress: Partial<GuestProgress>) {
  if (typeof window === 'undefined') return;
  const current = getGuestProgress();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...progress }));
}

export function clearGuestProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
