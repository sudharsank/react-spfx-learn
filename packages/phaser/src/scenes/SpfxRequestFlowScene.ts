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
