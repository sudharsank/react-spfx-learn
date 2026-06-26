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
