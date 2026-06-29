'use client';
// apps/react-portal/components/ChallengeMode.tsx

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { consumeHintToken, getHintTokens, useAdaptive } from '@repo/adaptive';
import type { LabDefinition } from '../content/labs';
import { AuthGuard } from '@repo/auth';

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

export function ChallengeMode({ lab }: { lab: LabDefinition }) {
  const [code, setCode] = useState(lab.starterCode);
  const [preview, setPreview] = useState(PREVIEW_WRAP(lab.starterCode));
  const [tokenBalance, setTokenBalance] = useState(getHintTokens);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { onLabComplete } = useAdaptive('react');

  const runCode = useCallback(() => setPreview(PREVIEW_WRAP(code)), [code]);

  function revealHint() {
    if (tokenBalance <= 0) return;
    const next = consumeHintToken();
    setTokenBalance(next);
    setShowHint(true);
  }

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-56px)]">
      {/* Goal panel */}
      <aside className="w-72 flex-shrink-0 border-r border-gray-200 p-5 overflow-y-auto">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">⚡ Challenge</span>
        <h2 className="font-bold text-gray-800 text-lg mt-2 mb-3">{lab.title}</h2>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed mb-4">
          <p className="font-semibold text-purple-700 mb-2">Your Goal:</p>
          <p>{lab.goal}</p>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">💡 Hint tokens: <strong>{tokenBalance}</strong></span>
        </div>
        {tokenBalance > 0 && !showHint && (
          <button
            onClick={revealHint}
            className="w-full text-sm px-4 py-2 rounded-lg border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[oklch(0.97_0.02_60)] transition-colors"
          >
            Reveal Hint (costs 1 token)
          </button>
        )}
        {showHint && (
          <div className="bg-[oklch(0.97_0.02_60)] border border-[var(--color-warning)] rounded-lg p-3 text-sm text-gray-700">
            <p className="font-medium text-[var(--color-warning)] mb-1">💡 Hint</p>
            <p>Use <code className="bg-white px-1 rounded">React.useState</code> for the timer value and a boolean for running state. In <code className="bg-white px-1 rounded">useEffect</code>, start a <code className="bg-white px-1 rounded">setInterval</code> when running is true — remember to return a cleanup function that calls <code className="bg-white px-1 rounded">clearInterval</code>.</p>
          </div>
        )}
        <button
          onClick={() => { onLabComplete(lab.slug); setSubmitted(true); }}
          disabled={submitted}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitted ? '✓ Submitted' : 'Submit Solution'}
        </button>
      </aside>

      {/* Editor */}
      <div className="flex flex-col flex-1 border-r border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
          <span className="text-xs text-gray-400 font-mono">solution.jsx</span>
          <button onClick={runCode} className="text-xs px-3 py-1 bg-[var(--color-accent)] text-white rounded-full hover:opacity-90">
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
    </AuthGuard>
  );
}
