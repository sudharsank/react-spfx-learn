'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from './client';
import { useAuth } from './useAuth';

export type Persona = 'spark' | 'builder' | 'craftsman' | 'consultant' | 'architect' | 'explorer';

function lsKey(portal: string) {
  return `persona_${portal}`;
}

export function useProfile(portal: 'react' | 'spfx') {
  const { user } = useAuth();
  const [persona, setPersonaState] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(lsKey(portal)) as Persona | null;
    if (cached) setPersonaState(cached);

    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    supabase
      .from('user_profiles')
      .select('persona')
      .eq('portal', portal)
      .maybeSingle()
      .then((result: unknown) => {
        const { data } = result as { data: { persona: string } | null };
        if (data?.persona) {
          setPersonaState(data.persona as Persona);
          localStorage.setItem(lsKey(portal), data.persona);
        }
        setLoading(false);
      });
  }, [user, portal]);

  const setPersona = useCallback(
    async (p: Persona) => {
      setPersonaState(p);
      if (typeof window !== 'undefined') {
        localStorage.setItem(lsKey(portal), p);
      }
      if (!user) return;
      const supabase = getSupabaseClient();
      // @ts-expect-error Supabase client is untyped without schema generation
      await supabase.from('user_profiles').upsert([{ user_id: user.id, portal, persona: p }], { onConflict: 'user_id,portal' });
    },
    [user, portal]
  );

  return { persona, setPersona, loading };
}
