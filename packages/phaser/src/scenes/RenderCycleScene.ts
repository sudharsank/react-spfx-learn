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
