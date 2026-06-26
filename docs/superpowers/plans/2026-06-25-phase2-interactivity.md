# Phase 2 — Interactivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phaser 3 micro-animations, guided labs with Monaco + live preview, challenge mode with hint tokens, badge system, full adaptive scoring pipeline, and new content block components (ConceptMap, DeepDive, VideoEmbed, TryItInline) to both React and SPFx learning portals.

**Architecture:** New shared packages: `@repo/phaser` (Phaser 3 scene classes + MicroAnimation/BadgeMoment React wrappers). New `packages/ui` components: DeepDive, VideoEmbed, TryItInline, ConceptMap, HintCard. `packages/adaptive` gains hint token system, badge system, and `useAdaptive` hook. Both portals gain `/labs/[lab]` route for guided and challenge mode labs. LessonLayout is updated to wire QuizBlock → adaptive score → DeepDive depth. Both portal Headers show hint token balance.

**Tech Stack:**
- `phaser@3.90.0` — Phaser 3, useRef+useEffect mount, dynamic import to avoid SSR
- `@xyflow/react@^12` — React Flow v12, named import `{ ReactFlow }`
- `@monaco-editor/react@^4.4.0` — already in packages/ui
- `motion@latest` — already in packages/ui
- All existing: Next.js 15.1.x, Tailwind v4, pnpm workspaces, Turborepo 2.x

## Global Constraints

- Turborepo 2.x: `turbo.json` uses `tasks` key (NOT `pipeline`)
- pnpm 9.x: internal packages use `"workspace:*"` protocol
- Next.js 15.1.x: `output: 'export'`; `params`/`searchParams` are Promises (must `await`); no `next/headers`; no server actions
- Tailwind v4: CSS-first `@theme {}` in globals.css; no tailwind.config.js; postcss plugin is `@tailwindcss/postcss`
- `motion` NOT `framer-motion`; import from `motion/react` in client components
- `@xyflow/react` NOT `reactflow`; named import `{ ReactFlow }` v12
- `phaser`: dynamic import `await import('phaser')` inside `useEffect` only (browser-only)
- `'use client'` required on all components using hooks, Phaser, Monaco, or motion
- basePath: react-portal = `/react-spfx-learn/react`, spfx-portal = `/react-spfx-learn/spfx`
- New package consumers: add `"@repo/phaser": "workspace:*"` to app's `package.json`
- Auto-commit AND `git push origin main` after EVERY task completion
- Monorepo root: `/Users/sudharsank/Projects/react-spfx-learn`

---

### Task 1: packages/phaser — scaffold + Phaser 3 scene classes

**Files:**
- Create: `packages/phaser/package.json`
- Create: `packages/phaser/tsconfig.json`
- Create: `packages/phaser/src/scenes/RenderCycleScene.ts`
- Create: `packages/phaser/src/scenes/ComponentTreeScene.ts`
- Create: `packages/phaser/src/scenes/SpfxRequestFlowScene.ts`
- Create: `packages/phaser/src/scenes/BadgeMomentScene.ts`
- Create: `packages/phaser/src/index.ts`

**Interfaces:**
- Produces: `RenderCycleScene`, `ComponentTreeScene`, `SpfxRequestFlowScene`, `BadgeMomentScene` — all extend `Phaser.Scene`

- [ ] **Step 1: Create packages/phaser/package.json**

```json
{
  "name": "@repo/phaser",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "3.90.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "react": "^19.0.0",
    "typescript": "^5.8.0"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

- [ ] **Step 2: Create packages/phaser/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Install phaser in the workspace**

Run from monorepo root:
```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm install
```

Expected: pnpm resolves phaser@3.90.0 into packages/phaser/node_modules.

- [ ] **Step 4: Create RenderCycleScene.ts**

```ts
// packages/phaser/src/scenes/RenderCycleScene.ts
import Phaser from 'phaser';

const STEPS = ['State Change', 'Render()', 'Diff (VDOM)', 'Commit', 'DOM Updated'];
const COLORS = [0x6366f1, 0x8b5cf6, 0x06b6d4, 0x10b981, 0xf59e0b];

export class RenderCycleScene extends Phaser.Scene {
  private nodeTexts: Phaser.GameObjects.Text[] = [];
  private arrows: Phaser.GameObjects.Graphics[] = [];
  private step = 0;
  private timer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'RenderCycleScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const gap = W / (STEPS.length + 1);

    STEPS.forEach((label, i) => {
      const x = gap * (i + 1);
      const y = H / 2;

      const circle = this.add.graphics();
      circle.fillStyle(0xf1f5f9, 1);
      circle.lineStyle(2, COLORS[i], 1);
      circle.fillCircle(x, y, 36);
      circle.strokeCircle(x, y, 36);

      const text = this.add
        .text(x, y, label, {
          fontSize: '10px',
          color: '#1e293b',
          align: 'center',
          wordWrap: { width: 60 },
        })
        .setOrigin(0.5);
      this.nodeTexts.push(text);

      if (i < STEPS.length - 1) {
        const arrow = this.add.graphics();
        arrow.lineStyle(2, 0x94a3b8, 0.4);
        arrow.beginPath();
        arrow.moveTo(x + 38, y);
        arrow.lineTo(x + gap - 38, y);
        arrow.strokePath();
        this.arrows.push(arrow);
      }
    });

    this.timer = this.time.addEvent({
      delay: 700,
      callback: this.activateStep,
      callbackScope: this,
      loop: true,
    });
  }

  private activateStep() {
    this.nodeTexts.forEach((t, i) => {
      const active = i === this.step;
      t.setStyle({ color: active ? '#ffffff' : '#1e293b' });
      const bg = this.children.getAt(i * 2) as Phaser.GameObjects.Graphics;
      if (bg) {
        bg.clear();
        bg.fillStyle(active ? COLORS[i] : 0xf1f5f9, 1);
        bg.lineStyle(2, COLORS[i], 1);
        bg.fillCircle(0, 0, 36);
        bg.strokeCircle(0, 0, 36);
      }
    });
    if (this.arrows[this.step - 1]) {
      this.arrows[this.step - 1].setAlpha(1);
    }
    this.step = (this.step + 1) % STEPS.length;
    if (this.step === 0) {
      this.time.delayedCall(400, () => {
        this.arrows.forEach((a) => a.setAlpha(0.4));
        this.nodeTexts.forEach((t) => t.setStyle({ color: '#1e293b' }));
      });
    }
  }

  shutdown() {
    this.timer?.destroy();
  }
}
```

- [ ] **Step 5: Create ComponentTreeScene.ts**

```ts
// packages/phaser/src/scenes/ComponentTreeScene.ts
import Phaser from 'phaser';

interface Node { label: string; x: number; y: number; changed?: boolean }

const NODES: Node[] = [
  { label: 'App', x: 200, y: 40 },
  { label: 'Header', x: 80, y: 110 },
  { label: 'Main', x: 200, y: 110, changed: true },
  { label: 'Footer', x: 320, y: 110 },
  { label: 'List', x: 140, y: 185, changed: true },
  { label: 'Button', x: 260, y: 185 },
];

const EDGES: [number, number][] = [[0,1],[0,2],[0,3],[2,4],[2,5]];

export class ComponentTreeScene extends Phaser.Scene {
  constructor() { super({ key: 'ComponentTreeScene' }); }

  create() {
    const gfx = this.add.graphics();

    EDGES.forEach(([a, b]) => {
      const na = NODES[a]; const nb = NODES[b];
      gfx.lineStyle(1.5, 0x94a3b8, 1);
      gfx.beginPath();
      gfx.moveTo(na.x, na.y + 20);
      gfx.lineTo(nb.x, nb.y - 20);
      gfx.strokePath();
    });

    NODES.forEach((n) => {
      const base = n.changed ? 0xfef9c3 : 0xf1f5f9;
      const border = n.changed ? 0xf59e0b : 0x6366f1;
      const box = this.add.graphics();
      box.fillStyle(base, 1);
      box.lineStyle(2, border, 1);
      box.fillRoundedRect(n.x - 38, n.y - 18, 76, 36, 8);
      box.strokeRoundedRect(n.x - 38, n.y - 18, 76, 36, 8);

      this.add.text(n.x, n.y, n.label, { fontSize: '11px', color: '#1e293b' }).setOrigin(0.5);

      if (n.changed) {
        this.tweens.add({ targets: box, alpha: 0.4, yoyo: true, duration: 600, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });

    this.add.text(200, 230, '⬛ = re-rendering', { fontSize: '9px', color: '#f59e0b' }).setOrigin(0.5);
  }
}
```

- [ ] **Step 6: Create SpfxRequestFlowScene.ts**

```ts
// packages/phaser/src/scenes/SpfxRequestFlowScene.ts
import Phaser from 'phaser';

const NODES = ['Browser', 'SPFx WP', 'Graph API', 'Azure AD', 'SharePoint'];
const COLORS = [0x6366f1, 0x8b5cf6, 0x06b6d4, 0x0ea5e9, 0x10b981];

export class SpfxRequestFlowScene extends Phaser.Scene {
  private step = 0;
  private dots: Phaser.GameObjects.Arc[] = [];

  constructor() { super({ key: 'SpfxRequestFlowScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const gap = W / (NODES.length + 1);

    NODES.forEach((label, i) => {
      const x = gap * (i + 1);
      const y = H * 0.4;

      const box = this.add.graphics();
      box.fillStyle(COLORS[i], 0.12);
      box.lineStyle(2, COLORS[i], 1);
      box.fillRoundedRect(x - 42, y - 22, 84, 44, 10);
      box.strokeRoundedRect(x - 42, y - 22, 84, 44, 10);

      this.add.text(x, y, label, { fontSize: '9px', color: '#1e293b', align: 'center', wordWrap: { width: 70 } }).setOrigin(0.5);

      if (i < NODES.length - 1) {
        const gfx = this.add.graphics();
        gfx.lineStyle(1.5, 0xc7d2fe, 1);
        gfx.beginPath();
        gfx.moveTo(x + 44, y);
        gfx.lineTo(x + gap - 44, y);
        gfx.strokePath();

        const dot = this.add.arc(x + 44, y, 5, 0, 360, false, COLORS[i], 1);
        dot.setAlpha(0);
        this.dots.push(dot);
      }
    });

    this.time.addEvent({ delay: 800, callback: this.animateDot, callbackScope: this, loop: true });
  }

  private animateDot() {
    if (this.step >= this.dots.length) { this.step = 0; return; }
    const dot = this.dots[this.step];
    const W = this.scale.width;
    const gap = W / (NODES.length + 1);
    const startX = gap * (this.step + 1) + 44;
    const endX = startX + gap - 88;
    dot.setAlpha(1).setX(startX);
    this.tweens.add({ targets: dot, x: endX, duration: 700, ease: 'Linear', onComplete: () => dot.setAlpha(0) });
    this.step++;
  }
}
```

- [ ] **Step 7: Create BadgeMomentScene.ts**

```ts
// packages/phaser/src/scenes/BadgeMomentScene.ts
import Phaser from 'phaser';

export class BadgeMomentScene extends Phaser.Scene {
  private badgeText?: string;

  constructor() { super({ key: 'BadgeMomentScene' }); }

  init(data: { badge: string }) {
    this.badgeText = data.badge ?? '🏅';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Create particle texture
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(0, 0, 6, 6);
    g.generateTexture('particle', 6, 6);
    g.destroy();

    // Particles from centre
    const emitter = this.add.particles(W / 2, H / 2, 'particle', {
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 900,
      quantity: 40,
      tint: [0xfbbf24, 0x6366f1, 0x10b981, 0xf472b6],
    });
    this.time.delayedCall(400, () => emitter.stop());

    // Badge
    const badge = this.add
      .text(W / 2, H / 2, this.badgeText ?? '🏅', { fontSize: '56px' })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.2);
    this.tweens.add({ targets: badge, alpha: 1, scale: 1, duration: 500, ease: 'Back.easeOut' });
  }
}
```

- [ ] **Step 8: Create packages/phaser/src/index.ts**

```ts
export { RenderCycleScene } from './scenes/RenderCycleScene';
export { ComponentTreeScene } from './scenes/ComponentTreeScene';
export { SpfxRequestFlowScene } from './scenes/SpfxRequestFlowScene';
export { BadgeMomentScene } from './scenes/BadgeMomentScene';
```

- [ ] **Step 9: Verify TypeScript compiles**

Run from monorepo root:
```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/phaser type-check
```
Expected: exits 0 (or at most Phaser type resolution warnings — not errors).

- [ ] **Step 10: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/phaser && git commit -m "feat: add packages/phaser with Phaser 3 scene classes" && git push origin main
```

---

### Task 2: MicroAnimation + BadgeMoment React wrappers (packages/phaser)

**Files:**
- Create: `packages/phaser/src/MicroAnimation.tsx`
- Create: `packages/phaser/src/BadgeMoment.tsx`
- Modify: `packages/phaser/src/index.ts`

**Interfaces:**
- Consumes: `RenderCycleScene`, `ComponentTreeScene`, `SpfxRequestFlowScene`, `BadgeMomentScene` from Task 1
- Produces:
  - `MicroAnimation({ scene: 'render-cycle' | 'component-tree' | 'spfx-request-flow', width?: number, height?: number })`
  - `BadgeMoment({ badge: string, onDone: () => void })`

- [ ] **Step 1: Create MicroAnimation.tsx**

```tsx
// packages/phaser/src/MicroAnimation.tsx
'use client';

import { useEffect, useRef } from 'react';

type SceneKey = 'render-cycle' | 'component-tree' | 'spfx-request-flow';

interface MicroAnimationProps {
  scene: SceneKey;
  width?: number;
  height?: number;
}

export function MicroAnimation({ scene, width = 420, height = 260 }: MicroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;
    (async () => {
      const Phaser = (await import('phaser')).default;
      const { RenderCycleScene } = await import('./scenes/RenderCycleScene');
      const { ComponentTreeScene } = await import('./scenes/ComponentTreeScene');
      const { SpfxRequestFlowScene } = await import('./scenes/SpfxRequestFlowScene');

      if (destroyed || !containerRef.current) return;

      const sceneMap: Record<SceneKey, Phaser.Scene> = {
        'render-cycle': new RenderCycleScene(),
        'component-tree': new ComponentTreeScene(),
        'spfx-request-flow': new SpfxRequestFlowScene(),
      };

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width,
        height,
        backgroundColor: '#f8fafc',
        parent: containerRef.current,
        scene: sceneMap[scene],
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      });
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [scene, width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="rounded-xl overflow-hidden border border-gray-100 my-6"
    />
  );
}
```

- [ ] **Step 2: Create BadgeMoment.tsx**

```tsx
// packages/phaser/src/BadgeMoment.tsx
'use client';

import { useEffect, useRef } from 'react';

interface BadgeMomentProps {
  badge: string;
  onDone: () => void;
}

export function BadgeMoment({ badge, onDone }: BadgeMomentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    (async () => {
      const Phaser = (await import('phaser')).default;
      const { BadgeMomentScene } = await import('./scenes/BadgeMomentScene');
      if (destroyed || !containerRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 280,
        height: 200,
        backgroundColor: '#ffffff',
        transparent: true,
        parent: containerRef.current,
        scene: {
          key: 'BadgeMomentScene',
          ...BadgeMomentScene.prototype,
          init(data: any) { BadgeMomentScene.prototype.init.call(this, { badge }); },
        } as any,
      });
      // Auto-close after 2 s
      setTimeout(() => { if (!destroyed) onDone(); }, 2000);
    })();
    return () => { destroyed = true; gameRef.current?.destroy(true); gameRef.current = null; };
  }, [badge, onDone]);

  return <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onDone}><div style={{ width: 280, height: 200 }} /></div>;
}
```

- [ ] **Step 3: Update packages/phaser/src/index.ts**

```ts
export { RenderCycleScene } from './scenes/RenderCycleScene';
export { ComponentTreeScene } from './scenes/ComponentTreeScene';
export { SpfxRequestFlowScene } from './scenes/SpfxRequestFlowScene';
export { BadgeMomentScene } from './scenes/BadgeMomentScene';
export { MicroAnimation } from './MicroAnimation';
export { BadgeMoment } from './BadgeMoment';
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/phaser type-check
```
Expected: exits 0.

- [ ] **Step 5: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/phaser && git commit -m "feat: add MicroAnimation and BadgeMoment React wrappers" && git push origin main
```

---

### Task 3: DeepDive component (packages/ui)

**Files:**
- Create: `packages/ui/src/components/DeepDive.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `DeepDive({ title: string, persona?: Persona, contentDepth?: 'simplified' | 'standard' | 'enriched', children: ReactNode })`
  - Auto-opens when `contentDepth === 'enriched'` or `persona` is `'craftsman' | 'architect'`
  - Collapsed by default for `'spark' | 'explorer'`

- [ ] **Step 1: Create DeepDive.tsx**

```tsx
// packages/ui/src/components/DeepDive.tsx
'use client';

import { useState, useEffect } from 'react';

type ContentDepth = 'simplified' | 'standard' | 'enriched';
type Persona = 'spark' | 'builder' | 'craftsman' | 'consultant' | 'explorer' | 'maker' | 'architect' | 'integrator';

export interface DeepDiveProps {
  title?: string;
  persona?: Persona;
  contentDepth?: ContentDepth;
  children: React.ReactNode;
}

const ADVANCED_PERSONAS: Persona[] = ['craftsman', 'architect'];
const HIDE_PERSONAS: Persona[] = ['spark', 'explorer'];

export function DeepDive({ title = 'Deep Dive', persona, contentDepth, children }: DeepDiveProps) {
  const defaultOpen =
    contentDepth === 'enriched' ||
    (persona !== undefined && ADVANCED_PERSONAS.includes(persona));

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(
      contentDepth === 'enriched' ||
      (persona !== undefined && ADVANCED_PERSONAS.includes(persona))
    );
  }, [contentDepth, persona]);

  if (contentDepth === 'simplified' || (persona && HIDE_PERSONAS.includes(persona))) {
    return null;
  }

  return (
    <div className="my-6 rounded-[var(--radius-card)] border border-[var(--color-brand)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[oklch(0.97_0.02_250)] text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-brand)] flex items-center gap-2">
          <span>🔬</span> {title}
        </span>
        <span className="text-[var(--color-brand)] text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 py-4 bg-white border-t border-[oklch(0.90_0.05_250)] text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Export from packages/ui/src/index.ts**

```ts
export { ConceptCard } from './components/ConceptCard';
export { AnnotatedCode } from './components/AnnotatedCode';
export { QuizBlock } from './components/QuizBlock';
export { AnalogyBridge } from './components/AnalogyBridge';
export { DangerZone } from './components/DangerZone';
export { DeepDive } from './components/DeepDive';
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/ui type-check
```
Expected: exits 0.

- [ ] **Step 4: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/ui && git commit -m "feat: add DeepDive persona-adaptive toggle component" && git push origin main
```

---

### Task 4: VideoEmbed + TryItInline components (packages/ui)

**Files:**
- Create: `packages/ui/src/components/VideoEmbed.tsx`
- Create: `packages/ui/src/components/TryItInline.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Produces:
  - `VideoEmbed({ src: string, title: string, start?: number })` — iframe with aspect-ratio box
  - `TryItInline({ defaultCode: string, height?: number })` — Monaco editor + srcdoc iframe preview, same pattern as Playground

- [ ] **Step 1: Create VideoEmbed.tsx**

```tsx
// packages/ui/src/components/VideoEmbed.tsx
'use client';

export interface VideoEmbedProps {
  src: string;
  title: string;
  start?: number;
}

export function VideoEmbed({ src, title, start }: VideoEmbedProps) {
  const url = start ? `${src}?t=${start}` : src;
  return (
    <div className="my-6 rounded-[var(--radius-card)] overflow-hidden border border-gray-200">
      <div className="bg-gray-900 px-4 py-2 text-xs text-gray-300 flex items-center gap-2">
        <span>▶</span>
        <span className="truncate">{title}</span>
      </div>
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TryItInline.tsx**

```tsx
// packages/ui/src/components/TryItInline.tsx
'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

export interface TryItInlineProps {
  defaultCode: string;
  height?: number;
}

const PREVIEW_WRAPPER = (code: string) => `<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>body{margin:8px;font-family:system-ui,sans-serif;font-size:14px}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const rootEl = document.getElementById('root');
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(rootEl).render(React.createElement(App));
    }
  <\/script>
</body>
</html>`;

export function TryItInline({ defaultCode, height = 200 }: TryItInlineProps) {
  const [code, setCode] = useState(defaultCode);
  const [preview, setPreview] = useState(PREVIEW_WRAPPER(defaultCode));
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    setPreview(PREVIEW_WRAPPER(code));
    setTimeout(() => setRunning(false), 300);
  }, [code]);

  return (
    <div className="my-6 rounded-[var(--radius-card)] border-2 border-[var(--color-brand)] overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-300 font-mono">Try It</span>
        <button
          onClick={run}
          disabled={running}
          className="text-xs px-3 py-1 bg-[var(--color-accent)] text-white rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {running ? '⟳ Running…' : '▶ Run'}
        </button>
      </div>
      <div className="flex" style={{ height }}>
        <div className="w-1/2 border-r border-gray-800">
          <Editor
            height={height}
            defaultLanguage="javascript"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'off', scrollBeyondLastLine: false, wordWrap: 'on' }}
          />
        </div>
        <div className="w-1/2 bg-white">
          <iframe
            srcDoc={preview}
            title="preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            style={{ height }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update packages/ui/src/index.ts**

```ts
export { ConceptCard } from './components/ConceptCard';
export { AnnotatedCode } from './components/AnnotatedCode';
export { QuizBlock } from './components/QuizBlock';
export { AnalogyBridge } from './components/AnalogyBridge';
export { DangerZone } from './components/DangerZone';
export { DeepDive } from './components/DeepDive';
export { VideoEmbed } from './components/VideoEmbed';
export { TryItInline } from './components/TryItInline';
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/ui type-check
```
Expected: exits 0.

- [ ] **Step 5: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/ui && git commit -m "feat: add VideoEmbed and TryItInline components" && git push origin main
```

---

### Task 5: ConceptMap component (packages/ui, @xyflow/react)

**Files:**
- Create: `packages/ui/src/components/ConceptMap.tsx`
- Modify: `packages/ui/package.json` (add `@xyflow/react`)
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Produces: `ConceptMap({ nodes: ConceptNode[], edges: ConceptEdge[] })`
  - `ConceptNode: { id: string, label: string, active?: boolean, x: number, y: number }`
  - `ConceptEdge: { id: string, source: string, target: string, label?: string }`

- [ ] **Step 1: Add @xyflow/react to packages/ui**

Edit `packages/ui/package.json` — add to `"dependencies"`:
```json
"@xyflow/react": "^12.0.0"
```

Then run:
```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm install
```

- [ ] **Step 2: Create ConceptMap.tsx**

```tsx
// packages/ui/src/components/ConceptMap.tsx
'use client';

import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface ConceptNode {
  id: string;
  label: string;
  active?: boolean;
  x: number;
  y: number;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ConceptMapProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  height?: number;
}

export function ConceptMap({ nodes, edges, height = 300 }: ConceptMapProps) {
  const flowNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    style: {
      background: n.active ? 'oklch(0.55 0.22 250)' : '#f1f5f9',
      color: n.active ? '#fff' : '#1e293b',
      border: `2px solid ${n.active ? 'oklch(0.45 0.22 250)' : '#e2e8f0'}`,
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: n.active ? '700' : '500',
      padding: '8px 14px',
    },
  }));

  const flowEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    labelStyle: { fontSize: '10px', fill: '#64748b' },
  }));

  return (
    <div className="my-6 rounded-[var(--radius-card)] border border-gray-200 overflow-hidden" style={{ height }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
```

- [ ] **Step 3: Update packages/ui/src/index.ts**

```ts
export { ConceptCard } from './components/ConceptCard';
export { AnnotatedCode } from './components/AnnotatedCode';
export { QuizBlock } from './components/QuizBlock';
export { AnalogyBridge } from './components/AnalogyBridge';
export { DangerZone } from './components/DangerZone';
export { DeepDive } from './components/DeepDive';
export { VideoEmbed } from './components/VideoEmbed';
export { TryItInline } from './components/TryItInline';
export { ConceptMap } from './components/ConceptMap';
export type { ConceptNode, ConceptEdge } from './components/ConceptMap';
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/ui type-check
```
Expected: exits 0.

- [ ] **Step 5: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/ui && git commit -m "feat: add ConceptMap component using @xyflow/react v12" && git push origin main
```

---

### Task 6: Hint token system + HintCard (packages/adaptive + packages/ui)

**Files:**
- Create: `packages/adaptive/src/hintTokens.ts`
- Create: `packages/ui/src/components/HintCard.tsx`
- Modify: `packages/adaptive/src/index.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Produces (packages/adaptive):
  - `getHintTokens(): number` — reads from localStorage key `hint_tokens`, default 10
  - `consumeHintToken(): number` — decrements by 1, returns new balance (min 0)
  - `replenishHintTokens(): void` — resets to 10 (call on new day or lab session start)
  - `HINT_TOKEN_KEY = 'hint_tokens'`
- Produces (packages/ui):
  - `HintCard({ hint: string, onReveal: () => void, tokenBalance: number })`

- [ ] **Step 1: Create hintTokens.ts**

```ts
// packages/adaptive/src/hintTokens.ts
export const HINT_TOKEN_KEY = 'hint_tokens';
const DEFAULT_TOKENS = 10;

export function getHintTokens(): number {
  if (typeof window === 'undefined') return DEFAULT_TOKENS;
  const val = localStorage.getItem(HINT_TOKEN_KEY);
  return val === null ? DEFAULT_TOKENS : parseInt(val, 10);
}

export function consumeHintToken(): number {
  const current = getHintTokens();
  const next = Math.max(0, current - 1);
  localStorage.setItem(HINT_TOKEN_KEY, String(next));
  return next;
}

export function replenishHintTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HINT_TOKEN_KEY, String(DEFAULT_TOKENS));
  }
}
```

- [ ] **Step 2: Update packages/adaptive/src/index.ts**

```ts
export * from './personas';
export * from './quiz';
export * from './adaptiveScore';
export * from './hintTokens';
```

- [ ] **Step 3: Create HintCard.tsx**

```tsx
// packages/ui/src/components/HintCard.tsx
'use client';

import { useState } from 'react';

export interface HintCardProps {
  hint: string;
  onReveal: () => void;
  tokenBalance: number;
}

export function HintCard({ hint, onReveal, tokenBalance }: HintCardProps) {
  const [revealed, setRevealed] = useState(false);

  function handleReveal() {
    if (tokenBalance <= 0) return;
    setRevealed(true);
    onReveal();
  }

  return (
    <div className="my-4 rounded-[var(--radius-card)] border border-[var(--color-warning)] bg-[oklch(0.98_0.02_60)]">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-[var(--color-warning)] flex items-center gap-2">
          💡 Hint Available
        </span>
        {!revealed && (
          <button
            onClick={handleReveal}
            disabled={tokenBalance <= 0}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-warning)] text-white font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tokenBalance <= 0 ? 'No tokens' : `Reveal (costs 1 token · ${tokenBalance} left)`}
          </button>
        )}
      </div>
      {revealed && (
        <div className="px-4 py-3 border-t border-[oklch(0.90_0.05_60)] text-sm text-gray-700">
          {hint}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Update packages/ui/src/index.ts**

```ts
export { ConceptCard } from './components/ConceptCard';
export { AnnotatedCode } from './components/AnnotatedCode';
export { QuizBlock } from './components/QuizBlock';
export { AnalogyBridge } from './components/AnalogyBridge';
export { DangerZone } from './components/DangerZone';
export { DeepDive } from './components/DeepDive';
export { VideoEmbed } from './components/VideoEmbed';
export { TryItInline } from './components/TryItInline';
export { ConceptMap } from './components/ConceptMap';
export type { ConceptNode, ConceptEdge } from './components/ConceptMap';
export { HintCard } from './components/HintCard';
```

- [ ] **Step 5: Type-check both packages**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/adaptive type-check && pnpm --filter @repo/ui type-check
```
Expected: both exit 0.

- [ ] **Step 6: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/adaptive packages/ui && git commit -m "feat: add hint token system and HintCard component" && git push origin main
```

---

### Task 7: Badge system (packages/adaptive)

**Files:**
- Create: `packages/adaptive/src/badges.ts`
- Modify: `packages/adaptive/src/index.ts`

**Interfaces:**
- Produces:
  - `BADGE_DEFINITIONS: BadgeDefinition[]`
  - `BadgeDefinition: { id: string, name: string, emoji: string, description: string, criterion: 'lesson' | 'module' | 'lab' | 'quiz-perfect', targetSlug?: string }`
  - `checkBadge(event: BadgeEvent, earned: string[]): BadgeDefinition | null`
  - `BadgeEvent: { type: 'lesson' | 'module' | 'lab' | 'quiz-perfect', slug: string }`
  - `getEarnedBadges(): string[]`
  - `awardBadge(id: string): string[]`

- [ ] **Step 1: Create badges.ts**

```ts
// packages/adaptive/src/badges.ts

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  criterion: 'lesson' | 'module' | 'lab' | 'quiz-perfect';
  targetSlug?: string;
}

export interface BadgeEvent {
  type: 'lesson' | 'module' | 'lab' | 'quiz-perfect';
  slug: string;
}

const BADGE_KEY = 'earned_badges';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-lesson', name: 'First Step', emoji: '🚀', description: 'Complete your first lesson', criterion: 'lesson' },
  { id: 'foundations-complete', name: 'Rock Solid', emoji: '🪨', description: 'Complete the Foundations module', criterion: 'module', targetSlug: 'module-1-foundations' },
  { id: 'hooks-complete', name: 'Hook, Line & Sinker', emoji: '🪝', description: 'Complete the Hooks module', criterion: 'module', targetSlug: 'module-2-hooks' },
  { id: 'patterns-complete', name: 'Pattern Master', emoji: '🧩', description: 'Complete the Patterns module', criterion: 'module', targetSlug: 'module-3-patterns' },
  { id: 'first-lab', name: 'Lab Rat', emoji: '🧪', description: 'Complete your first lab', criterion: 'lab' },
  { id: 'quiz-perfect', name: 'Sharp Mind', emoji: '🎯', description: 'Score 100% on a lesson quiz', criterion: 'quiz-perfect' },
  { id: 'spfx-intro-complete', name: 'SPFx Explorer', emoji: '🗺️', description: 'Complete SPFx Introduction module', criterion: 'module', targetSlug: 'module-1-spfx-intro' },
  { id: 'spfx-deploy-complete', name: 'Ship It!', emoji: '📦', description: 'Complete the SPFx Deployment module', criterion: 'module', targetSlug: 'module-3-deployment' },
];

export function getEarnedBadges(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(BADGE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function awardBadge(id: string): string[] {
  const current = getEarnedBadges();
  if (current.includes(id)) return current;
  const updated = [...current, id];
  localStorage.setItem(BADGE_KEY, JSON.stringify(updated));
  return updated;
}

export function checkBadge(event: BadgeEvent, earned: string[]): BadgeDefinition | null {
  for (const badge of BADGE_DEFINITIONS) {
    if (earned.includes(badge.id)) continue;
    if (badge.criterion === event.type) {
      if (!badge.targetSlug || badge.targetSlug === event.slug) {
        return badge;
      }
    }
    if (badge.id === 'first-lesson' && event.type === 'lesson' && earned.length === 0) {
      return badge;
    }
  }
  return null;
}
```

- [ ] **Step 2: Update packages/adaptive/src/index.ts**

```ts
export * from './personas';
export * from './quiz';
export * from './adaptiveScore';
export * from './hintTokens';
export * from './badges';
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/adaptive type-check
```
Expected: exits 0.

- [ ] **Step 4: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/adaptive && git commit -m "feat: add badge system with definitions and award logic" && git push origin main
```

---

### Task 8: useAdaptive hook (packages/adaptive)

**Files:**
- Create: `packages/adaptive/src/useAdaptive.ts`
- Modify: `packages/adaptive/src/index.ts`

**Interfaces:**
- Consumes: `AdaptiveScore`, `updateScore`, `getContentDepth` from `adaptiveScore.ts`; `getEarnedBadges`, `awardBadge`, `checkBadge`, `BadgeDefinition` from `badges.ts`; `getGuestProgress`, `setGuestProgress` from `@repo/auth` (but to avoid cross-package dep, store directly to localStorage)
- Produces:
  ```ts
  useAdaptive(portal: 'react' | 'spfx'): {
    score: AdaptiveScore;
    contentDepth: 'simplified' | 'standard' | 'enriched';
    earnedBadges: string[];
    pendingBadge: BadgeDefinition | null;
    onQuizComplete: (lessonSlug: string, correct: number, total: number) => void;
    onLessonComplete: (lessonSlug: string) => void;
    onModuleComplete: (moduleSlug: string) => void;
    onLabComplete: (labSlug: string) => void;
    dismissBadge: () => void;
  }
  ```

- [ ] **Step 1: Create useAdaptive.ts**

```ts
// packages/adaptive/src/useAdaptive.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { AdaptiveScore, updateScore, getContentDepth } from './adaptiveScore';
import { BadgeDefinition, getEarnedBadges, awardBadge, checkBadge } from './badges';

const SCORE_KEY_PREFIX = 'adaptive_score_';

function loadScore(portal: string): AdaptiveScore {
  if (typeof window === 'undefined') return { scores: {}, completedLessons: [] };
  try {
    const raw = localStorage.getItem(SCORE_KEY_PREFIX + portal);
    return raw ? (JSON.parse(raw) as AdaptiveScore) : { scores: {}, completedLessons: [] };
  } catch {
    return { scores: {}, completedLessons: [] };
  }
}

function saveScore(portal: string, score: AdaptiveScore): void {
  localStorage.setItem(SCORE_KEY_PREFIX + portal, JSON.stringify(score));
}

export function useAdaptive(portal: 'react' | 'spfx') {
  const [score, setScore] = useState<AdaptiveScore>(() => loadScore(portal));
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => getEarnedBadges());
  const [pendingBadge, setPendingBadge] = useState<BadgeDefinition | null>(null);

  const topicScores = Object.values(score.scores);
  const avgScore = topicScores.length ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length) : 50;
  const contentDepth = getContentDepth(avgScore);

  const tryAwardBadge = useCallback((event: Parameters<typeof checkBadge>[0], currentEarned: string[]) => {
    const badge = checkBadge(event, currentEarned);
    if (badge) {
      const updated = awardBadge(badge.id);
      setEarnedBadges(updated);
      setPendingBadge(badge);
    }
  }, []);

  const onQuizComplete = useCallback((lessonSlug: string, correct: number, total: number) => {
    setScore((prev) => {
      const next = updateScore(prev, lessonSlug, correct, total);
      saveScore(portal, next);
      return next;
    });
    if (correct === total && total > 0) {
      tryAwardBadge({ type: 'quiz-perfect', slug: lessonSlug }, earnedBadges);
    }
  }, [portal, earnedBadges, tryAwardBadge]);

  const onLessonComplete = useCallback((lessonSlug: string) => {
    setScore((prev) => {
      if (prev.completedLessons.includes(lessonSlug)) return prev;
      const next = { ...prev, completedLessons: [...prev.completedLessons, lessonSlug] };
      saveScore(portal, next);
      return next;
    });
    tryAwardBadge({ type: 'lesson', slug: lessonSlug }, earnedBadges);
  }, [portal, earnedBadges, tryAwardBadge]);

  const onModuleComplete = useCallback((moduleSlug: string) => {
    tryAwardBadge({ type: 'module', slug: moduleSlug }, earnedBadges);
  }, [earnedBadges, tryAwardBadge]);

  const onLabComplete = useCallback((labSlug: string) => {
    tryAwardBadge({ type: 'lab', slug: labSlug }, earnedBadges);
  }, [earnedBadges, tryAwardBadge]);

  const dismissBadge = useCallback(() => setPendingBadge(null), []);

  return { score, contentDepth, earnedBadges, pendingBadge, onQuizComplete, onLessonComplete, onModuleComplete, onLabComplete, dismissBadge };
}
```

- [ ] **Step 2: Update packages/adaptive/src/index.ts**

```ts
export * from './personas';
export * from './quiz';
export * from './adaptiveScore';
export * from './hintTokens';
export * from './badges';
export * from './useAdaptive';
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm --filter @repo/adaptive type-check
```
Expected: exits 0.

- [ ] **Step 4: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add packages/adaptive && git commit -m "feat: add useAdaptive hook wiring quiz → score → badges" && git push origin main
```

---

### Task 9: Both portals — Header hint tokens + LessonLayout adaptive wiring + add @repo/phaser dep

**Files:**
- Modify: `apps/react-portal/package.json`
- Modify: `apps/spfx-portal/package.json`
- Modify: `apps/react-portal/components/Header.tsx`
- Modify: `apps/spfx-portal/components/Header.tsx`
- Modify: `apps/react-portal/components/LessonLayout.tsx`
- Modify: `apps/spfx-portal/components/LessonLayout.tsx`

**Interfaces:**
- Consumes: `getHintTokens` from `@repo/adaptive`; `useAdaptive` from `@repo/adaptive`; `QuizBlock` with `onComplete` wired; `BadgeMoment` from `@repo/phaser`

- [ ] **Step 1: Add @repo/phaser to both portal package.json files**

Edit `apps/react-portal/package.json` — add to `"dependencies"`:
```json
"@repo/phaser": "workspace:*"
```

Edit `apps/spfx-portal/package.json` — add to `"dependencies"`:
```json
"@repo/phaser": "workspace:*"
```

Run:
```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm install
```

- [ ] **Step 2: Update react-portal Header.tsx to show hint token count**

Replace the entire file `apps/react-portal/components/Header.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { getHintTokens } from '@repo/adaptive';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, signInWithGitHub, signInWithMicrosoft, signOut } = useAuth();
  const [tokens, setTokens] = useState<number>(10);

  useEffect(() => {
    setTokens(getHintTokens());
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--color-brand)] text-lg">
          ⚛ React Learn
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/learn" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Lessons
          </Link>
          <Link href="/labs" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Labs
          </Link>
          <Link href="/playground" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Playground
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[oklch(0.97_0.02_60)] border border-[var(--color-warning)] text-[var(--color-warning)] font-medium">
            💡 {tokens}
          </span>
          {user ? (
            <button
              onClick={signOut}
              className="text-sm px-4 py-1.5 border border-gray-200 rounded-full hover:border-[var(--color-brand)] transition-colors"
            >
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={signInWithGitHub}
                className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-full hover:opacity-90"
              >
                GitHub
              </button>
              <button
                onClick={signInWithMicrosoft}
                className="text-sm px-4 py-1.5 bg-[var(--color-brand)] text-white rounded-full hover:opacity-90"
              >
                Microsoft
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update spfx-portal Header.tsx to show hint token count**

Replace the entire file `apps/spfx-portal/components/Header.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { getHintTokens } from '@repo/adaptive';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, signInWithGitHub, signInWithMicrosoft, signOut } = useAuth();
  const [tokens, setTokens] = useState<number>(10);

  useEffect(() => {
    setTokens(getHintTokens());
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--color-brand)] text-lg">
          ⬡ SPFx Learn
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/learn" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Lessons
          </Link>
          <Link href="/labs" className="text-sm text-gray-600 hover:text-[var(--color-brand)]">
            Labs
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[oklch(0.97_0.02_60)] border border-[var(--color-warning)] text-[var(--color-warning)] font-medium">
            💡 {tokens}
          </span>
          {user ? (
            <button
              onClick={signOut}
              className="text-sm px-4 py-1.5 border border-gray-200 rounded-full hover:border-[var(--color-brand)] transition-colors"
            >
              Sign out
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={signInWithGitHub}
                className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-full hover:opacity-90"
              >
                GitHub
              </button>
              <button
                onClick={signInWithMicrosoft}
                className="text-sm px-4 py-1.5 bg-[var(--color-brand)] text-white rounded-full hover:opacity-90"
              >
                Microsoft
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Update react-portal LessonLayout.tsx with adaptive wiring + BadgeMoment**

Replace the entire file `apps/react-portal/components/LessonLayout.tsx`:
```tsx
'use client';

import type { ModuleDefinition, LessonDefinition } from '@repo/content';
import { Sidebar } from './Sidebar';
import { MODULES } from '../content/modules';
import Link from 'next/link';
import { useAdaptive } from '@repo/adaptive';
import { BadgeMoment } from '@repo/phaser';
import { useState } from 'react';

interface LessonLayoutProps {
  module: ModuleDefinition;
  lesson: LessonDefinition;
  children: React.ReactNode;
}

export function LessonLayout({ module: mod, lesson, children }: LessonLayoutProps) {
  const currentIdx = mod.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = mod.lessons[currentIdx - 1];
  const next = mod.lessons[currentIdx + 1];
  const { pendingBadge, dismissBadge, onLessonComplete } = useAdaptive('react');
  const [lessonMarked, setLessonMarked] = useState(false);

  function handleMarkComplete() {
    if (!lessonMarked) {
      onLessonComplete(`${mod.slug}/${lesson.slug}`);
      setLessonMarked(true);
    }
  }

  return (
    <div className="flex min-h-screen">
      {pendingBadge && <BadgeMoment badge={pendingBadge.emoji} onDone={dismissBadge} />}
      <Sidebar modules={MODULES} />
      <main className="flex-1 max-w-3xl mx-auto px-8 py-10">
        <p className="text-xs text-[var(--color-brand)] font-bold uppercase tracking-widest mb-2">
          {mod.title}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{lesson.duration} read</p>
        <div className="prose prose-gray max-w-none">{children}</div>
        <div className="mt-8">
          <button
            onClick={handleMarkComplete}
            disabled={lessonMarked}
            className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-default"
          >
            {lessonMarked ? '✓ Lesson Complete' : 'Mark as Complete'}
          </button>
        </div>
        <div className="mt-8 pt-8 border-t flex justify-between">
          {prev ? (
            <Link href={`/learn/${mod.slug}/${prev.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              ← {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/learn/${mod.slug}/${next.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              {next.title} →
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Update spfx-portal LessonLayout.tsx with adaptive wiring + BadgeMoment**

Replace the entire file `apps/spfx-portal/components/LessonLayout.tsx`:
```tsx
'use client';

import type { ModuleDefinition, LessonDefinition } from '@repo/content';
import { Sidebar } from './Sidebar';
import { MODULES } from '../content/modules';
import Link from 'next/link';
import { useAdaptive } from '@repo/adaptive';
import { BadgeMoment } from '@repo/phaser';
import { useState } from 'react';

interface LessonLayoutProps {
  module: ModuleDefinition;
  lesson: LessonDefinition;
  children: React.ReactNode;
}

export function LessonLayout({ module: mod, lesson, children }: LessonLayoutProps) {
  const currentIdx = mod.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = mod.lessons[currentIdx - 1];
  const next = mod.lessons[currentIdx + 1];
  const { pendingBadge, dismissBadge, onLessonComplete } = useAdaptive('spfx');
  const [lessonMarked, setLessonMarked] = useState(false);

  function handleMarkComplete() {
    if (!lessonMarked) {
      onLessonComplete(`${mod.slug}/${lesson.slug}`);
      setLessonMarked(true);
    }
  }

  return (
    <div className="flex min-h-screen">
      {pendingBadge && <BadgeMoment badge={pendingBadge.emoji} onDone={dismissBadge} />}
      <Sidebar modules={MODULES} />
      <main className="flex-1 max-w-3xl mx-auto px-8 py-10">
        <p className="text-xs text-[var(--color-brand)] font-bold uppercase tracking-widest mb-2">
          {mod.title}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{lesson.duration} read</p>
        <div className="prose prose-gray max-w-none">{children}</div>
        <div className="mt-8">
          <button
            onClick={handleMarkComplete}
            disabled={lessonMarked}
            className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-default"
          >
            {lessonMarked ? '✓ Lesson Complete' : 'Mark as Complete'}
          </button>
        </div>
        <div className="mt-8 pt-8 border-t flex justify-between">
          {prev ? (
            <Link href={`/learn/${mod.slug}/${prev.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              ← {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/learn/${mod.slug}/${next.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
              {next.title} →
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Build both portals to verify**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm turbo run build --filter=react-portal --filter=spfx-portal
```
Expected: both build to `out/` with no TypeScript errors. If type errors appear relating to `BadgeMoment` needing 'use client', verify `packages/phaser/src/BadgeMoment.tsx` has `'use client'` at the top.

- [ ] **Step 7: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add apps/react-portal apps/spfx-portal && git commit -m "feat: wire adaptive hook, hint tokens, and BadgeMoment into both portals" && git push origin main
```

---

### Task 10: Guided Labs + Challenge mode — react-portal

**Files:**
- Create: `apps/react-portal/content/labs.ts`
- Create: `apps/react-portal/app/labs/page.tsx`
- Create: `apps/react-portal/app/labs/[lab]/page.tsx`
- Create: `apps/react-portal/components/GuidedLab.tsx`
- Create: `apps/react-portal/components/ChallengeMode.tsx`

**Interfaces:**
- Consumes: `getHintTokens`, `consumeHintToken` from `@repo/adaptive`; `useAdaptive` from `@repo/adaptive`; `HintCard` from `@repo/ui`
- Produces: `/labs` listing page; `/labs/[lab]` page that renders guided or challenge mode

- [ ] **Step 1: Create content/labs.ts**

```ts
// apps/react-portal/content/labs.ts

export type LabType = 'guided' | 'challenge';

export interface LabStep {
  title: string;
  instruction: string;
  hint?: string;
}

export interface LabDefinition {
  slug: string;
  title: string;
  description: string;
  type: LabType;
  duration: string;
  module: string;
  starterCode: string;
  steps?: LabStep[];
  goal?: string;
}

export const LABS: LabDefinition[] = [
  {
    slug: 'build-counter',
    title: 'Build a Counter',
    description: 'Use useState to build an interactive counter with increment, decrement, and reset.',
    type: 'guided',
    duration: '15 min',
    module: 'module-2-hooks',
    steps: [
      { title: 'Create the component', instruction: 'Define a function `App` that returns a `<div>`. Add an `<h1>` showing "Counter: 0" and three buttons: Increment, Decrement, Reset.', hint: 'Use `function App() { return <div>...</div> }` — React is already loaded for you.' },
      { title: 'Add state', instruction: 'Import `useState` from React. Add `const [count, setCount] = React.useState(0)` inside your component. Replace the "0" in your heading with `{count}`.', hint: 'React is available as a global. Try `const [count, setCount] = React.useState(0)` — no import needed here.' },
      { title: 'Wire the buttons', instruction: 'Add `onClick` handlers: Increment calls `setCount(count + 1)`, Decrement calls `setCount(count - 1)`, Reset calls `setCount(0)`.', hint: 'Use `onClick={() => setCount(count + 1)}` — arrow function inside JSX.' },
    ],
    starterCode: `function App() {
  return (
    <div style={{textAlign:'center',marginTop:'40px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'2rem'}}>Counter: 0</h1>
      <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'20px'}}>
        <button>Decrement</button>
        <button>Reset</button>
        <button>Increment</button>
      </div>
    </div>
  );
}`,
  },
  {
    slug: 'todo-list',
    title: 'Build a To-Do List',
    description: 'Combine useState with lists — add and remove items dynamically.',
    type: 'guided',
    duration: '20 min',
    module: 'module-2-hooks',
    steps: [
      { title: 'Display a list', instruction: 'Create an `App` component with `const [items, setItems] = React.useState(["Buy milk", "Write code"])`. Render the items inside a `<ul>` using `.map()`.', hint: '`items.map((item, i) => <li key={i}>{item}</li>)`' },
      { title: 'Add new items', instruction: 'Add an `<input>` and an "Add" button. Store the input value in a second state variable (`inputVal`). On button click, append it to `items`.', hint: '`setItems([...items, inputVal])` — spread the existing items, add the new one.' },
      { title: 'Remove items', instruction: 'Add a "×" button inside each `<li>`. On click, filter out that item by index: `setItems(items.filter((_, idx) => idx !== i))`.', hint: '`items.filter((_, idx) => idx !== i)` — keeps everything except the clicked index.' },
    ],
    starterCode: `function App() {
  return (
    <div style={{maxWidth:'400px',margin:'40px auto',fontFamily:'system-ui'}}>
      <h2>My To-Do List</h2>
      <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
        <input placeholder="Add item..." style={{flex:1,padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
        <button style={{padding:'8px 16px'}}>Add</button>
      </div>
      <ul style={{listStyle:'none',padding:0}}>
        <li style={{display:'flex',justifyContent:'space-between',padding:'8px',marginBottom:'4px',background:'#f1f5f9',borderRadius:'6px'}}>
          Example item <button>×</button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  {
    slug: 'useeffect-timer',
    title: 'useEffect Timer Challenge',
    description: 'Build a live stopwatch using useEffect and setInterval.',
    type: 'challenge',
    duration: '20 min',
    module: 'module-2-hooks',
    goal: 'Build a stopwatch with Start, Stop, and Reset buttons. The timer should count up in seconds using useEffect. Clicking Stop should pause it (not reset). Clicking Start again should resume from where it stopped.',
    starterCode: `// Build a stopwatch!
// Requirements:
// - Shows elapsed seconds: "0s", "1s", "2s" ...
// - Start button begins counting
// - Stop button pauses (does NOT reset)
// - Reset button sets back to 0
// - useEffect + setInterval (clear on cleanup!)

function App() {
  return (
    <div style={{textAlign:'center',marginTop:'60px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'3rem',fontVariantNumeric:'tabular-nums'}}>0s</h1>
      <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
        <button>Start</button>
        <button>Stop</button>
        <button>Reset</button>
      </div>
    </div>
  );
}`,
  },
];

export function getLab(slug: string): LabDefinition | undefined {
  return LABS.find((l) => l.slug === slug);
}
```

- [ ] **Step 2: Create app/labs/page.tsx**

```tsx
// apps/react-portal/app/labs/page.tsx
import Link from 'next/link';
import { LABS } from '../../content/labs';

export default function LabsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Labs</h1>
      <p className="text-gray-500 mb-10">Hands-on exercises — guided walkthroughs and open challenges.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`/labs/${lab.slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
              </span>
              <span className="text-xs text-gray-400">{lab.duration}</span>
            </div>
            <h2 className="font-bold text-gray-800 mb-1">{lab.title}</h2>
            <p className="text-sm text-gray-500">{lab.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create components/GuidedLab.tsx**

```tsx
// apps/react-portal/components/GuidedLab.tsx
'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { HintCard } from '@repo/ui';
import { consumeHintToken, getHintTokens } from '@repo/adaptive';
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
  const steps = lab.steps ?? [];

  const runCode = useCallback(() => {
    setPreview(PREVIEW_WRAP(code));
  }, [code]);

  const markStepDone = (i: number) => {
    setCompletedSteps((prev) => prev.includes(i) ? prev : [...prev, i]);
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
```

- [ ] **Step 4: Create components/ChallengeMode.tsx**

```tsx
// apps/react-portal/components/ChallengeMode.tsx
'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { consumeHintToken, getHintTokens } from '@repo/adaptive';
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

export function ChallengeMode({ lab }: { lab: LabDefinition }) {
  const [code, setCode] = useState(lab.starterCode);
  const [preview, setPreview] = useState(PREVIEW_WRAP(lab.starterCode));
  const [tokenBalance, setTokenBalance] = useState(getHintTokens);
  const [showHint, setShowHint] = useState(false);

  const runCode = useCallback(() => setPreview(PREVIEW_WRAP(code)), [code]);

  function revealHint() {
    if (tokenBalance <= 0) return;
    const next = consumeHintToken();
    setTokenBalance(next);
    setShowHint(true);
  }

  return (
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
  );
}
```

- [ ] **Step 5: Create app/labs/[lab]/page.tsx**

```tsx
// apps/react-portal/app/labs/[lab]/page.tsx
import { notFound } from 'next/navigation';
import { LABS, getLab } from '../../../content/labs';
import { GuidedLab } from '../../../components/GuidedLab';
import { ChallengeMode } from '../../../components/ChallengeMode';

export async function generateStaticParams() {
  return LABS.map((lab) => ({ lab: lab.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  return lab.type === 'guided'
    ? <GuidedLab lab={lab} />
    : <ChallengeMode lab={lab} />;
}
```

- [ ] **Step 6: Build react-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm turbo run build --filter=react-portal
```
Expected: builds to `out/` with static pages at `out/labs/`, `out/labs/build-counter/`, `out/labs/todo-list/`, `out/labs/useeffect-timer/`.

- [ ] **Step 7: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add apps/react-portal && git commit -m "feat: add guided labs and challenge mode to react-portal" && git push origin main
```

---

### Task 11: SPFx portal labs + update lesson MDX files with Phase 2 components

**Files:**
- Create: `apps/spfx-portal/content/labs.ts`
- Create: `apps/spfx-portal/app/labs/page.tsx`
- Create: `apps/spfx-portal/app/labs/[lab]/page.tsx`
- Create: `apps/spfx-portal/components/SpfxLab.tsx`
- Modify: `apps/react-portal/content/lessons/module-1-foundations/1-what-is-react.mdx`
- Modify: `apps/react-portal/content/lessons/module-2-hooks/1-use-state.mdx`
- Modify: `apps/react-portal/mdx-components.tsx`
- Modify: `apps/spfx-portal/mdx-components.tsx`

**Interfaces:**
- Produces: SPFx `/labs` listing + `/labs/[lab]` pages (code walkthroughs, no live preview — SPFx can't run in browser)
- MDX components updated to include all Phase 2 block components

- [ ] **Step 1: Create apps/spfx-portal/content/labs.ts**

```ts
// apps/spfx-portal/content/labs.ts

export type LabType = 'guided' | 'challenge';

export interface SpfxLabStep {
  title: string;
  instruction: string;
  code?: string;
  language?: string;
  hint?: string;
}

export interface SpfxLabDefinition {
  slug: string;
  title: string;
  description: string;
  type: LabType;
  duration: string;
  module: string;
  steps?: SpfxLabStep[];
  goal?: string;
  starterCode?: string;
}

export const SPFX_LABS: SpfxLabDefinition[] = [
  {
    slug: 'scaffold-webpart',
    title: 'Scaffold Your First Web Part',
    description: 'Use the SPFx generator to scaffold a Hello World web part, then explore the generated files.',
    type: 'guided',
    duration: '20 min',
    module: 'module-1-spfx-intro',
    steps: [
      {
        title: 'Install global dependencies',
        instruction: 'Open your terminal and install the SPFx toolchain globally. You need Node.js 22 LTS (check with `node -v`), then run:',
        code: `npm install -g @microsoft/generator-sharepoint yo @rushstack/heft`,
        language: 'bash',
        hint: 'If you see EACCES errors on Mac/Linux, prefix with `sudo` or fix npm permissions with `nvm`.',
      },
      {
        title: 'Run the Yeoman generator',
        instruction: 'Create a new directory for your project, then run the SPFx Yeoman generator. Choose "WebPart", "React", and give it the name "HelloWorld".',
        code: `mkdir my-first-webpart && cd my-first-webpart\nyo @microsoft/sharepoint`,
        language: 'bash',
        hint: 'When prompted for framework, choose "React". When prompted for component type, choose "WebPart".',
      },
      {
        title: 'Start the development server',
        instruction: 'In SPFx 1.22+, Heft replaces gulp. Start the local development server with:',
        code: `heft start`,
        language: 'bash',
      },
      {
        title: 'Open the Debug Toolbar',
        instruction: 'In SPFx 1.21+, the classic Workbench (/_layouts/15/workbench.aspx) is deprecated. Instead, use the SPFx Debug Toolbar. Open your browser and navigate to your SharePoint site, then press F12 → SPFx Debug Toolbar to add your local web part to a page.',
        hint: 'The Debug Toolbar URL format is: https://your-tenant.sharepoint.com/sites/your-site?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js',
      },
    ],
  },
  {
    slug: 'pnpjs-list-data',
    title: 'Fetch SharePoint List Data with PnP JS',
    description: 'Use @pnp/sp to read list items from SharePoint and display them in your web part.',
    type: 'guided',
    duration: '25 min',
    module: 'module-2-react-in-spfx',
    steps: [
      {
        title: 'Install @pnp/sp',
        instruction: 'Install the PnP JS SharePoint library:',
        code: `npm install @pnp/sp`,
        language: 'bash',
      },
      {
        title: 'Initialise PnP in onInit',
        instruction: 'In your web part class (`.ts` file), override `onInit` and configure PnP with the web part context:',
        code: `import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

private sp: ReturnType<typeof spfi>;

protected async onInit(): Promise<void> {
  await super.onInit();
  this.sp = spfi().using(SPFx(this.context));
}`,
        language: 'typescript',
        hint: 'The SPFx context provides the current user, site URL, and auth tokens PnP needs to make API calls.',
      },
      {
        title: 'Fetch items in your React component',
        instruction: 'Pass the sp instance to your React component as a prop, then use useEffect to fetch list items:',
        code: `const [items, setItems] = React.useState([]);

React.useEffect(() => {
  sp.web.lists.getByTitle("Announcements").items()
    .then(result => setItems(result))
    .catch(console.error);
}, []);`,
        language: 'typescript',
        hint: 'Make sure the list "Announcements" exists in your SharePoint site, or replace it with a list you have.',
      },
    ],
  },
  {
    slug: 'deploy-sppkg',
    title: 'Package & Deploy Challenge',
    description: 'Package your web part as an .sppkg file and deploy it to the SharePoint App Catalog.',
    type: 'challenge',
    duration: '30 min',
    module: 'module-3-deployment',
    goal: 'Starting from a working SPFx web part project, build and deploy it to your tenant. Your goal: (1) run `heft package-solution --production` to create the .sppkg file, (2) upload it to the App Catalog, (3) add it to a page. Document each step with screenshots.',
  },
];

export function getSpfxLab(slug: string): SpfxLabDefinition | undefined {
  return SPFX_LABS.find((l) => l.slug === slug);
}
```

- [ ] **Step 2: Create apps/spfx-portal/components/SpfxLab.tsx**

```tsx
// apps/spfx-portal/components/SpfxLab.tsx
'use client';

import { useState } from 'react';
import { consumeHintToken, getHintTokens } from '@repo/adaptive';
import type { SpfxLabDefinition } from '../content/labs';

export function SpfxLab({ lab }: { lab: SpfxLabDefinition }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tokenBalance, setTokenBalance] = useState(getHintTokens);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const steps = lab.steps ?? [];

  const markDone = (i: number) => {
    setCompletedSteps((prev) => prev.includes(i) ? prev : [...prev, i]);
    if (i + 1 < steps.length) setCurrentStep(i + 1);
  };

  const revealHint = (i: number) => {
    if (tokenBalance <= 0 || revealedHints.includes(i)) return;
    setTokenBalance(consumeHintToken());
    setRevealedHints((prev) => [...prev, i]);
  };

  return (
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
  );
}
```

- [ ] **Step 3: Create apps/spfx-portal/app/labs/page.tsx**

```tsx
// apps/spfx-portal/app/labs/page.tsx
import Link from 'next/link';
import { SPFX_LABS } from '../../content/labs';

export default function LabsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">SPFx Labs</h1>
      <p className="text-gray-500 mb-10">Hands-on exercises using real SPFx tools.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {SPFX_LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`/labs/${lab.slug}`}
            className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
              </span>
              <span className="text-xs text-gray-400">{lab.duration}</span>
            </div>
            <h2 className="font-bold text-gray-800 mb-1">{lab.title}</h2>
            <p className="text-sm text-gray-500">{lab.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Create apps/spfx-portal/app/labs/[lab]/page.tsx**

```tsx
// apps/spfx-portal/app/labs/[lab]/page.tsx
import { notFound } from 'next/navigation';
import { SPFX_LABS, getSpfxLab } from '../../../content/labs';
import { SpfxLab } from '../../../components/SpfxLab';

export async function generateStaticParams() {
  return SPFX_LABS.map((lab) => ({ lab: lab.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = getSpfxLab(slug);
  if (!lab) notFound();
  return <SpfxLab lab={lab} />;
}
```

- [ ] **Step 5: Update react-portal mdx-components.tsx to include Phase 2 components**

Replace `apps/react-portal/mdx-components.tsx`:
```tsx
import type { MDXComponents } from 'mdx/types';
import { ConceptCard, AnnotatedCode, QuizBlock, AnalogyBridge, DangerZone, DeepDive, VideoEmbed, TryItInline, ConceptMap } from '@repo/ui';
import type { ConceptNode, ConceptEdge } from '@repo/ui';
import { MicroAnimation } from '@repo/phaser';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ConceptCard,
    AnnotatedCode,
    QuizBlock,
    AnalogyBridge,
    DangerZone,
    DeepDive,
    VideoEmbed,
    TryItInline,
    ConceptMap,
    MicroAnimation,
    ...components,
  };
}
```

- [ ] **Step 6: Update spfx-portal mdx-components.tsx to include Phase 2 components**

Replace `apps/spfx-portal/mdx-components.tsx`:
```tsx
import type { MDXComponents } from 'mdx/types';
import { ConceptCard, AnnotatedCode, QuizBlock, AnalogyBridge, DangerZone, DeepDive, VideoEmbed, TryItInline, ConceptMap } from '@repo/ui';
import { MicroAnimation } from '@repo/phaser';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ConceptCard,
    AnnotatedCode,
    QuizBlock,
    AnalogyBridge,
    DangerZone,
    DeepDive,
    VideoEmbed,
    TryItInline,
    ConceptMap,
    MicroAnimation,
    ...components,
  };
}
```

- [ ] **Step 7: Add Phase 2 components to react-portal Module 1 Lesson 1 MDX**

Append to `apps/react-portal/content/lessons/module-1-foundations/1-what-is-react.mdx` (after existing content):

```mdx

## How React Renders

Watch how a state change flows through React's render pipeline:

<MicroAnimation scene="render-cycle" />

## Topic Map

<ConceptMap
  nodes={[
    { id: 'react', label: 'React', active: true, x: 160, y: 20 },
    { id: 'components', label: 'Components', x: 60, y: 100 },
    { id: 'props', label: 'Props', x: 160, y: 100 },
    { id: 'state', label: 'State', x: 260, y: 100 },
    { id: 'hooks', label: 'Hooks', x: 260, y: 180 },
    { id: 'vdom', label: 'Virtual DOM', x: 60, y: 180 },
  ]}
  edges={[
    { id: 'e1', source: 'react', target: 'components' },
    { id: 'e2', source: 'react', target: 'props' },
    { id: 'e3', source: 'react', target: 'state' },
    { id: 'e4', source: 'state', target: 'hooks' },
    { id: 'e5', source: 'react', target: 'vdom' },
  ]}
/>

<DeepDive title="Why Virtual DOM?">
The Virtual DOM is an in-memory representation of the real DOM. React computes the diff between the previous Virtual DOM tree and the new one (reconciliation), then applies only the minimal set of changes to the real DOM. This is called the "commit phase". The key insight: DOM mutations are expensive; JavaScript object comparisons are cheap.
</DeepDive>
```

- [ ] **Step 8: Add Phase 2 components to react-portal useState MDX**

Append to `apps/react-portal/content/lessons/module-2-hooks/1-use-state.mdx` (after existing content):

```mdx

## Try It: Your First useState

<TryItInline
  defaultCode={`function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{textAlign:'center', marginTop:'40px', fontFamily:'system-ui'}}>
      <h2 style={{fontSize:'2rem'}}>{count}</h2>
      <button onClick={() => setCount(count + 1)} style={{padding:'8px 20px', fontSize:'1rem', cursor:'pointer'}}>
        Click me!
      </button>
    </div>
  );
}`}
/>

<DeepDive title="How useState works internally">
Each call to useState during a render is tracked by position in a linked list (called "fiber hooks"). React knows which state belongs to which useState call because React rules enforce that hooks are always called in the same order — which is why you can never put useState inside an if block.
</DeepDive>
```

- [ ] **Step 9: Build both portals**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && pnpm turbo run build --filter=react-portal --filter=spfx-portal
```
Expected: both build successfully. The react-portal `out/` should include `labs/`, `labs/build-counter/`, `labs/todo-list/`, `labs/useeffect-timer/`. The spfx-portal `out/` should include `labs/`, `labs/scaffold-webpart/`, `labs/pnpjs-list-data/`, `labs/deploy-sppkg/`.

- [ ] **Step 10: Commit and push**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn && git add apps/spfx-portal apps/react-portal && git commit -m "feat: add SPFx labs, update MDX components with Phase 2 blocks" && git push origin main
```

Expected: GitHub Actions workflow triggers, builds both portals, and deploys to GitHub Pages. Verify at https://sudharsank.github.io/react-spfx-learn/react/labs/ and https://sudharsank.github.io/react-spfx-learn/spfx/labs/ once the workflow completes (~3 min).
