'use client';

import React from 'react';

export interface ConceptCardProps {
  title: string;
  summary: string;
  icon?: React.ReactNode;
  diagram?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning';
}

const variantStyles: Record<string, string> = {
  default: 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)]',
  highlight: 'border-[var(--color-accent)] bg-[oklch(0.97_0.02_160)]',
  warning: 'border-[var(--color-warning)] bg-[oklch(0.98_0.02_60)]',
};

export function ConceptCard({
  title,
  summary,
  icon,
  diagram,
  variant = 'default',
}: ConceptCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border-2 p-6 my-6 ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 text-[var(--color-brand)] text-2xl">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 font-[var(--font-sans)]">
            {title}
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      </div>
      {diagram && <div className="mt-4 border-t pt-4">{diagram}</div>}
    </div>
  );
}
