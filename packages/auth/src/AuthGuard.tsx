'use client';

import { useAuth } from './useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGitHub, signInWithMicrosoft } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Sign in to continue</h2>
        <p className="text-gray-500 max-w-sm">
          Create a free account to access lessons, labs, and your personalised learning path.
        </p>
        <div className="flex gap-3">
          <button
            onClick={signInWithGitHub}
            className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={signInWithMicrosoft}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
