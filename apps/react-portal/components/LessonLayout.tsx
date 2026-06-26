'use client';

import type { ModuleDefinition, LessonDefinition } from '@repo/content';
import { Sidebar } from './Sidebar';
import { MODULES } from '../content/modules';
import Link from 'next/link';
import { useAdaptive } from '@repo/adaptive';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const BadgeMoment = dynamic(() => import('@repo/phaser').then((m) => ({ default: m.BadgeMoment })), { ssr: false });

interface LessonLayoutProps {
  module: ModuleDefinition;
  lesson: LessonDefinition;
  children: React.ReactNode;
}

export function LessonLayout({ module: mod, lesson, children }: LessonLayoutProps) {
  const currentIdx = mod.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = mod.lessons[currentIdx - 1];
  const next = mod.lessons[currentIdx + 1];
  const { pendingBadge, dismissBadge, onLessonComplete } = useAdaptive('react');
  const [lessonMarked, setLessonMarked] = useState(false);

  function handleMarkComplete() {
    if (!lessonMarked) {
      onLessonComplete(`${mod.slug}/${lesson.slug}`);
      setLessonMarked(true);
    }
  }

  return (
    <div className="flex min-h-screen">
      {pendingBadge && <BadgeMoment badge={pendingBadge.emoji} onDone={dismissBadge} />}
      <Sidebar modules={MODULES} />
      <main className="flex-1 max-w-3xl mx-auto px-8 py-10">
        <p className="text-xs text-[var(--color-brand)] font-bold uppercase tracking-widest mb-2">
          {mod.title}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{lesson.duration} read</p>
        <div className="prose prose-gray max-w-none">{children}</div>
        <div className="mt-8">
          <button
            onClick={handleMarkComplete}
            disabled={lessonMarked}
            className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-default"
          >
            {lessonMarked ? '✓ Lesson Complete' : 'Mark as Complete'}
          </button>
        </div>
        <div className="mt-8 pt-8 border-t flex justify-between">
          {prev ? (
            <Link href={`/learn/${mod.slug}/${prev.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              ← {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/learn/${mod.slug}/${next.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              {next.title} →
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
