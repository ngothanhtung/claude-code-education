import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import {
  GLASS, LIGHT, add, angleArc, dot, drawRay, hitSegment, intersectLines, mul, normalLine, reflect, refract, rotV, sub,
  type V,
} from '@/lib/draw/optics';
import { labelBox } from '@/lib/draw/scene';
import { deg } from '@/lib/format';

const APEX: V = [370, 110];
const SIDE = 300;

/** Bảy màu (chiết suất đã phóng đại để dễ thấy sự tán sắc) */
export const SPECTRUM: [string, string, number][] = [
  ['đỏ', '#E53935', 1.47],
  ['da cam', '#FB8C00', 1.485],
  ['vàng', '#F2C200', 1.5],
  ['lục', '#43A047', 1.515],
  ['lam', '#1E88E5', 1.53],
  ['chàm', '#3949AB', 1.545],
  ['tím', '#8E24AA', 1.56],
];

export function prismGeometry(A: number) {
  const h = (A * Math.PI) / 360;
  const s = Math.sin(h);
  const c = Math.cos(h);
  const BL: V = add(APEX, mul([-s, c], SIDE));
  const BR: V = add(APEX, mul([s, c], SIDE));
  const faces: { a: V; b: V; out: V; name: string }[] = [
    { a: APEX, b: BL, out: [-c, -s], name: 'mặt bên thứ nhất' },
    { a: APEX, b: BR, out: [c, -s], name: 'mặt bên thứ hai' },
    { a: BL, b: BR, out: [0, 1], name: 'đáy' },
  ];
  return { BL, BR, faces, inward: [c, s] as V };
}

export interface Trace {
  src: V;
  entry: V;
  inside: V[]; // các điểm gặp mặt trong lăng kính
  exitDir: V | null;
  dIn: V;
  r1: number; // góc khúc xạ ở mặt thứ nhất (độ)
  i2: number; // góc tới ở mặt ló (độ)
  e: number; // góc ló (độ)
  D: number; // góc lệch (độ)
  tir: boolean; // có phản xạ toàn phần bên trong
  exitFace: string;
}

const toDeg = (r: number) => (r * 180) / Math.PI;

/** Dò đường đi của tia sáng qua lăng kính góc chiết quang A, chiết suất n, góc tới i1 */
export function tracePrism(A: number, n: number, i1: number): Trace {
  const { faces, inward } = prismGeometry(A);
  const entry = add(APEX, mul(sub(faces[0].b, APEX), 0.55));
  const dIn = rotV(inward, -(i1 * Math.PI) / 180);
  const src = sub(entry, mul(dIn, 240));
  let d = refract(dIn, faces[0].out, 1 / n) as V;
  const r1 = toDeg(Math.acos(dot(d, inward)));
  let o = entry;
  const inside: V[] = [];
  let tir = false;
  for (let k = 0; k < 4; k++) {
    let best: { t: number; f: (typeof faces)[number] } | null = null;
    for (const f of faces) {
      const t = hitSegment(o, d, f.a, f.b);
      if (t !== null && t > 1 && (!best || t < best.t)) best = { t, f };
    }
    if (!best) break;
    const hit = add(o, mul(d, best.t));
    inside.push(hit);
    const inner: V = [-best.f.out[0], -best.f.out[1]];
    const out = refract(d, inner, n);
    const i2 = toDeg(Math.acos(dot(d, best.f.out)));
    if (out) {
      const e = toDeg(Math.acos(dot(out, best.f.out)));
      const D = toDeg(Math.acos(Math.max(-1, Math.min(1, dot(out, dIn)))));
      return { src, entry, inside, exitDir: out, dIn, r1, i2, e, D, tir, exitFace: best.f.name };
    }
    tir = true;
    d = reflect(d, best.f.out);
    o = hit;
  }
  return { src, entry, inside, exitDir: null, dIn, r1, i2: 0, e: 0, D: 0, tir, exitFace: '' };
}

export interface PrismScene {
  white: boolean;
  A: number;
  i1: number;
  n: number;
  t: number; // 0..3
  done: boolean;
}

export function drawPrism(p: p5, s: PrismScene) {
  p.background(255);
  const { BL, BR } = prismGeometry(s.A);

  // lăng kính
  p.fill(GLASS);
  p.stroke('#7FA7C9');
  p.strokeWeight(2);
  p.triangle(APEX[0], APEX[1], BL[0], BL[1], BR[0], BR[1]);
  angleArc(p, APEX, Math.atan2(BL[1] - APEX[1], BL[0] - APEX[0]), Math.atan2(BR[1] - APEX[1], BR[0] - APEX[0]), 34, '', COL.ink);
  labelBox(p, APEX[0], APEX[1] - 18, `A = ${s.A}°`, COL.ink, 13);
  labelBox(p, (BL[0] + BR[0]) / 2, BL[1] + 18, 'đáy', COL.muted, 13);

  const k1 = Math.min(1, Math.max(0, s.t));
  const k2 = Math.min(1, Math.max(0, s.t - 1));
  const k3 = Math.min(1, Math.max(0, s.t - 2));

  // màn hứng bên phải
  p.stroke('#B9C4DA');
  p.strokeWeight(6);
  p.line(775, 120, 775, 470);

  const rays = s.white ? SPECTRUM : [['', LIGHT, s.n] as [string, string, number]];
  let main: Trace | null = null;
  for (const [, col, n] of rays) {
    const tr = tracePrism(s.A, n, s.i1);
    if (!main || !s.white) main = tr;
    if (k2 > 0) {
      let a = tr.entry;
      for (const b of tr.inside) {
        drawRay(p, a, b, { col, progress: k2, weight: s.white ? 1.6 : 2.5, arrow: !s.white });
        a = b;
      }
      if (k3 > 0 && tr.exitDir) {
        const last = tr.inside[tr.inside.length - 1];
        const tScreen = tr.exitDir[0] > 0 ? (775 - last[0]) / tr.exitDir[0] : 260;
        const end = add(last, mul(tr.exitDir, Math.min(tScreen, 420)));
        drawRay(p, last, end, { col, progress: k3, weight: s.white ? 2 : 2.5, arrow: !s.white });
      }
    }
  }
  if (!main) return;

  // tia tới (ánh sáng trắng vẽ màu xám)
  drawRay(p, main.src, main.entry, { col: s.white ? '#8A93A6' : LIGHT, progress: k1, weight: s.white ? 4 : 2.5 });

  // pháp tuyến tại điểm tới
  if (k1 >= 1) {
    const nIn = prismGeometry(s.A).inward;
    normalLine(p, main.entry, nIn, 60);
  }

  // góc lệch D: kéo dài tia tới và tia ló
  if (s.done && main.exitDir && !s.white) {
    const ext = add(main.entry, mul(main.dIn, 360));
    drawRay(p, main.entry, ext, { col: COL.muted, dashed: true, weight: 1.3, arrow: false });
    const last = main.inside[main.inside.length - 1];
    const X = intersectLines(main.entry, main.dIn, last, main.exitDir);
    if (X) {
      angleArc(p, X, Math.atan2(main.dIn[1], main.dIn[0]), Math.atan2(main.exitDir[1], main.exitDir[0]), 54, 'D', COL.ink);
    }
  }

  if (s.t <= 0) caption(p, s.white ? 'Chiếu một chùm ánh sáng trắng tới mặt bên lăng kính' : 'Chiếu tia sáng tới mặt bên thứ nhất của lăng kính');
  else if (s.t < 2) caption(p, 'Vào lăng kính: tia khúc xạ lệch lại gần pháp tuyến');
  else if (!s.done) caption(p, 'Ra khỏi lăng kính: tia ló lệch xa pháp tuyến');
  else if (s.white) caption(p, 'Ánh sáng trắng bị tách thành dải màu: tím lệch nhiều nhất, đỏ ít nhất');
  else if (main.exitDir) caption(p, `Tia ló bị lệch về phía đáy một góc D ≈ ${deg(main.D)}`);
  else caption(p, 'Tia sáng bị phản xạ toàn phần bên trong lăng kính');
}
