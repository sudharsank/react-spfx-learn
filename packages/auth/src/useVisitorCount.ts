'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from './client';

export function useVisitorCount(portal: 'react' | 'spfx') {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().slice(0, 10);

    (supabase as any).rpc('increment_portal_stat', { p_portal: portal });

    supabase
      .from('portal_stats')
      .select('count')
      .eq('portal', portal)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setCount(data.count as number);
      });
  }, [portal]);

  return count;
}
