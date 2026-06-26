'use client';

import { useState, useEffect } from 'react';

type ContentDepth = 'simplified' | 'standard' | 'enriched';
type Persona = 'spark' | 'builder' | 'craftsman' | 'consultant' | 'explorer' | 'maker' | 'architect' | 'integrator';

export interface DeepDiveProps {
  title?: string;
  persona?: Persona;
  contentDepth?: ContentDepth;
  children: React.ReactNode;
}

const ADVANCED_PERSONAS: Persona[] = ['craftsman', 'architect'];
const HIDE_PERSONAS: Persona[] = ['spark', 'explorer'];

export function DeepDive({ title = 'Deep Dive', persona, contentDepth, children }: DeepDiveProps) {
  const defaultOpen =
    contentDepth === 'enriched' ||
    (persona !== undefined && ADVANCED_PERSONAS.includes(persona));

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(
      contentDepth === 'enriched' ||
      (persona !== undefined && ADVANCED_PERSONAS.includes(persona))
    );
  }, [contentDepth, persona]);

  if (contentDepth === 'simplified' || (persona && HIDE_PERSONAS.includes(persona))) {
    return null;
  }

  return (
    <div className="my-6 rounded-[var(--radius-card)] border border-[var(--color-brand)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[oklch(0.97_0.02_250)] text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-brand)] flex items-center gap-2">
          <span>🔬</span> {title}
        </span>
        <span className="text-[var(--color-brand)] text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 py-4 bg-white border-t border-[oklch(0.90_0.05_250)] text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
