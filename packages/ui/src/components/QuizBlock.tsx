'use client';

import React, { useState } from 'react';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
}

export interface QuizBlockProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export function QuizBlock({ questions, onComplete }: QuizBlockProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];

  function handleSelect(id: string) {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
    if (id === q.correctId) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true);
      onComplete?.(score + (selected === q.correctId ? 1 : 0), questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  if (done) {
    const finalScore = score;
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-accent)] bg-[oklch(0.97_0.02_160)] p-6 my-6 text-center">
        <p className="text-2xl font-bold text-[var(--color-accent)]">
          {finalScore}/{questions.length}
        </p>
        <p className="text-gray-600 mt-2">
          {finalScore === questions.length
            ? 'Perfect! Concept mastered.'
            : finalScore >= questions.length / 2
            ? 'Good work! Review any missed questions.'
            : 'Keep going — try re-reading the lesson.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border-2 border-gray-200 p-6 my-6">
      <p className="text-xs text-gray-500 mb-3">
        Question {current + 1} of {questions.length}
      </p>
      <p className="font-semibold text-gray-800 mb-4">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt) => {
          let cls = 'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ';
          if (!revealed) {
            cls += 'border-gray-200 hover:border-[var(--color-brand)] hover:bg-[oklch(0.97_0.02_250)]';
          } else if (opt.id === q.correctId) {
            cls += 'border-green-500 bg-green-50 text-green-800 font-medium';
          } else if (opt.id === selected) {
            cls += 'border-red-400 bg-red-50 text-red-700';
          } else {
            cls += 'border-gray-200 opacity-50';
          }
          return (
            <button key={opt.id} className={cls} onClick={() => handleSelect(opt.id)}>
              {opt.text}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-4 border-[var(--color-brand)]">
          {q.explanation}
        </div>
      )}
      {revealed && (
        <button
          onClick={handleNext}
          className="mt-4 px-6 py-2 bg-[var(--color-brand)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
