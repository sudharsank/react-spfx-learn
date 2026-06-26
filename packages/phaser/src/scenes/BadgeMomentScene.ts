import Phaser from 'phaser';

export class BadgeMomentScene extends Phaser.Scene {
  constructor() { super({ key: 'BadgeMomentScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const badge = (this.game as any).__badgeEmoji ?? '🏅';

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
    const badgeText = this.add
      .text(W / 2, H / 2, badge, { fontSize: '56px' })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.2);
    this.tweens.add({ targets: badgeText, alpha: 1, scale: 1, duration: 500, ease: 'Back.easeOut' });
  }
}
