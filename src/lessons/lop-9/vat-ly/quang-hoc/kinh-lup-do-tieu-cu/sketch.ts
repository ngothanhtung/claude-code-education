import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { arrowUp, drawLens, drawLensDiagram } from '@/lib/draw/lens';
import { LIGHT, drawRay } from '@/lib/draw/optics';
import { labelBox } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

// ------------------------------------------------------------
// Kính lúp: vật trong khoảng tiêu cự, mắt đặt sau kính
// ------------------------------------------------------------
export function drawMagnifier(p: p5, s: { f: number; d: number; t: number; G: number }) {
  p.background(255);
  drawLensDiagram(p, { type: 'hoitu', f: s.f, d: s.d, h: 1, t: s.t, lensX: 470, scale: 230 / (s.f * 1.15), vscale: 34 });
  drawEye(p, 700, 270);
  if (s.t <= 0) caption(p, 'Đặt vật nhỏ trong khoảng tiêu cự của kính lúp (d < f)');
  else if (s.t < 2) caption(p, 'Hai tia ló đi ra loe rộng, không gặp nhau sau kính');
  else caption(p, `Mắt nhìn thấy ảnh ảo, cùng chiều, lớn hơn vật; G = 25 : f = ${fmt(s.G)}x`);
}

function drawEye(p: p5, x: number, y: number) {
  p.noFill();
  p.stroke(COL.text);
  p.strokeWeight(2.5);
  p.arc(x + 30, y, 60, 46, Math.PI * 0.62, Math.PI * 1.38);
  p.noStroke();
  p.fill(COL.text);
  p.circle(x + 10, y, 14);
  p.fill(255);
  p.circle(x + 8, y - 3, 4);
  labelBox(p, x + 24, y + 40, 'mắt', COL.muted, 12);
}

// ------------------------------------------------------------
// Đo tiêu cự trên băng quang học (vật – thấu kính – màn)
// ------------------------------------------------------------
const B0 = 60; // vị trí vật (0 cm)
const PX = 6.6; // px mỗi cm trên băng
const AXIS = 250;
const H_OBJ = 3; // cm
const VS = 22; // px mỗi cm chiều cao

export interface BenchScene {
  f: number; // tiêu cự thật (ẩn với học sinh)
  d: number;
  dp: number;
  t: number;
}

export function benchState(f: number, d: number, dp: number) {
  const v = d > f ? (d * f) / (d - f) : null; // vị trí ảnh thật
  const sharp = v !== null && Math.abs(dp - v) < 0.5;
  const equal = sharp && d === dp;
  return { v, sharp, equal };
}

export function drawBench(p: p5, s: BenchScene) {
  p.background(255);
  const { v, sharp, equal } = benchState(s.f, s.d, s.dp);
  const lensX = B0 + s.d * PX;
  const screenX = lensX + s.dp * PX;

  // băng quang học có vạch chia cm
  p.noStroke();
  p.fill('#3A4152');
  p.rect(40, 400, 730, 16, 4);
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(11);
  for (let cm = 0; cm <= 105; cm += 5) {
    const x = B0 + cm * PX;
    if (x > 765) break;
    p.stroke(COL.text);
    p.strokeWeight(cm % 10 === 0 ? 1.6 : 1);
    p.line(x, 386, x, cm % 10 === 0 ? 400 : 394);
    if (cm % 10 === 0) {
      p.noStroke();
      p.text(String(cm), x, 422);
    }
  }

  // trục
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  p.stroke('#C9D2E3');
  p.strokeWeight(1);
  ctx.setLineDash([4, 6]);
  p.line(B0 - 20, AXIS, 780, AXIS);
  ctx.setLineDash([]);

  // vật sáng (mũi tên) trên giá
  p.stroke(COL.muted);
  p.strokeWeight(3);
  p.line(B0, AXIS, B0, 386);
  arrowUp(p, [B0, AXIS], [B0, AXIS - H_OBJ * VS], COL.a);
  labelBox(p, B0, 120, 'vật sáng', COL.aText, 12);

  // thấu kính trên giá
  p.stroke(COL.muted);
  p.strokeWeight(3);
  p.line(lensX, AXIS + 110, lensX, 386);
  drawLens(p, lensX, AXIS, 'hoitu', 110);
  labelBox(p, lensX, 120, 'thấu kính', COL.ink, 12);

  // màn chắn
  p.noStroke();
  p.fill('#EEF1F7');
  p.rect(screenX - 6, AXIS - 120, 12, 240, 3);
  p.stroke(COL.muted);
  p.strokeWeight(3);
  p.line(screenX, AXIS + 120, screenX, 386);
  labelBox(p, screenX, 120, 'màn', COL.muted, 12);

  // chùm sáng từ đầu vật qua thấu kính tới màn
  const k = Math.min(1, Math.max(0, s.t));
  if (k > 0) {
    const top: [number, number] = [B0, AXIS - H_OBJ * VS];
    for (const yy of [AXIS - 100, AXIS, AXIS + 100]) {
      drawRay(p, top, [lensX, yy], { progress: Math.min(1, k * 2), weight: 1.4, alpha: 0.7, arrow: false });
      if (k > 0.5 && v !== null) {
        // tia ló hội tụ về ảnh của đầu vật, dừng ở màn
        const imgY = AXIS + H_OBJ * VS * (v / s.d);
        const tScreen = (screenX - lensX) / (v * PX);
        const endY = yy + (imgY - yy) * tScreen;
        drawRay(p, [lensX, yy], [screenX, endY], { progress: (k - 0.5) * 2, weight: 1.4, alpha: 0.7, arrow: false });
      }
    }
  }

  // ảnh trên màn: rõ nét nếu màn đúng vị trí ảnh, mờ nếu lệch
  if (v !== null) {
    const m = v / s.d;
    const blur = Math.min(40, (Math.abs(s.dp - v) / v) * 120);
    const hImg = Math.min(110, H_OBJ * VS * m);
    for (let j = 0; j < (blur > 1 ? 7 : 1); j++) {
      const off = blur > 1 ? (j - 3) * (blur / 6) : 0;
      const col = p.color(COL.a);
      col.setAlpha(blur > 1 ? 50 : 255);
      p.stroke(col);
      p.strokeWeight(blur > 1 ? 6 : 3.5);
      p.line(screenX - 1, AXIS + off * 0.3, screenX - 1, AXIS + hImg + off);
    }
    labelBox(p, screenX + 54, AXIS + 40, sharp ? (equal ? 'rõ nét, bằng vật' : 'rõ nét') : 'ảnh mờ', sharp ? COL.bText : COL.restText, 12);
  } else {
    labelBox(p, screenX + 60, AXIS, 'không hứng được ảnh', COL.restText, 12);
  }

  // số đo d, d'
  p.stroke(COL.ink);
  p.strokeWeight(1.4);
  p.line(B0, 374, lensX, 374);
  p.line(lensX, 374, screenX, 374);
  labelBox(p, (B0 + lensX) / 2, 374, `d = ${s.d} cm`, COL.aText, 13);
  labelBox(p, (lensX + screenX) / 2, 374, `d' = ${s.dp} cm`, COL.bText, 13);

  p.noStroke();
  p.fill(LIGHT);
  if (equal) caption(p, `Ảnh rõ nét và cao bằng vật: d = d' = 2f`);
  else if (sharp) caption(p, 'Ảnh đã rõ nét nhưng chưa bằng vật: dịch thấu kính và màn tiếp');
  else caption(p, 'Dịch thấu kính và màn cho tới khi ảnh rõ nét và cao bằng vật');
}
