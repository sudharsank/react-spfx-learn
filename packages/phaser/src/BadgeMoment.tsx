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
        scene: new BadgeMomentScene(),
      });

      // Store badge on game object for scene to access
      (gameRef.current as any).__badgeEmoji = badge;

      // Auto-close after 2s
      setTimeout(() => {
        if (!destroyed) onDone();
      }, 2000);
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [badge, onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onDone}
    >
      <div style={{ width: 280, height: 200 }} />
    </div>
  );
}
