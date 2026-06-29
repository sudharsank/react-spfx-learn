// apps/spfx-portal/components/SpfxLab.tsx
'use client';

import { useState } from 'react';
import { consumeHintToken, getHintTokens, useAdaptive } from '@repo/adaptive';
import type { SpfxLabDefinition } from '../content/labs';
import { AuthGuard } from '@repo/auth';

export function SpfxLab({ lab }: { lab: SpfxLabDefinition }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tokenBalance, setTokenBalance] = useState(getHintTokens);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const { onLabComplete } = useAdaptive('spfx');
  const steps = lab.steps ?? [];

  const markDone = (i: number) => {
    const next = completedSteps.includes(i) ? completedSteps : [...completedSteps, i];
    setCompletedSteps(next);
    if (next.length === steps.length) onLabComplete(lab.slug);
    if (i + 1 < steps.length) setCurrentStep(i + 1);
  };

  const revealHint = (i: number) => {
    if (tokenBalance <= 0 || revealedHints.includes(i)) return;
    setTokenBalance(consumeHintToken());
    setRevealedHints((prev) => [...prev, i]);
  };

  return (
    <AuthGuard>
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
          {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
        </span>
        <span className="text-xs text-gray-400">{lab.duration}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{lab.title}</h1>
      <p className="text-gray-500 mb-2">{lab.description}</p>
      <p className="text-xs text-gray-400 mb-8">💡 Hint tokens: <strong>{tokenBalance}</strong></p>

      {lab.type === 'challenge' && lab.goal && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-8">
          <p className="font-bold text-purple-700 mb-2">Your Goal:</p>
          <p className="text-gray-700 text-sm leading-relaxed">{lab.goal}</p>
        </div>
      )}

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={i} className={`rounded-xl border p-5 ${i === currentStep ? 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)]' : completedSteps.includes(i) ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${completedSteps.includes(i) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {completedSteps.includes(i) ? '✓' : i + 1}
              </span>
              <h3 className="font-semibold text-gray-800">{step.title}</h3>
            </div>
            {i === currentStep && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.instruction}</p>
                {step.code && (
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto mb-3">
                    <code>{step.code}</code>
                  </pre>
                )}
                {step.hint && !revealedHints.includes(i) && (
                  <button
                    onClick={() => revealHint(i)}
                    disabled={tokenBalance <= 0}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[oklch(0.97_0.02_60)] disabled:opacity-40 mb-3"
                  >
                    💡 Reveal hint ({tokenBalance} tokens left)
                  </button>
                )}
                {step.hint && revealedHints.includes(i) && (
                  <div className="bg-[oklch(0.97_0.02_60)] border border-[var(--color-warning)] rounded-lg p-3 text-sm text-gray-700 mb-3">
                    💡 {step.hint}
                  </div>
                )}
                <button
                  onClick={() => markDone(i)}
                  className="text-xs px-4 py-1.5 rounded-full bg-[var(--color-accent)] text-white hover:opacity-90"
                >
                  Done →
                </button>
              </>
            )}
          </li>
        ))}
        {completedSteps.length === steps.length && steps.length > 0 && (
          <div className="rounded-xl p-5 bg-green-50 border border-green-200 text-green-700 font-medium text-center text-lg">
            🎉 Lab Complete!
          </div>
        )}
      </ol>
    </main>
    </AuthGuard>
  );
}
