'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAdaptive } from '@repo/adaptive';
import type { Project } from '../content/projects';

const CK_KEY = (slug: string) => `project_checkpoint_${slug}`;

function buildSrcdoc(code: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel">
${code}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
<\/script>
</body></html>`;
}

export default function ProjectWizard({ project }: { project: Project }) {
  const { onLabComplete } = useAdaptive('react');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(project.steps[0].starterCode);
  const [preview, setPreview] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(project.slug));
    if (raw) {
      try {
        const ck = JSON.parse(raw) as { step: number; completed: number[] };
        setStep(ck.step);
        setCompleted(ck.completed);
        setCode(project.steps[ck.step].starterCode);
      } catch {
        localStorage.removeItem(CK_KEY(project.slug));
      }
    }
  }, [project]);

  const saveCheckpoint = (nextStep: number, nextCompleted: number[]) => {
    localStorage.setItem(CK_KEY(project.slug), JSON.stringify({ step: nextStep, completed: nextCompleted }));
  };

  const handleRun = () => setPreview(buildSrcdoc(code));

  const handleNext = () => {
    const nextCompleted = completed.includes(step) ? completed : [...completed, step];
    const nextStep = Math.min(step + 1, project.steps.length - 1);
    setCompleted(nextCompleted);
    setStep(nextStep);
    setCode(project.steps[nextStep].starterCode);
    setPreview('');
    setShowHint(false);
    saveCheckpoint(nextStep, nextCompleted);
    if (nextCompleted.length === project.steps.length) {
      onLabComplete(project.slug);
    }
  };

  const handleStepClick = (i: number) => {
    setStep(i);
    setCode(project.steps[i].starterCode);
    setPreview('');
    setShowHint(false);
  };

  const currentStep = project.steps[step];
  const allDone = completed.length === project.steps.length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-sm">{project.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{completed.length}/{project.steps.length} steps done</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {project.steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => handleStepClick(i)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${
                  i === step ? 'bg-[var(--color-brand)] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                  completed.includes(i) ? 'bg-green-500 border-green-500 text-white' : 'border-current'
                }`}>
                  {completed.includes(i) ? '✓' : i + 1}
                </span>
                <span className="truncate">{s.title.replace(/^Step \d+ — /, '')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="flex flex-col w-1/2 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-800 text-sm">{currentStep.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{currentStep.instruction}</p>
            {showHint && (
              <p className="text-sm text-[var(--color-accent)] mt-2 bg-[var(--color-accent)]/10 rounded-lg p-2">
                💡 {currentStep.hint}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowHint(h => !h)} className="text-xs text-gray-500 hover:text-gray-700 underline">
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
            />
          </div>
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 justify-between">
            <button onClick={handleRun} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90">
              ▶ Run
            </button>
            {allDone ? (
              <span className="text-sm text-green-600 font-semibold self-center">🎉 Project complete!</span>
            ) : (
              <button onClick={handleNext} className="px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90">
                {step < project.steps.length - 1 ? 'Next step →' : 'Finish'}
              </button>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="w-1/2 bg-white">
          {preview ? (
            <iframe sandbox="allow-scripts" srcDoc={preview} className="w-full h-full border-none" title="Preview" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Press <kbd className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">▶ Run</kbd> to see your output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
