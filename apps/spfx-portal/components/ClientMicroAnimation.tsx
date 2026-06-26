'use client';
import dynamic from 'next/dynamic';

export const ClientMicroAnimation = dynamic(
  () => import('@repo/phaser').then((m) => ({ default: m.MicroAnimation })),
  { ssr: false }
);
