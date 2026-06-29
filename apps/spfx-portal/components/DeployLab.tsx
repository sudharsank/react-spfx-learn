'use client';

import { useState, useEffect } from 'react';
import { useAdaptive } from '@repo/adaptive';
import type { DeployLab as IDeployLab } from '../content/deployLabs';
import { AuthGuard } from '@repo/auth';

const CK_KEY = (slug: string) => `deploy_lab_${slug}`;

export default function DeployLab({ lab }: { lab: IDeployLab }) {
  const { onLabComplete } = useAdaptive('spfx');
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(lab.slug));
    if (raw) {
      try {
        setChecked(JSON.parse(raw));
      } catch {
        localStorage.removeItem(CK_KEY(lab.slug));
      }
    }
  }, [lab.slug]);

  const toggle = (i: number) => {
    const next = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    setChecked(next);
    localStorage.setItem(CK_KEY(lab.slug), JSON.stringify(next));
    if (next.length === lab.steps.length) {
      onLabComplete(lab.slug);
    }
  };

  const reset = () => {
    setChecked([]);
    localStorage.removeItem(CK_KEY(lab.slug));
  };

  const allDone = checked.length === lab.steps.length;

  return (
    <AuthGuard>
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{lab.title}</h1>
          <p className="text-gray-500 mt-1">{lab.description}</p>
        </div>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline mt-1">
          Reset
        </button>
      </div>

      {allDone && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 font-semibold text-sm">
          🎉 All steps complete! Your web part is deployed.
        </div>
      )}

      <div className="space-y-4">
        {lab.steps.map((step, i) => {
          const done = checked.includes(i);
          return (
            <div
              key={i}
              className={`rounded-xl border-2 p-5 transition-colors ${
                done ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(i)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-[var(--color-brand)]'
                  }`}
                >
                  {done && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm mb-1 ${done ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    Step {i + 1}: {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.command && (
                    <pre className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {step.command}
                    </pre>
                  )}
                  {step.adminNote && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                      ⚠️ {step.adminNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        {checked.length}/{lab.steps.length} steps completed — progress saved automatically
      </div>
    </main>
    </AuthGuard>
  );
}
