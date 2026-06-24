import React from 'react';

export interface DangerZoneProps {
  title: string;
  wrong: string;
  right: string;
  explanation: string;
}

export function DangerZone({ title, wrong, right, explanation }: DangerZoneProps) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-danger)] bg-[oklch(0.98_0.01_25)] p-5 my-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-danger)] mb-3">
        Common Mistake — {title}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-400 mb-2 font-bold">Don't do this</p>
          <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap">{wrong}</pre>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 mb-2 font-bold">Do this instead</p>
          <pre className="text-xs font-mono text-green-800 whitespace-pre-wrap">{right}</pre>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-700">{explanation}</p>
    </div>
  );
}
