import type p5 from 'p5';
import { COL } from './colors';

/**
 * Dụng cụ thí nghiệm Hóa học vẽ theo kiểu hình SGK: ống nghiệm, cốc thủy tinh, bình khí,
 * bọt khí, ngọn lửa, giấy quỳ. Các hàm đều thuần, nhận toạ độ canvas 800×500.
 */

export const GLASS_STROKE = '#7C8AA5';
export const LIQ = {
  water: '#CFE6F7',
  acid: '#E3EEF8',
  cuso4: '#7FB5E6',
  feso4: '#CFE7C9',
  agno3: '#EEF1F5',
  bromine: '#E9A23B',
  molten: '#F2A65A',
} as const;

/** Mức trong suốt cho một màu hex: "#RRGGBB" + alpha 0..1 */
export function withAlpha(hex: string, a: number): string {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  return hex + v;
}

/** Trộn hai màu hex theo tỉ lệ u (0 → a, 1 → b) */
export function mix(a: string, b: string, u: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * u).toString(16).padStart(2, '0')).join('');
}

/** Ống nghiệm thẳng đứng: (x, yTop) là miệng ống, level 0..1 là phần chất lỏng */
export function testTube(p: p5, x: number, yTop: number, h: number, w: number, level: number, liquid: string) {
  const r = w / 2;
  const yb = yTop + h - r;
  // chất lỏng
  if (level > 0) {
    const ly = yTop + h - level * h;
    p.noStroke();
    p.fill(liquid);
    p.rect(x - r + 2, Math.min(ly, yb), w - 4, Math.max(0, yb - ly));
    p.arc(x, yb, w - 4, w - 4, 0, Math.PI);
  }
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.line(x - r, yTop, x - r, yb);
  p.line(x + r, yTop, x + r, yb);
  p.arc(x, yb, w, w, 0, Math.PI);
  p.line(x - r - 4, yTop, x + r + 4, yTop);
}

/** Cốc thủy tinh: (x, yBottom) là tâm đáy cốc */
export function beaker(p: p5, x: number, yBottom: number, w: number, h: number, level: number, liquid: string) {
  const l = x - w / 2;
  if (level > 0) {
    p.noStroke();
    p.fill(liquid);
    p.rect(l + 2, yBottom - h * level, w - 4, h * level - 2, 0, 0, 6, 6);
  }
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.beginShape();
  p.vertex(l - 6, yBottom - h);
  p.vertex(l, yBottom - h + 8);
  p.vertex(l, yBottom - 6);
  p.quadraticVertex(l, yBottom, l + 6, yBottom);
  p.vertex(l + w - 6, yBottom);
  p.quadraticVertex(l + w, yBottom, l + w, yBottom - 6);
  p.vertex(l + w, yBottom - h);
  p.endShape();
  // vạch chia
  p.strokeWeight(1);
  for (let k = 1; k <= 3; k++) p.line(l + w - 16, yBottom - (h * k) / 4, l + w - 4, yBottom - (h * k) / 4);
}

/** Bình đựng khí miệng rộng, có nắp: (x, yBottom) tâm đáy */
export function gasJar(p: p5, x: number, yBottom: number, w: number, h: number, gas: string | null) {
  const l = x - w / 2;
  if (gas) {
    p.noStroke();
    p.fill(gas);
    p.rect(l + 2, yBottom - h + 14, w - 4, h - 16, 0, 0, 10, 10);
  }
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.beginShape();
  p.vertex(l + 10, yBottom - h);
  p.vertex(l + 10, yBottom - h + 12);
  p.vertex(l, yBottom - h + 26);
  p.vertex(l, yBottom - 10);
  p.quadraticVertex(l, yBottom, l + 10, yBottom);
  p.vertex(l + w - 10, yBottom);
  p.quadraticVertex(l + w, yBottom, l + w, yBottom - 10);
  p.vertex(l + w, yBottom - h + 26);
  p.vertex(l + w - 10, yBottom - h + 12);
  p.vertex(l + w - 10, yBottom - h);
  p.endShape();
  // lớp cát/nước dưới đáy
  p.noStroke();
  p.fill('#E9DFCF');
  p.rect(l + 3, yBottom - 12, w - 6, 9, 0, 0, 8, 8);
}

/** Bọt khí nổi lên trong vùng [x ± w/2] từ y0 lên y1; rate 0..1 là độ mạnh */
export function bubbles(p: p5, x: number, y0: number, y1: number, w: number, rate: number, seed = 0) {
  if (rate <= 0) return;
  const now = performance.now() / 1000;
  const count = Math.round(4 + rate * 14);
  p.noFill();
  p.stroke(255, 255, 255, 230);
  p.strokeWeight(1.5);
  for (let i = 0; i < count; i++) {
    const ph = (now * (0.5 + rate * 0.9) + (i * 0.618 + seed)) % 1;
    const bx = x + Math.sin(i * 12.9898 + seed) * (w / 2 - 6) + Math.sin(now * 3 + i) * 2;
    const by = y0 - (y0 - y1) * ph;
    const r = 3 + ((i * 7) % 4);
    p.circle(bx, by, r * 2);
  }
}

/** Ngọn lửa đèn cồn / bếp: (x, y) là chân ngọn lửa */
export function flame(p: p5, x: number, y: number, size: number, col = '#F28C28') {
  if (size <= 0) return;
  const t = performance.now() / 160;
  const h = size * (1 + 0.08 * Math.sin(t));
  p.noStroke();
  p.fill(withAlpha(col, 0.85));
  p.beginShape();
  p.vertex(x - size * 0.45, y);
  p.bezierVertex(x - size * 0.5, y - h * 0.5, x - size * 0.1, y - h * 0.7, x, y - h);
  p.bezierVertex(x + size * 0.1, y - h * 0.7, x + size * 0.5, y - h * 0.5, x + size * 0.45, y);
  p.endShape(p.CLOSE);
  p.fill(withAlpha('#FFE36E', 0.9));
  p.ellipse(x, y - h * 0.28, size * 0.36, h * 0.5);
}

/** Đèn cồn đặt dưới (x, yFlame) */
export function burner(p: p5, x: number, yFlame: number, lit: boolean) {
  p.noStroke();
  p.fill('#E3EEF8');
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2);
  p.ellipse(x, yFlame + 34, 70, 44);
  p.fill('#A7AFBF');
  p.rect(x - 9, yFlame + 4, 18, 12, 2);
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(x, yFlame + 4, x, yFlame - 2);
  if (lit) flame(p, x, yFlame, 34);
}

/** Mẩu giấy quỳ tím; màu đổi theo môi trường */
export const LITMUS = { tim: '#8E6BBF', do: '#D9443F', xanh: '#3D6FD8' } as const;

export function litmus(p: p5, x: number, y: number, col: string, label?: string) {
  p.noStroke();
  p.fill(col);
  p.rect(x - 9, y, 18, 54, 2);
  if (label) {
    p.fill(COL.text);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(12);
    p.textStyle(p.BOLD);
    p.text(label, x, y + 60);
    p.textStyle(p.NORMAL);
  }
}

/** Thanh chỉ số lượng chất (mol, g…) nằm ngang, có nhãn bên trái và giá trị bên phải */
export function amountBar(p: p5, x: number, y: number, w: number, frac: number, label: string, value: string, col: string, textCol: string) {
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.RIGHT, p.CENTER);
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.text(label, x - 10, y + 8);
  p.fill(COL.track);
  p.rect(x, y, w, 16, 8);
  p.fill(col);
  if (frac > 0) p.rect(x, y, w * Math.min(1, frac), 16, 8);
  p.fill(textCol);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(value, x + w + 10, y + 8);
  p.textStyle(p.NORMAL);
}
