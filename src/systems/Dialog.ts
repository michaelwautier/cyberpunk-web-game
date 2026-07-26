import Phaser from 'phaser';
import { DialogTree, DialogNode } from '../data/dialogs';

const BOX_X = 8;
const BOX_Y = 200;
const BOX_W = 464;
const BOX_H = 112;
const TEXT_X = 76;
const TEXT_W = 380;
const TYPE_MS = 22;

/**
 * Bottom-of-screen dialog box: typewriter text, a speaker portrait, and
 * branching choices. Drives itself from a DialogTree; the owning scene feeds
 * it advance/navigation input and gates player movement while it is open.
 */
export class Dialog {
  private container: Phaser.GameObjects.Container;
  private portrait: Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private prompt: Phaser.GameObjects.Text;

  private tree: DialogTree = {};
  private node: DialogNode | null = null;
  private full = '';
  private shown = 0;
  private typing = false;
  private typeEvent?: Phaser.Time.TimerEvent;
  private cursor = 0;
  private onClose: (() => void) | null = null;

  constructor(private scene: Phaser.Scene) {
    const g = scene.add.graphics();
    g.fillStyle(0x0b0b16, 0.96);
    g.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);
    g.lineStyle(1, 0x34ffd6, 1);
    g.strokeRect(BOX_X + 0.5, BOX_Y + 0.5, BOX_W - 1, BOX_H - 1);

    const portraitBg = scene.add.graphics();
    portraitBg.fillStyle(0x151527, 1);
    portraitBg.fillRect(16, 210, 52, 52);
    portraitBg.lineStyle(1, 0x2a2a44, 1);
    portraitBg.strokeRect(16.5, 210.5, 51, 51);

    this.portrait = scene.add.image(42, 236, '__DEFAULT').setScale(3);

    this.nameText = scene.add.text(TEXT_X, 208, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#34ffd6',
    });

    this.bodyText = scene.add.text(TEXT_X, 226, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#e6e6f0',
      wordWrap: { width: TEXT_W },
      lineSpacing: 2,
    });

    this.choiceTexts = [0, 1, 2].map((i) =>
      scene.add.text(TEXT_X, 262 + i * 14, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9a9ac0',
      }),
    );

    this.prompt = scene.add
      .text(BOX_X + BOX_W - 12, BOX_Y + BOX_H - 12, '▾', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#34ffd6',
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(0, 0, [
        g,
        portraitBg,
        this.portrait,
        this.nameText,
        this.bodyText,
        ...this.choiceTexts,
        this.prompt,
      ])
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    scene.tweens.add({
      targets: this.prompt,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  get isOpen() {
    return this.container.visible;
  }

  start(tree: DialogTree, name: string, portraitKey: string, onClose: () => void) {
    this.tree = tree;
    this.onClose = onClose;
    this.nameText.setText(name);
    this.portrait.setTexture(portraitKey);
    this.container.setVisible(true);
    this.goto('start');
  }

  /** Space / E / Enter. */
  advance() {
    if (!this.node) return;
    if (this.typing) {
      this.finishTyping();
      return;
    }
    const choices = this.node.choices;
    if (choices && choices.length) {
      this.goto(choices[this.cursor].goto);
      return;
    }
    this.goto(this.node.goto);
  }

  /** Up / Down while choices are visible. */
  moveCursor(delta: number) {
    if (this.typing || !this.node?.choices) return;
    const n = this.node.choices.length;
    this.cursor = (this.cursor + delta + n) % n;
    this.renderChoices();
  }

  private goto(id?: string) {
    const next = id ? this.tree[id] : undefined;
    if (!next) {
      this.close();
      return;
    }
    this.node = next;
    this.cursor = 0;
    this.full = next.text;
    this.shown = 0;
    this.typing = true;
    this.bodyText.setText('');
    this.renderChoices();
    this.prompt.setVisible(false);

    this.typeEvent?.remove();
    this.typeEvent = this.scene.time.addEvent({
      delay: TYPE_MS,
      repeat: this.full.length - 1,
      callback: () => {
        this.shown++;
        this.bodyText.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) this.finishTyping();
      },
    });
  }

  private finishTyping() {
    this.typeEvent?.remove();
    this.typing = false;
    this.shown = this.full.length;
    this.bodyText.setText(this.full);
    this.renderChoices();
    this.prompt.setVisible(!this.node?.choices);
  }

  private renderChoices() {
    const choices = (!this.typing && this.node?.choices) || [];
    this.choiceTexts.forEach((t, i) => {
      const c = choices[i];
      if (!c) {
        t.setText('');
        return;
      }
      const selected = i === this.cursor;
      t.setText(`${selected ? '▸ ' : '  '}${c.label}`);
      t.setColor(selected ? '#ffb43f' : '#9a9ac0');
    });
  }

  private close() {
    this.typeEvent?.remove();
    this.container.setVisible(false);
    this.node = null;
    const cb = this.onClose;
    this.onClose = null;
    cb?.();
  }
}
