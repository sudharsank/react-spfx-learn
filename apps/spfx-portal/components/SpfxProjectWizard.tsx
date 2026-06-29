'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAdaptive } from '@repo/adaptive';
import type { SpfxProject } from '../content/projects';
import { AuthGuard } from '@repo/auth';

const CK_KEY = (slug: string) => `spfx_project_checkpoint_${slug}`;

export default function SpfxProjectWizard({ project }: { project: SpfxProject }) {
  const { onLabComplete } = useAdaptive('spfx');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(project.steps[0].code);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(project.slug));
    if (raw) {
      try {
        const ck = JSON.parse(raw) as { step: number; completed: number[] };
        setStep(ck.step);
        setCompleted(ck.completed);
        setCode(project.steps[ck.step].code);
      } catch {
        localStorage.removeItem(CK_KEY(project.slug));
      }
    }
  }, [project]);

  const saveCheckpoint = (nextStep: number, nextCompleted: number[]) => {
    localStorage.setItem(CK_KEY(project.slug), JSON.stringify({ step: nextStep, completed: nextCompleted }));
  };

  const handleMarkDone = () => {
    const nextCompleted = completed.includes(step) ? completed : [...completed, step];
    const nextStep = Math.min(step + 1, project.steps.length - 1);
    setCompleted(nextCompleted);
    saveCheckpoint(nextStep, nextCompleted);
    if (nextCompleted.length === project.steps.length) {
      onLabComplete(project.slug);
    }
    if (step < project.steps.length - 1) {
      setStep(nextStep);
      setCode(project.steps[nextStep].code);
      setShowHint(false);
    }
  };

  const handleStepClick = (i: number) => {
    setStep(i);
    setCode(project.steps[i].code);
    setShowHint(false);
  };

  const currentStep = project.steps[step];
  const allDone = completed.length === project.steps.length;

  return (
    <AuthGuard>
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

      {/* Main: full-width editor (no preview for SPFx) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">{currentStep.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{currentStep.instruction}</p>
              {showHint && (
                <p className="text-sm text-[var(--color-accent)] mt-2 bg-[var(--color-accent)]/10 rounded-lg p-2">
                  💡 {currentStep.hint}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono flex-shrink-0">{currentStep.codeFile}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowHint(h => !h)} className="text-xs text-gray-500 hover:text-gray-700 underline">
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={currentStep.codeFile.endsWith('.json') ? 'json' : 'typescript'}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{ fontSize: 13, minimap: { enabled: true }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
          />
        </div>

        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <p className="text-xs text-gray-400">
            SPFx cannot run in the browser. Test locally with <code className="font-mono">heft start</code>.
          </p>
          {allDone ? (
            <span className="text-sm text-green-600 font-semibold">🎉 Project complete!</span>
          ) : (
            <button
              onClick={handleMarkDone}
              className="px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90"
            >
              {step < project.steps.length - 1 ? 'Mark done & next →' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
