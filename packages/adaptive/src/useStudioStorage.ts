'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface StudioFile {
  name: string;
  content: string;
}

const LS_KEY = (portal: string) => `studio_files_${portal}`;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function useStudioStorage(portal: 'react' | 'spfx') {
  const [files, setFilesState] = useState<StudioFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabase();
    if (!supabase) {
      const raw = localStorage.getItem(LS_KEY(portal));
      if (raw) {
        try {
          setFilesState(JSON.parse(raw));
        } catch {
          localStorage.removeItem(LS_KEY(portal));
        }
      }
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        const raw = localStorage.getItem(LS_KEY(portal));
        if (raw) {
          try {
            setFilesState(JSON.parse(raw));
          } catch {
            localStorage.removeItem(LS_KEY(portal));
          }
        }
        setLoading(false);
        return;
      }
      supabase
        .from('studio_files')
        .select('filename, content')
        .eq('portal', portal)
        .then(({ data: rows }) => {
          if (rows) {
            setFilesState(rows.map((r) => ({ name: r.filename, content: r.content })));
          }
          setLoading(false);
        });
    });
  }, [portal]);

  const setFiles = useCallback(
    (next: StudioFile[]) => {
      setFilesState(next);
      if (typeof window === 'undefined') return;
      const supabase = getSupabase();
      if (!supabase) {
        localStorage.setItem(LS_KEY(portal), JSON.stringify(next));
        return;
      }
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) {
          localStorage.setItem(LS_KEY(portal), JSON.stringify(next));
          return;
        }
        const upserts = next.map((f) => ({
          user_id: data.user!.id,
          portal,
          filename: f.name,
          content: f.content,
          updated_at: new Date().toISOString(),
        }));
        supabase.from('studio_files').upsert(upserts, { onConflict: 'user_id,portal,filename' });
      });
    },
    [portal]
  );

  return { files, setFiles, loading };
}
