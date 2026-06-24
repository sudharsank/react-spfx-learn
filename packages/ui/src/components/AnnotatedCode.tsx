'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export interface CodeAnnotation {
  line: number;
  label: string;
  explanation: string;
}

export interface AnnotatedCodeProps {
  code: string;
  language?: string;
  annotations?: CodeAnnotation[];
  title?: string;
}

export function AnnotatedCode({
  code,
  language = 'typescript',
  annotations = [],
  title,
}: AnnotatedCodeProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <div className="rounded-[var(--radius-card)] border border-gray-200 overflow-hidden my-6">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-[var(--font-mono)] flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2">{title}</span>
        </div>
      )}
      <Editor
        height="300px"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
        }}
      />
      {annotations.length > 0 && (
        <div className="bg-gray-50 border-t">
          <div className="flex gap-2 p-3 flex-wrap">
            {annotations.map((a, i) => (
              <button
                key={i}
                onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeAnnotation === i
                    ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[var(--color-brand)]'
                }`}
              >
                Line {a.line}: {a.label}
              </button>
            ))}
          </div>
          {activeAnnotation !== null && (
            <div className="px-4 pb-4">
              <div className="bg-white rounded-lg border border-[var(--color-brand-light)] p-4 text-sm text-gray-700">
                <span className="font-semibold text-[var(--color-brand)]">
                  Why? —{' '}
                </span>
                {annotations[activeAnnotation].explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
