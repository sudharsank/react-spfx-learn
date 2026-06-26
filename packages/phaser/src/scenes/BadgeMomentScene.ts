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
