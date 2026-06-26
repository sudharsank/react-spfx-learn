'use client';
import dynamic from 'next/dynamic';

export const ClientConceptMap = dynamic(
  () => import('@repo/ui').then((m) => ({ default: m.ConceptMap })),
  { ssr: false }
);
