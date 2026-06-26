export const HINT_TOKEN_KEY = 'hint_tokens';
const DEFAULT_TOKENS = 10;

export function getHintTokens(): number {
  if (typeof window === 'undefined') return DEFAULT_TOKENS;
  const val = localStorage.getItem(HINT_TOKEN_KEY);
  return val === null ? DEFAULT_TOKENS : parseInt(val, 10);
}

export function consumeHintToken(): number {
  const current = getHintTokens();
  const next = Math.max(0, current - 1);
  localStorage.setItem(HINT_TOKEN_KEY, String(next));
  return next;
}

export function replenishHintTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HINT_TOKEN_KEY, String(DEFAULT_TOKENS));
  }
}
