import type p5 from 'p5';
import { COL } from './colors';
import { arrowHead } from './geometry';

/**
 * Hình học tia sáng trên mặt phẳng (tọa độ màn hình, y hướng xuống).
 * Dùng chung cho các bài quang học.
 */
export type V = readonly [number, number];

export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
export const len = (a: V) => Math.hypot(a[0], a[1]);
export const unit = (a: V): V => mul(a, 1 / len(a));
export const fromAngle = (rad: number): V => [Math.cos(rad), Math.sin(rad)];
export const rotV = (a: V, rad: number): V => [
  a[0] * Math.cos(rad) - a[1] * Math.sin(rad),
  a[0] * Math.sin(rad) + a[1] * Math.cos(rad),
];

export const LIGHT = '#E5532B'; // màu tia sáng (đỏ cam như hình SGK)
export const WATER = '#DCEEFB';
export const GLASS = '#DDF2F1';

/**
 * Khúc xạ hướng d qua mặt có pháp tuyến nrm (hướng về phía tia tới), eta = n1 / n2.
 * Trả về null khi phản xạ toàn phần.
 */
export function refract(d: V, nrm: V, eta: number): V | null {
  const cosi = -dot(nrm, d);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  return unit(add(mul(d, eta), mul(nrm, eta * cosi - Math.sqrt(k))));
}

export function reflect(d: V, nrm: V): V {
  return sub(d, mul(nrm, 2 * dot(d, nrm)));
}

/** Giao của tia (o + t·d, t > 0) với đoạn thẳng ab; trả về t hoặc null */
export function hitSegment(o: V, d: V, a: V, b: V): number | null {
  const e = sub(b, a);
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(a, o);
  const t = (w[0] * e[1] - w[1] * e[0]) / den;
  const u = (w[0] * d[1] - w[1] * d[0]) / den;
  return t > 1e-6 && u >= -1e-9 && u <= 1 + 1e-9 ? t : null;
}

/** Giao của hai đường thẳng (vô hạn) p + s·u và q + t·v */
export function intersectLines(pt: V, u: V, q: V, v: V): V | null {
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(q, pt);
  const s = (w[0] * v[1] - w[1] * v[0]) / den;
  return add(pt, mul(u, s));
}

// ------------------------------------------------------------
// Vẽ
// ------------------------------------------------------------

/** Mũi tên nhỏ chỉ chiều truyền ở giữa đoạn */
function arrowAt(p: p5, at: V, dir: V, col: string, size = 9) {
  const d = unit(dir);
  arrowHead(p, at[0] + (d[0] * size) / 2, at[1] + (d[1] * size) / 2, Math.atan2(d[1], d[0]), col, size, size / 2);
}

export interface RayStyle {
  col?: string;
  weight?: number;
  dashed?: boolean;
  /** 0..1: phần đoạn đã vẽ (để làm hiệu ứng tia sáng truyền đi) */
  progress?: number;
  arrow?: boolean;
  alpha?: number;
}

/** Vẽ đoạn tia sáng a → b */
export function drawRay(p: p5, a: V, b: V, s: RayStyle = {}) {
  const k = s.progress ?? 1;
  if (k <= 0) return;
  const end = add(a, mul(sub(b, a), k));
  const col = p.color(s.col ?? LIGHT);
  col.setAlpha(255 * (s.alpha ?? 1));
  p.stroke(col);
  p.strokeWeight(s.weight ?? 2.5);
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  if (s.dashed) ctx.setLineDash([6, 5]);
  p.line(a[0], a[1], end[0], end[1]);
  ctx.setLineDash([]);
  if ((s.arrow ?? !s.dashed) && k > 0.55) {
    arrowAt(p, add(a, mul(sub(b, a), 0.5)), sub(b, a), col.toString());
  }
}

/** Cung đánh dấu góc giữa hai hướng (radian, chiều y xuống) quanh tâm c */
export function angleArc(p: p5, c: V, from: number, to: number, r: number, label: string, col: string = COL.ink) {
  let a1 = from;
  let a2 = to;
  if (a2 < a1) [a1, a2] = [a2, a1];
  if (a2 - a1 > Math.PI) [a1, a2] = [a2, a1 + 2 * Math.PI];
  p.noFill();
  p.stroke(col);
  p.strokeWeight(1.6);
  p.arc(c[0], c[1], 2 * r, 2 * r, a1, a2);
  const m = (a1 + a2) / 2;
  p.noStroke();
  p.fill(col);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text(label, c[0] + Math.cos(m) * (r + 16), c[1] + Math.sin(m) * (r + 16));
  p.textStyle(p.NORMAL);
}

/** Pháp tuyến nét đứt qua điểm tới */
export function normalLine(p: p5, c: V, dir: V, half = 150) {
  const d = unit(dir);
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  p.stroke(COL.muted);
  p.strokeWeight(1.4);
  ctx.setLineDash([5, 5]);
  p.line(c[0] - d[0] * half, c[1] - d[1] * half, c[0] + d[0] * half, c[1] + d[1] * half);
  ctx.setLineDash([]);
}

/** Nhãn môi trường ở góc vùng */
export function mediumLabel(p: p5, x: number, y: number, text: string, align: 'left' | 'right' = 'left') {
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(align === 'left' ? p.LEFT : p.RIGHT, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text(text, x, y);
  p.textStyle(p.NORMAL);
}

// ------------------------------------------------------------
// Cảnh tia sáng qua mặt phân cách nằm ngang (khúc xạ, phản xạ toàn phần)
// ------------------------------------------------------------
export const BOUNDARY_Y = 270;
const IX = 400;
const RAY_LEN = 210;

export interface BoundaryScene {
  /** môi trường phía dưới (nước, thủy tinh…) */
  lowerName: string;
  lowerFill: string;
  n: number;
  /** true: ánh sáng đi từ môi trường phía dưới ra không khí */
  fromBelow: boolean;
  i: number; // góc tới (độ)
  /** góc khúc xạ (độ) hoặc null nếu phản xạ toàn phần */
  r: number | null;
  /** 0..2: vẽ tia tới rồi tia khúc xạ, phản xạ */
  t: number;
  /** độ đậm của tia phản xạ và tia khúc xạ (0..1) */
  reflAlpha: number;
  refrAlpha: number;
  /** vẽ thêm tia ứng với góc tới hạn (độ) */
  critical?: number | null;
  showAngles: boolean;
}

export function drawBoundary(p: p5, s: BoundaryScene) {
  const I: V = [IX, BOUNDARY_Y];
  // vùng không khí và vùng môi trường
  p.noStroke();
  p.fill('#FFFFFF');
  p.rect(0, 0, 800, BOUNDARY_Y);
  p.fill(s.lowerFill);
  p.rect(0, BOUNDARY_Y, 800, 500 - BOUNDARY_Y);
  p.stroke('#7FA7C9');
  p.strokeWeight(2);
  p.line(0, BOUNDARY_Y, 800, BOUNDARY_Y);
  mediumLabel(p, 24, BOUNDARY_Y - 22, 'Không khí (n = 1)');
  mediumLabel(p, 24, BOUNDARY_Y + 24, `${s.lowerName} (n = ${String(s.n).replace('.', ',')})`);

  normalLine(p, I, [0, 1], 190);
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(12);
  p.text('pháp tuyến', IX + 6, BOUNDARY_Y - 185);

  const ir = (s.i * Math.PI) / 180;
  // hướng từ I về phía nguồn sáng, hướng tia khúc xạ, hướng tia phản xạ
  const up = s.fromBelow ? 1 : -1; // phía tia tới: -1 là phía trên
  const toSource: V = [-Math.sin(ir), up * Math.cos(ir)];
  const S = add(I, mul(toSource, RAY_LEN));
  const reflDir: V = [Math.sin(ir), up * Math.cos(ir)];

  const k1 = Math.min(1, Math.max(0, s.t));
  const k2 = Math.min(1, Math.max(0, s.t - 1));

  if (s.critical != null) {
    const cr = (s.critical * Math.PI) / 180;
    const C = add(I, mul([-Math.sin(cr), up * Math.cos(cr)], RAY_LEN));
    drawRay(p, C, I, { col: COL.ink, weight: 1.4, dashed: true, arrow: false });
    p.noStroke();
    p.fill(COL.ink);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(13);
    p.textStyle(p.BOLD);
    p.text(`i_gh = ${fmtDeg(s.critical)}`, C[0] - 6, C[1] + (s.fromBelow ? 14 : -14));
    p.textStyle(p.NORMAL);
  }

  drawRay(p, S, I, { progress: k1, weight: 3 });
  if (k2 > 0) {
    drawRay(p, I, add(I, mul(reflDir, RAY_LEN)), { progress: k2, alpha: s.reflAlpha, weight: 1 + 2 * s.reflAlpha });
    if (s.r != null && s.refrAlpha > 0.01) {
      const rr = (s.r * Math.PI) / 180;
      const refrDir: V = [Math.sin(rr), -up * Math.cos(rr)];
      drawRay(p, I, add(I, mul(refrDir, RAY_LEN)), { progress: k2, alpha: s.refrAlpha, weight: 1 + 2 * s.refrAlpha });
      if (s.showAngles && k2 >= 1 && s.r > 0.5) {
        const nAngle = up > 0 ? -Math.PI / 2 : Math.PI / 2; // pháp tuyến phía tia khúc xạ
        angleArc(p, I, nAngle, Math.atan2(refrDir[1], refrDir[0]), 46, 'r', COL.bText);
      }
    }
  }
  p.noStroke();
  p.fill(COL.ink);
  p.circle(I[0], I[1], 7);
  if (s.showAngles && k1 >= 1 && s.i > 0.5) {
    const nAngle = up > 0 ? Math.PI / 2 : -Math.PI / 2; // pháp tuyến phía tia tới
    angleArc(p, I, nAngle, Math.atan2(toSource[1], toSource[0]), 58, 'i', COL.aText);
  }
}

const fmtDeg = (a: number) => `${(Math.round(a * 10) / 10).toString().replace('.', ',')}°`;
