import React from 'react';

export interface AnalogyBridgeProps {
  concept: string;
  analogy: string;
  realWorld: string;
}

export function AnalogyBridge({ concept, analogy, realWorld }: AnalogyBridgeProps) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-accent)] bg-[oklch(0.97_0.02_160)] p-5 my-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
        Think of it this way
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1 font-medium">In code</p>
          <p className="font-semibold text-gray-800">{concept}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1 font-medium">In real life</p>
          <p className="font-semibold text-gray-800">{realWorld}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 italic">{analogy}</p>
    </div>
  );
}
