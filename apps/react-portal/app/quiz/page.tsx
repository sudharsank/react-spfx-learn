'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  REACT_QUIZ,
  scoreQuiz,
  pickPersona,
} from '@repo/adaptive';
import { setGuestProgress, AuthGuard, useProfile, type Persona } from '@repo/auth';

function QuizContent() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const { setPersona } = useProfile('react');

  const q = REACT_QUIZ[step];
  const isLast = step === REACT_QUIZ.length - 1;

  function handleSelect(optId: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }

  async function handleNext() {
    if (!answers[q.id]) return;
    if (isLast) {
      const scores = scoreQuiz(answers, REACT_QUIZ);
      const persona = pickPersona(scores);
      setGuestProgress({ persona });
      await setPersona(persona as Persona);
      router.push(`/learn?persona=${persona}`);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="flex gap-1 mb-8">
          {REACT_QUIZ.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[var(--color-brand)]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">{q.text}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all ${
                answers[q.id] === opt.id
                  ? 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)] font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={!answers[q.id]}
          className="mt-6 w-full py-3 bg-[var(--color-brand)] text-white rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLast ? 'See My Learning Path →' : 'Next →'}
        </button>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}
