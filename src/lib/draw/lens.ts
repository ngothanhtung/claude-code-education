import type p5 from 'p5';
import { COL } from './colors';
import { LIGHT, add, drawRay, intersectLines, mul, sub, unit, type V } from './optics';
import { labelBox, pointLabel } from './scene';

export type LensType = 'hoitu' | 'phanky';

export interface ImageInfo {
  /** khoảng cách ảnh tới thấu kính (cm); null khi ảnh ở vô cực */
  dp: number | null;
  /** chiều cao ảnh (cm) */
  hp: number;
  real: boolean;
  /** ảnh cùng chiều với vật */
  upright: boolean;
}

/** Tính ảnh bằng tam giác đồng dạng (tương đương 1/f = 1/d + 1/d') */
export function computeImage(type: LensType, f: number, d: number, h: number): ImageInfo {
  if (type === 'phanky') {
    const dp = (d * f) / (d + f);
    return { dp, hp: (h * dp) / d, real: false, upright: true };
  }
  if (Math.abs(d - f) < 1e-9) return { dp: null, hp: Infinity, real: false, upright: false };
  if (d > f) {
    const dp = (d * f) / (d - f);
    return { dp, hp: (h * dp) / d, real: true, upright: false };
  }
  const dp = (d * f) / (f - d);
  return { dp, hp: (h * dp) / d, real: false, upright: true };
}

/** Tính chất ảnh bằng lời */
export function describeImage(type: LensType, f: number, d: number, img: ImageInfo): string {
  if (img.dp === null) return 'không cho ảnh (chùm tia ló song song, ảnh ở rất xa)';
  if (type === 'phanky') return 'ảnh ảo, cùng chiều, nhỏ hơn vật, nằm trong khoảng tiêu cự';
  if (!img.real) return 'ảnh ảo, cùng chiều, lớn hơn vật';
  const size = Math.abs(d - 2 * f) < 1e-9 ? 'bằng vật' : d > 2 * f ? 'nhỏ hơn vật' : 'lớn hơn vật';
  return `ảnh thật, ngược chiều, ${size}`;
}

export interface LensScene {
  type: LensType;
  f: number;
  d: number;
  h: number;
  t: number; // 0..3: tia 1, tia 2, ảnh
  lensX?: number;
  axisY?: number;
  /** px mỗi cm theo chiều ngang (tự tính nếu bỏ trống) */
  scale?: number;
  /** px mỗi cm theo chiều cao vật */
  vscale?: number;
  objectLabel?: string;
}

/** Vẽ thấu kính, trục chính, F, F', vật AB, hai tia đặc biệt và ảnh A'B' */
export function drawLensDiagram(p: p5, s: LensScene) {
  const lx = s.lensX ?? 400;
  const ay = s.axisY ?? 270;
  const img = computeImage(s.type, s.f, s.d, s.h);
  const leftNeed = Math.max(s.d, s.f, img.dp !== null && !img.real ? img.dp : 0);
  const rightNeed = Math.max(s.f * 1.3, img.real && img.dp !== null ? img.dp : 0);
  const sc = s.scale ?? Math.max(3, Math.min((lx - 50) / leftNeed, (790 - lx) / rightNeed, 14));
  const vs = s.vscale ?? 26;
  const X = (cm: number) => lx + cm * sc; // cm âm là phía trước thấu kính
  const Y = (cm: number) => ay - cm * vs;

  // trục chính
  p.stroke(COL.text);
  p.strokeWeight(1.5);
  p.line(10, ay, 790, ay);

  drawLens(p, lx, ay, s.type);

  // tiêu điểm
  for (const [x, name] of [[X(-s.f), 'F'], [X(s.f), "F'"]] as const) {
    p.noStroke();
    p.fill(COL.ink);
    p.circle(x, ay, 7);
    pointLabel(p, x, ay + 18, name, COL.ink, 14);
  }
  pointLabel(p, lx + 12, ay + 18, 'O', COL.text, 14);

  // vật AB
  const A: V = [X(-s.d), ay];
  const B: V = [X(-s.d), Y(s.h)];
  arrowUp(p, A, B, COL.a);
  pointLabel(p, A[0], ay + 18, 'A', COL.aText, 14);
  pointLabel(p, B[0], B[1] - 14, s.objectLabel ?? 'B', COL.aText, 14);

  const I: V = [lx, B[1]];
  const O: V = [lx, ay];
  const k1 = Math.min(1, Math.max(0, s.t));
  const k2 = Math.min(1, Math.max(0, s.t - 1));
  const k3 = Math.min(1, Math.max(0, s.t - 2));

  // tia 1: song song trục chính → qua F' (hội tụ) hoặc kéo dài qua F (phân kỳ)
  const dir1 = s.type === 'hoitu' ? unit(sub([X(s.f), ay], I)) : unit(sub(I, [X(-s.f), ay]));
  const dir2 = unit(sub(O, B));
  const far = (o: V, d: V) => add(o, mul(d, 900));
  drawRay(p, B, I, { progress: Math.min(1, k1 * 2) });
  if (k1 > 0.5) drawRay(p, I, far(I, dir1), { progress: (k1 - 0.5) * 2 });
  if (s.type === 'phanky' && k1 >= 1) drawRay(p, I, [X(-s.f), ay], { dashed: true, col: LIGHT, weight: 1.4, alpha: 0.7 });
  // tia 2: qua quang tâm truyền thẳng
  if (k2 > 0) drawRay(p, B, far(O, dir2), { progress: k2 });

  // ảnh
  if (k3 > 0 && img.dp !== null) {
    const Bp = intersectLines(I, dir1, O, dir2);
    if (Bp) {
      const Ap: V = [Bp[0], ay];
      const col = p.color(COL.b);
      col.setAlpha(255 * k3);
      if (!img.real) {
        // đường kéo dài của các tia ló gặp nhau tại ảnh ảo
        drawRay(p, I, Bp, { dashed: true, col: COL.muted, weight: 1.3, alpha: k3 });
        drawRay(p, O, Bp, { dashed: true, col: COL.muted, weight: 1.3, alpha: k3 });
      }
      arrowUp(p, Ap, Bp, col.toString(), !img.real);
      if (k3 >= 1) {
        pointLabel(p, Ap[0], ay + (Bp[1] > ay ? -18 : 18), "A'", COL.bText, 14);
        pointLabel(p, Bp[0], Bp[1] + (Bp[1] > ay ? 16 : -14), "B'", COL.bText, 14);
        if (Bp[0] < 0 || Bp[0] > 800 || Bp[1] < 0 || Bp[1] > 500) {
          labelBox(p, 400, 470, 'Ảnh ở ngoài khung hình (rất xa thấu kính)', COL.muted, 13);
        }
      }
    }
  }
  return img;
}

/** Thấu kính mỏng: hội tụ (mũi tên hướng ra), phân kỳ (mũi tên hướng vào) */
export function drawLens(p: p5, x: number, ay: number, type: LensType, half = 170) {
  p.noStroke();
  p.fill(221, 242, 241, 200);
  if (type === 'hoitu') {
    p.ellipse(x, ay, 30, half * 2);
  } else {
    p.beginShape();
    p.vertex(x - 16, ay - half);
    p.vertex(x + 16, ay - half);
    p.quadraticVertex(x + 2, ay, x + 16, ay + half);
    p.vertex(x - 16, ay + half);
    p.quadraticVertex(x - 2, ay, x - 16, ay - half);
    p.endShape(p.CLOSE);
  }
  p.stroke(COL.ink);
  p.strokeWeight(2.5);
  p.line(x, ay - half, x, ay + half);
  const tip = (y: number, up: boolean) => {
    const dy = up ? -10 : 10;
    p.line(x, y, x - 8, y - dy);
    p.line(x, y, x + 8, y - dy);
  };
  if (type === 'hoitu') {
    tip(ay - half, true);
    tip(ay + half, false);
  } else {
    tip(ay - half + 10, false);
    tip(ay + half - 10, true);
  }
}

/** Mũi tên vật/ảnh từ chân a đến đầu b */
export function arrowUp(p: p5, a: V, b: V, col: string, dashed = false) {
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  p.stroke(col);
  p.strokeWeight(3.5);
  if (dashed) ctx.setLineDash([6, 5]);
  p.line(a[0], a[1], b[0], b[1]);
  ctx.setLineDash([]);
  const up = b[1] < a[1] ? 1 : -1;
  p.noStroke();
  p.fill(col);
  p.triangle(b[0], b[1], b[0] - 7, b[1] + 12 * up, b[0] + 7, b[1] + 12 * up);
}
