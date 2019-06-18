import uniqueId from 'lodash/uniqueId';

function lerp(a: number, b: number, alpha: number) {
  return b * alpha + a * (1 - alpha);
}

export type RGB = [number, number, number];

export default class Qscale {
  private id: string;
  private classPrefix: string;
  private nClasses: number;
  private rgb1: RGB;
  private rgb2: RGB;
  private opacity: number;
  private styleTag: HTMLStyleElement | undefined;

  constructor(nClasses: number, rgb1: RGB, rgb2: RGB, opacity: number = 1) {
    this.id = uniqueId();
    this.classPrefix = `qsc${this.id}_`;
    this.nClasses = nClasses;
    this.rgb1 = rgb1;
    this.rgb2 = rgb2;
    this.opacity = opacity;
  }

  private getRules() {
    const rules = [];
    const [r1, g1, b1] = this.rgb1;
    const [r2, g2, b2] = this.rgb2;
    const n = this.nClasses;
    for (let i = 0; i < n; i += 1) {
      const alpha = i / (n - 1);
      const r = lerp(r1, r2, alpha);
      const g = lerp(g1, g2, alpha);
      const b = lerp(b1, b2, alpha);
      rules.push(`.${this.classPrefix}${i} {
          background: rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${this.opacity});
        }`);
    }
    return rules;
  }

  public getClassName(value: number, min = 0, max = 1) {
    const scaledValue = (value - min) / (max - min);
    const classNum = Math.max(0, Math.min(this.nClasses - 1, Math.round(this.nClasses * scaledValue)));
    return `${this.classPrefix}${classNum}`;
  }

  public install() {
    const style = document.createElement('style');
    style.id = `qscale${this.id}`;
    style.type = 'text/css';
    style.textContent = this.getRules().join('\n');
    document.head.appendChild(style);
    this.styleTag = style;
  }
}
