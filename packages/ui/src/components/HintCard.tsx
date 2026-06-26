'use client';

import { useState } from 'react';

export interface HintCardProps {
  hint: string;
  onReveal: () => void;
  tokenBalance: number;
}

export function HintCard({ hint, onReveal, tokenBalance }: HintCardProps) {
  const [revealed, setRevealed] = useState(false);

  function handleReveal() {
    if (tokenBalance <= 0) return;
    setRevealed(true);
    onReveal();
  }

  return (
    <div className="my-4 rounded-[var(--radius-card)] border border-[var(--color-warning)] bg-[oklch(0.98_0.02_60)]">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-[var(--color-warning)] flex items-center gap-2">
          💡 Hint Available
        </span>
        {!revealed && (
          <button
            onClick={handleReveal}
            disabled={tokenBalance <= 0}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-warning)] text-white font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tokenBalance <= 0 ? 'No tokens' : `Reveal (costs 1 token · ${tokenBalance} left)`}
          </button>
        )}
      </div>
      {revealed && (
        <div className="px-4 py-3 border-t border-[oklch(0.90_0.05_60)] text-sm text-gray-700">
          {hint}
        </div>
      )}
    </div>
  );
}
