import type p5 from 'p5';
import { COL } from './colors';

export type Pt = readonly [number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** tiến độ của pha bắt đầu ở `start`, kéo dài 1 đơn vị thời gian */
export const phase = (t: number, start: number) => clamp01(t - start);
/** chuyển động mượt ở đầu và cuối */
export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/**
 * Đầu mũi tên tam giác: mũi ở (x, y), hướng theo góc `angle` (radian, 0 = sang phải, π/2 = xuống),
 * dài `size`, rộng mỗi bên `half`. Dùng chung cho mọi mũi tên trên canvas (vận tốc, lực, quá trình, trục).
 */
export function arrowHead(p: p5, x: number, y: number, angle: number, col: string, size = 10, half = size * 0.6) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const bx = x - c * size;
  const by = y - s * size;
  p.noStroke();
  p.fill(col);
  p.triangle(x, y, bx - s * half, by + c * half, bx + s * half, by - c * half);
}

export interface ArrowStyle {
  weight?: number;
  /** độ dài đầu mũi tên; 0 = không vẽ đầu */
  head?: number;
  /** 0..1: vẽ dần từ gốc, đầu mũi tên chỉ hiện khi đủ 1 */
  k?: number;
}

/** Mũi tên thẳng từ (x1, y1) đến mũi (x2, y2); thân dừng trước đầu mũi tên nên nét đậm không lòi ra */
export function arrow(p: p5, x1: number, y1: number, x2: number, y2: number, col: string, { weight = 3, head = 10, k = 1 }: ArrowStyle = {}) {
  if (k <= 0) return;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const body = Math.max(0, (k >= 1 ? len - head * 0.8 : len * k));
  p.stroke(col);
  p.strokeWeight(weight);
  p.line(x1, y1, x1 + Math.cos(a) * body, y1 + Math.sin(a) * body);
  if (k >= 1 && head > 0) arrowHead(p, x2, y2, a, col, head);
}

/** Xoay các điểm quanh tâm c một góc (radian) */
export function rotate(points: readonly Pt[], c: Pt, angle: number): Pt[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(([x, y]) => {
    const dx = x - c[0];
    const dy = y - c[1];
    return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
  });
}

/** Đa giác tô màu + viền */
export function poly(p: p5, points: readonly Pt[], fillCol: string | null, strokeCol: string | null, weight = 2) {
  if (fillCol) p.fill(fillCol);
  else p.noFill();
  if (strokeCol) {
    p.stroke(strokeCol);
    p.strokeWeight(weight);
  } else p.noStroke();
  p.strokeJoin(p.ROUND);
  p.beginShape();
  for (const [x, y] of points) p.vertex(x, y);
  p.endShape(p.CLOSE);
}

/** Đa giác viền nét đứt */
export function dashedPoly(p: p5, points: readonly Pt[], col: string = COL.muted) {
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.setLineDash([6, 6]);
  poly(p, points, null, col, 1.5);
  ctx.setLineDash([]);
}

/** Ký hiệu góc vuông tại chân đường cao (đường cao đi lên, đáy nằm ngang) */
export function rightAngle(p: p5, x: number, y: number, size = 10, toRight = true) {
  const d = toRight ? size : -size;
  p.noFill();
  p.stroke(COL.ink);
  p.strokeWeight(1.5);
  p.line(x, y - size, x + d, y - size);
  p.line(x + d, y - size, x + d, y);
}

/** Chú thích bước hiện tại ở trên cùng canvas */
export function caption(p: p5, text: string, y = 34) {
  p.noStroke();
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(18);
  p.textStyle(p.BOLD);
  p.text(text, 400, y);
  p.textStyle(p.NORMAL);
}

/** Dòng công thức lớn ở cuối canvas */
export function formulaLine(p: p5, text: string, y = 456) {
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(26);
  p.textStyle(p.BOLD);
  p.text(text, 400, y);
  p.textStyle(p.NORMAL);
}

export const TINT = {
  a: '#F9D3D1', // nền mảnh gốc (đỏ nhạt)
  b: '#CDEFEA', // nền mảnh được xoay (xanh nhạt)
  ink: '#E4DEF7',
} as const;
