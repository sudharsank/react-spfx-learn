'use client';

import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { getHintTokens } from '@repo/adaptive';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, signInWithGitHub, signInWithMicrosoft, signOut } = useAuth();
  const [tokens, setTokens] = useState<number>(10);

  useEffect(() => {
    setTokens(getHintTokens());
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--color-brand)] text-lg">
          ⬡ SPFx Learn
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/learn" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Lessons
          </Link>
          <Link href="/labs" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Labs
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[oklch(0.97_0.02_60)] border border-[var(--color-warning)] text-[var(--color-warning)] font-medium">
            💡 {tokens}
          </span>
          {user ? (
            <button
              onClick={signOut}
              className="text-sm px-4 py-1.5 border border-gray-200 rounded-full hover:border-[var(--color-brand)] transition-colors"
            >
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={signInWithGitHub}
                className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-full hover:opacity-90"
              >
                GitHub
              </button>
              <button
                onClick={signInWithMicrosoft}
                className="text-sm px-4 py-1.5 bg-[var(--color-brand)] text-white rounded-full hover:opacity-90"
              >
                Microsoft
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
