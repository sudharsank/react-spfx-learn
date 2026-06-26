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
