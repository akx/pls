import uniqueId from 'lodash/uniqueId';

function lerp(a, b, alpha) {
  return (b * alpha) + (a * (1 - alpha));
}

export default class Qscale {
  constructor(nClasses, rgb1, rgb2, opacity = 1) {
    this.id = uniqueId();
    this.classPrefix = `qsc${this.id}_`;
    this.nClasses = nClasses;
    this.rgb1 = rgb1;
    this.rgb2 = rgb2;
    this.opacity = opacity;
    this.styleTag = null;
  }

  getRules() {
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

  getClassName(value, min = 0, max = 1) {
    const scaledValue = (value - min) / (max - min);
    const classNum = Math.max(0, Math.min((this.nClasses - 1), Math.round(this.nClasses * scaledValue)));
    return `${this.classPrefix}${classNum}`;
  }

  install() {
    const style = document.createElement('style');
    style.id = `qscale${this.id}`;
    style.type = 'text/css';
    style.textContent = this.getRules().join('\n');
    document.head.appendChild(style);
    this.styleTag = style;
  }
}
