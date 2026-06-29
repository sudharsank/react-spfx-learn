'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from './client';

export function useVisitorCount(portal: 'react' | 'spfx') {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().slice(0, 10);

    // @ts-expect-error Supabase client is untyped without schema generation
    void supabase.rpc('increment_portal_stat', { p_portal: portal });

    supabase.from('portal_stats').select('count').eq('portal', portal).eq('date', today).maybeSingle().then((result: unknown) => {
      const { data } = result as { data: { count: number } | null };
      if (data) setCount(data.count as number);
    });
  }, [portal]);

  return count;
}
