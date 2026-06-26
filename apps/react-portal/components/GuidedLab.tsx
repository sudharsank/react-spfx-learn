'use client';
// apps/react-portal/components/GuidedLab.tsx

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { HintCard } from '@repo/ui';
import { consumeHintToken, getHintTokens, useAdaptive } from '@repo/adaptive';
import type { LabDefinition } from '../content/labs';

const PREVIEW_WRAP = (code: string) => `<!DOCTYPE html>
<html><head>
<script crossorigin src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>body{margin:12px;font-family:system-ui,sans-serif;font-size:14px}button{cursor:pointer;padding:8px 16px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc}button:hover{background:#e2e8f0}</style>
</head><body>
<div id="root"></div>
<script type="text/babel">${code}
const rootEl=document.getElementById('root');
if(typeof App!=='undefined')ReactDOM.createRoot(rootEl).render(React.createElement(App));
<\/script></body></html>`;

export function GuidedLab({ lab }: { lab: LabDefinition }) {
  const [code, setCode] = useState(lab.starterCode);
  const [preview, setPreview] = useState(PREVIEW_WRAP(lab.starterCode));
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tokenBalance, setTokenBalance] = useState(getHintTokens);
  const { onLabComplete } = useAdaptive('react');
  const steps = lab.steps ?? [];

  const runCode = useCallback(() => {
    setPreview(PREVIEW_WRAP(code));
  }, [code]);

  const markStepDone = (i: number) => {
    const next = completedSteps.includes(i) ? completedSteps : [...completedSteps, i];
    setCompletedSteps(next);
    if (next.length === steps.length) {
      onLabComplete(lab.slug);
    }
    if (i + 1 < steps.length) setCurrentStep(i + 1);
  };

  const handleRevealHint = () => {
    const next = consumeHintToken();
    setTokenBalance(next);
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Step panel */}
      <aside className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto p-4">
        <h2 className="font-bold text-gray-800 mb-4">{lab.title}</h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className={`rounded-lg p-3 text-sm border ${i === currentStep ? 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)]' : 'border-gray-100'}`}>
              <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${completedSteps.includes(i) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {completedSteps.includes(i) ? '✓' : i + 1}
                </span>
                {step.title}
              </p>
              {i === currentStep && (
                <>
                  <p className="text-gray-600 leading-relaxed mb-3">{step.instruction}</p>
                  {step.hint && (
                    <HintCard hint={step.hint} onReveal={handleRevealHint} tokenBalance={tokenBalance} />
                  )}
                  <button
                    onClick={() => markStepDone(i)}
                    className="mt-2 text-xs px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-white hover:opacity-90"
                  >
                    Step Complete →
                  </button>
                </>
              )}
            </li>
          ))}
          {completedSteps.length === steps.length && steps.length > 0 && (
            <div className="rounded-lg p-3 bg-green-50 border border-green-200 text-sm text-green-700 font-medium text-center">
              🎉 Lab Complete!
            </div>
          )}
        </ol>
      </aside>

      {/* Editor */}
      <div className="flex flex-col flex-1 border-r border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
          <span className="text-xs text-gray-400 font-mono">App.jsx</span>
          <button
            onClick={runCode}
            className="text-xs px-3 py-1 bg-[var(--color-accent)] text-white rounded-full hover:opacity-90"
          >
            ▶ Run
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
      </div>

      {/* Preview */}
      <div className="flex flex-col flex-1">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Preview</span>
        </div>
        <iframe srcDoc={preview} title="preview" sandbox="allow-scripts" className="flex-1 w-full border-0 bg-white" />
      </div>
    </div>
  );
}
