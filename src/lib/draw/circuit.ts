import type p5 from 'p5';
import { COL } from './colors';
import type { Pt } from './geometry';
import { labelBox } from './scene';

/**
 * Ký hiệu mạch điện theo SGK Việt Nam: điện trở (hình chữ nhật), nguồn điện (vạch dài +, vạch ngắn −),
 * ampe kế / vôn kế (vòng tròn có chữ A / V), khóa K, bóng đèn (vòng tròn có dấu ×).
 * Linh kiện vẽ nền trắng để "cắt" dây dẫn đi qua; vì vậy vẽ dây và hạt điện tích trước, linh kiện sau.
 */

export const WIRE = COL.text;
export const FLOW = '#E8A23A';

export function wire(p: p5, pts: readonly Pt[], weight = 2.5) {
  p.noFill();
  p.stroke(WIRE);
  p.strokeWeight(weight);
  p.strokeJoin(p.MITER);
  p.beginShape();
  for (const [x, y] of pts) p.vertex(x, y);
  p.endShape();
}

function segLengths(pts: readonly Pt[]) {
  const L: number[] = [];
  for (let i = 1; i < pts.length; i++) L.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return L;
}

export function pathLength(pts: readonly Pt[]) {
  return segLengths(pts).reduce((a, b) => a + b, 0);
}

export function pointAt(pts: readonly Pt[], s: number): Pt {
  const L = segLengths(pts);
  let rest = s;
  for (let i = 0; i < L.length; i++) {
    if (rest <= L[i]) {
      const u = L[i] === 0 ? 0 : rest / L[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    }
    rest -= L[i];
  }
  return pts[pts.length - 1];
}

/** Hạt điện tích chạy dọc dây theo chiều dòng điện; offset là quãng đường (px) đã đi */
export function flow(p: p5, pts: readonly Pt[], offset: number, spacing = 26, col: string = FLOW) {
  const total = pathLength(pts);
  const s0 = ((offset % spacing) + spacing) % spacing;
  p.noStroke();
  p.fill(col);
  for (let s = s0; s < total; s += spacing) {
    const [x, y] = pointAt(pts, s);
    p.circle(x, y, 7);
  }
}

/** Quãng đường hạt đi được tại thời điểm hiện tại, tốc độ tỉ lệ cường độ dòng điện */
export const flowOffset = (current: number, k = 45) => (performance.now() / 1000) * Math.min(170, Math.max(12, current * k));

/** Điện trở: hình chữ nhật, nhãn đặt phía trên (hoặc bên trái nếu nằm dọc) */
export function resistor(p: p5, x: number, y: number, label: string, o: { vertical?: boolean; w?: number; col?: string } = {}) {
  const w = o.w ?? 66;
  const h = 22;
  p.push();
  p.translate(x, y);
  if (o.vertical) p.rotate(p.HALF_PI);
  p.rectMode(p.CENTER);
  p.fill(255);
  p.stroke(o.col ?? COL.ink);
  p.strokeWeight(2.5);
  p.rect(0, 0, w, h, 2);
  p.pop();
  if (o.vertical) labelBox(p, x - 46, y, label, o.col ?? COL.ink, 14);
  else labelBox(p, x, y - 26, label, o.col ?? COL.ink, 14);
}

/** Nguồn điện trên dây dọc: cực dương (vạch dài, mảnh) ở trên, cực âm (vạch ngắn, đậm) ở dưới */
export function battery(p: p5, x: number, y: number, label?: string) {
  p.noStroke();
  p.fill(255);
  p.rect(x - 22, y - 8, 44, 16);
  p.stroke(WIRE);
  p.strokeWeight(2);
  p.line(x - 20, y - 7, x + 20, y - 7);
  p.strokeWeight(6);
  p.line(x - 10, y + 7, x + 10, y + 7);
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.text('+', x + 30, y - 12);
  p.text('−', x + 30, y + 12);
  p.textStyle(p.NORMAL);
  if (label) labelBox(p, x - 54, y, label, COL.ink, 14);
}

/** Ampe kế (A), vôn kế (V), điện kế (G): vòng tròn có chữ; số chỉ đặt dưới hoặc trên */
export function meter(
  p: p5, x: number, y: number, letter: string, reading?: string,
  pos: 'below' | 'above' = 'below', col: string = COL.ink,
) {
  p.fill(255);
  p.stroke(col);
  p.strokeWeight(2.5);
  p.circle(x, y, 40);
  p.noStroke();
  p.fill(col);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(18);
  p.textStyle(p.BOLD);
  p.text(letter, x, y + 1);
  p.textStyle(p.NORMAL);
  if (reading) labelBox(p, x, pos === 'below' ? y + 36 : y - 36, reading, col, 14);
}

/** Bóng đèn: vòng tròn có dấu ×, quầng sáng theo độ sáng 0..1 */
export function lamp(p: p5, x: number, y: number, glow: number, r = 18) {
  if (glow > 0) {
    p.noStroke();
    for (let k = 4; k >= 1; k--) {
      p.fill(255, 214, 80, 40 * glow);
      p.circle(x, y, r * 2 + k * 18 * glow);
    }
  }
  p.fill(glow > 0 ? p.color(255, 236, 150) : p.color(255));
  p.stroke(WIRE);
  p.strokeWeight(2.5);
  p.circle(x, y, r * 2);
  const d = r * 0.7;
  p.line(x - d, y - d, x + d, y + d);
  p.line(x - d, y + d, x + d, y - d);
}

/** Khóa K trên dây ngang từ x1 đến x2; closed 0..1 (1 là đóng) */
export function switchK(p: p5, x1: number, x2: number, y: number, closed: number) {
  p.noStroke();
  p.fill(255);
  p.rect(x1, y - 4, x2 - x1, 8);
  const ang = -(1 - Math.min(1, Math.max(0, closed))) * 0.55;
  const len = x2 - x1;
  p.stroke(WIRE);
  p.strokeWeight(2.5);
  p.line(x1, y, x1 + Math.cos(ang) * len, y + Math.sin(ang) * len);
  p.fill(255);
  p.circle(x1, y, 8);
  p.circle(x2, y, 8);
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('K', (x1 + x2) / 2, y + 20);
  p.textStyle(p.NORMAL);
}

/** Chấm nút mạch (điểm phân nhánh) */
export function node(p: p5, x: number, y: number) {
  p.noStroke();
  p.fill(WIRE);
  p.circle(x, y, 9);
}
