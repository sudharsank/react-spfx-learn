'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithGitHub() {
    const supabase = getSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.href },
    });
  }

  async function signInWithMicrosoft() {
    const supabase = getSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: window.location.href },
    });
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }

  return { user, loading, signInWithGitHub, signInWithMicrosoft, signOut };
}
